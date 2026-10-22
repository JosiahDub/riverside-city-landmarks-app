import React, { useState, useMemo, useEffect, useCallback } from 'react';
import rawLandmarks from './data/landmarks.json';
import { Landmark, FilterState, UserLocation, YesterdaysPhoto, YesterdaysAerialPolygon } from './types';
import { fetchLandmarkPhotos } from './services/yesterdaysApi';
import { calculateDistanceMiles } from './utils/distance';
import { Map } from './components/Map';
import { LandmarkDetailDrawer } from './components/LandmarkDetailDrawer';
import { TagExplorerModal } from './components/TagExplorerModal';
import { YearRangeFilter } from './components/YearRangeFilter';
import { ArchitectModal } from './components/ArchitectModal';
import { StyleModal } from './components/StyleModal';
import { Navbar } from './components/Navbar';
import { LandmarkListView } from './components/LandmarkListView';
import { StatusPage } from './components/StatusPage';
import { getArchitectInfo } from './data/architects';

export const App: React.FC = () => {
  const landmarksData = rawLandmarks as unknown as Landmark[];
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [tagExplorerOpen, setTagExplorerOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedArchitectModal, setSelectedArchitectModal] = useState<string | null>(null);
  const [selectedStyleModal, setSelectedStyleModal] = useState<string | null>(null);
  const [showStatusPage, setShowStatusPage] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#status';
  });

  // Yesterdays.today georeferenced historical photos state
  const [photosLandmark, setPhotosLandmark] = useState<Landmark | null>(null);
  const [yesterdaysPhotos, setYesterdaysPhotos] = useState<YesterdaysPhoto[]>([]);
  const [yesterdaysAerials, setYesterdaysAerials] = useState<YesterdaysAerialPolygon[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const [showHistoricalPhotos, setShowHistoricalPhotos] = useState<boolean>(true);
  const [focusedPhotoId, setFocusedPhotoId] = useState<number | null>(null);

  // Panel minimize / collapse state
  const [isDrawerMinimized, setIsDrawerMinimized] = useState<boolean>(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const handleHashChange = () => {
      setShowStatusPage(window.location.hash === '#status');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedArchitects: [],
    selectedStyles: [],
    selectedDistricts: [],
    yearMin: null,
    yearMax: null,
    hasImageOnly: false,
    category: 'all',
  });

  // Calculate distance for all landmarks when userLocation changes
  const landmarksWithDistance = useMemo(() => {
    if (!userLocation) return landmarksData;
    return landmarksData.map((l) => {
      if (!l.lat || !l.lon) return l;
      const dist = calculateDistanceMiles(userLocation.lat, userLocation.lon, l.lat, l.lon);
      return { ...l, distanceMiles: dist };
    });
  }, [landmarksData, userLocation]);

  // Apply filters
  const filteredLandmarks = useMemo(() => {
    return landmarksWithDistance.filter((landmark) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName =
          landmark.name.toLowerCase().includes(query) ||
          Boolean(landmark.historicName && landmark.historicName.toLowerCase().includes(query)) ||
          Boolean(landmark.allTags?.name && landmark.allTags.name.toLowerCase().includes(query));
        const matchesRef = landmark.ref.toLowerCase() === query || landmark.ref.includes(query);

        const checkCreatorMatch = (creators: string[]) => {
          return creators.some((c) => {
            if (c.toLowerCase().includes(query)) return true;
            const info = getArchitectInfo(c);
            return Boolean(
              (info.displayName && info.displayName.toLowerCase().includes(query)) ||
              (info.wikidataName && info.wikidataName.toLowerCase().includes(query)) ||
              (info.firm && info.firm.toLowerCase().includes(query))
            );
          });
        };

        const matchesArchitect = checkCreatorMatch(landmark.architects);
        const matchesPlanner = checkCreatorMatch(landmark.planners || []);
        const matchesEngineer = checkCreatorMatch(landmark.structuralEngineers || []);
        const matchesDesigner = checkCreatorMatch(landmark.designers || []);
        const matchesBuilder = checkCreatorMatch(landmark.builders || []);
        const matchesStyle = landmark.architectureStyles.some((s) => s.toLowerCase().includes(query));
        const matchesDistrict = (landmark.historicDistricts || []).some((d) => d.toLowerCase().includes(query));
        const matchesAddress = landmark.address ? landmark.address.toLowerCase().includes(query) : false;
        const matchesWebsite = landmark.website ? landmark.website.toLowerCase().includes(query) : false;
        const matchesDesc =
          Boolean(landmark.description && landmark.description.toLowerCase().includes(query)) ||
          Boolean(landmark.wikidataDescription && landmark.wikidataDescription.toLowerCase().includes(query));

        if (!matchesName && !matchesRef && !matchesArchitect && !matchesPlanner && !matchesEngineer && !matchesDesigner && !matchesBuilder && !matchesStyle && !matchesDistrict && !matchesAddress && !matchesDesc && !matchesWebsite) {
          return false;
        }
      }

      // Creator filter (supports multiple selection, matches if landmark has any selected creator: architect, planner, engineer, designer, builder)
      if (filters.selectedArchitects.length > 0) {
        const landmarkCreators = [
          ...landmark.architects,
          ...(landmark.planners || []),
          ...(landmark.structuralEngineers || []),
          ...(landmark.designers || []),
          ...(landmark.builders || []),
        ];

        const hasCreator = filters.selectedArchitects.some((targetCreator) => {
          const target = targetCreator.toLowerCase().trim();
          const targetInfo = getArchitectInfo(targetCreator);
          const targetAliases = [
            target,
            targetInfo.name?.toLowerCase().trim(),
            targetInfo.displayName?.toLowerCase().trim(),
            targetInfo.wikidataName?.toLowerCase().trim(),
            targetInfo.firm?.toLowerCase().trim(),
          ].filter(Boolean) as string[];

          return landmarkCreators.some((c) => {
            const cLower = c.toLowerCase().trim();
            if (targetAliases.includes(cLower)) return true;
            const cInfo = getArchitectInfo(c);
            const cAliases = [
              cInfo.name?.toLowerCase().trim(),
              cInfo.displayName?.toLowerCase().trim(),
              cInfo.wikidataName?.toLowerCase().trim(),
              cInfo.firm?.toLowerCase().trim(),
            ].filter(Boolean) as string[];
            return targetAliases.some((t) => cAliases.includes(t));
          });
        });
        if (!hasCreator) return false;
      }

      // Style filter
      if (filters.selectedStyles.length > 0) {
        const hasStyle = filters.selectedStyles.some((targetStyle) =>
          landmark.architectureStyles.some((s) => s.toLowerCase() === targetStyle.toLowerCase())
        );
        if (!hasStyle) return false;
      }

      // Historic District filter
      if (filters.selectedDistricts && filters.selectedDistricts.length > 0) {
        const inDistrict = filters.selectedDistricts.some((targetDist) =>
          (landmark.historicDistricts || []).some((d) => d.toLowerCase() === targetDist.toLowerCase())
        );
        if (!inDistrict) return false;
      }

      // Year range filter
      if (filters.yearMin !== null) {
        if (!landmark.year || landmark.year < filters.yearMin) return false;
      }
      if (filters.yearMax !== null) {
        if (!landmark.year || landmark.year > filters.yearMax) return false;
      }

      // Images only
      if (filters.hasImageOnly && !landmark.imageUrl) {
        return false;
      }

      return true;
    });
  }, [landmarksWithDistance, filters]);

  // Synchronize selectedLandmark with updated distance or details
  const currentSelectedLandmark = useMemo(() => {
    if (!selectedLandmark) return null;
    return landmarksWithDistance.find((l) => l.id === selectedLandmark.id) || selectedLandmark;
  }, [selectedLandmark, landmarksWithDistance]);

  // Synchronize photosLandmark with updated distance or details
  const currentPhotosLandmark = useMemo(() => {
    if (!photosLandmark) return null;
    return landmarksWithDistance.find((l) => l.id === photosLandmark.id) || photosLandmark;
  }, [photosLandmark, landmarksWithDistance]);

  const handleSelectLandmark = useCallback((landmark: Landmark | null) => {
    setSelectedLandmark(landmark);
    if (landmark) {
      setIsDrawerMinimized(false);
      if (landmark.wikidata) {
        setPhotosLandmark(landmark);
      }
    }
  }, []);

  const handleClearHistoricalPhotos = useCallback(() => {
    setPhotosLandmark(null);
    setYesterdaysPhotos([]);
    setYesterdaysAerials([]);
    setFocusedPhotoId(null);
  }, []);

  const handleReopenLandmarkDetails = useCallback(() => {
    if (currentPhotosLandmark) {
      setSelectedLandmark(currentPhotosLandmark);
      setIsDrawerMinimized(false);
    }
  }, [currentPhotosLandmark]);

  // Fetch Yesterdays georeferenced historical photos when photosLandmark changes
  useEffect(() => {
    setFocusedPhotoId(null);
    if (!currentPhotosLandmark || !currentPhotosLandmark.wikidata) {
      setYesterdaysPhotos([]);
      setYesterdaysAerials([]);
      setLoadingPhotos(false);
      return;
    }

    let active = true;
    setLoadingPhotos(true);

    fetchLandmarkPhotos(currentPhotosLandmark.wikidata)
      .then((result) => {
        if (!active) return;
        setYesterdaysPhotos(result.photos);
        setYesterdaysAerials(result.aerials);
      })
      .catch((err) => {
        console.error('Error fetching historical photos:', err);
        if (!active) return;
        setYesterdaysPhotos([]);
        setYesterdaysAerials([]);
      })
      .finally(() => {
        if (!active) return;
        setLoadingPhotos(false);
      });

    return () => {
      active = false;
    };
  }, [currentPhotosLandmark?.id, currentPhotosLandmark?.wikidata]);

  // Geolocation Handler
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error.message);
        // If permission denied in local dev, provide Riverside downtown reference point as helpful fallback demo
        const useFallback = window.confirm(
          'Location access was unavailable or denied. Would you like to simulate your location near Downtown Riverside (Mission Inn Ave) to test proximity features?'
        );
        if (useFallback) {
          setUserLocation({
            lat: 33.9815,
            lon: -117.3735,
            accuracy: 30,
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Filter actions
  const handleSelectArchitect = (architect: string) => {
    const info = getArchitectInfo(architect);
    const canonical = info.displayName || info.name || architect;
    if (!filters.selectedArchitects.includes(canonical) && !filters.selectedArchitects.includes(architect)) {
      setFilters((prev) => ({
        ...prev,
        selectedArchitects: [...prev.selectedArchitects, canonical],
      }));
    }
  };

  const handleSelectStyle = (styleKey: string) => {
    if (!filters.selectedStyles.includes(styleKey)) {
      setFilters((prev) => ({
        ...prev,
        selectedStyles: [...prev.selectedStyles, styleKey],
      }));
    }
  };

  const handleSelectDistrict = (district: string) => {
    if (!(filters.selectedDistricts || []).includes(district)) {
      setFilters((prev) => ({
        ...prev,
        selectedDistricts: [...(prev.selectedDistricts || []), district],
      }));
    }
  };

  const handleSelectEra = (minYear: number, maxYear: number) => {
    setFilters((prev) => ({
      ...prev,
      yearMin: minYear,
      yearMax: maxYear,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedArchitects: [],
      selectedStyles: [],
      selectedDistricts: [],
      yearMin: null,
      yearMax: null,
      hasImageOnly: false,
      category: 'all',
    });
  };

  if (showStatusPage) {
    return (
      <StatusPage
        landmarks={landmarksData}
        onBackToMap={() => {
          setShowStatusPage(false);
          if (window.location.hash === '#status') {
            window.history.pushState(null, '', window.location.pathname);
          }
        }}
        onSelectLandmarkOnMap={(landmark) => {
          handleSelectLandmark(landmark);
          setShowStatusPage(false);
          if (window.location.hash === '#status') {
            window.history.pushState(null, '', window.location.pathname);
          }
          setViewMode('split');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-100 text-stone-900">
      {/* Top Navigation */}
      <Navbar
        filters={filters}
        onFilterChange={setFilters}
        onOpenTagExplorer={() => setTagExplorerOpen(true)}
        onToggleTimeline={() => setTimelineOpen(!timelineOpen)}
        timelineOpen={timelineOpen}
        totalCount={landmarksData.length}
        filteredCount={filteredLandmarks.length}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          if (mode === 'split') {
            setLeftPanelCollapsed(false);
          }
        }}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
        onResetFilters={handleResetFilters}
        onOpenStatusPage={() => {
          setShowStatusPage(true);
          window.location.hash = '#status';
        }}
        isStatusPage={showStatusPage}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Optional Collapsible Timeline Bar */}
        {timelineOpen && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-3">
            <YearRangeFilter
              minYear={filters.yearMin}
              maxYear={filters.yearMax}
              onChange={(min, max) => setFilters((f) => ({ ...f, yearMin: min, yearMax: max }))}
              matchingCount={filteredLandmarks.length}
            />
          </div>
        )}

        {/* Side List View (when in split mode or full list mode) */}
        {(viewMode === 'split' || viewMode === 'list') && !leftPanelCollapsed && (
          <div
            className={`${
              viewMode === 'list' ? 'w-full' : 'hidden md:block w-96 lg:w-[420px]'
            } h-full shrink-0 z-10`}
          >
            <LandmarkListView
              landmarks={filteredLandmarks}
              selectedLandmark={currentSelectedLandmark}
              onSelectLandmark={handleSelectLandmark}
              userLocation={userLocation}
              onCollapse={() => setLeftPanelCollapsed(true)}
            />
          </div>
        )}

        {/* Map View */}
        {viewMode !== 'list' && (
          <div className="flex-1 h-full relative">
            <Map
              landmarks={filteredLandmarks}
              selectedLandmark={currentSelectedLandmark}
              onSelectLandmark={handleSelectLandmark}
              userLocation={userLocation}
              onLocateUser={handleLocateUser}
              isLocating={isLocating}
              yesterdaysPhotos={yesterdaysPhotos}
              yesterdaysAerials={yesterdaysAerials}
              loadingPhotos={loadingPhotos}
              showHistoricalPhotos={showHistoricalPhotos}
              onToggleHistoricalPhotos={() => setShowHistoricalPhotos(!showHistoricalPhotos)}
              focusedPhotoId={focusedPhotoId}
              onSelectHistoricalPhoto={(photo) => setFocusedPhotoId(photo.id)}
              photosLandmark={currentPhotosLandmark}
              onClearHistoricalPhotos={handleClearHistoricalPhotos}
              onReopenLandmarkDetails={handleReopenLandmarkDetails}
              isLeftPanelCollapsed={leftPanelCollapsed || viewMode === 'map'}
              onToggleLeftPanel={() => {
                if (viewMode === 'map') {
                  setViewMode('split');
                  setLeftPanelCollapsed(false);
                } else {
                  setLeftPanelCollapsed((prev) => !prev);
                }
              }}
            />
          </div>
        )}

        {/* Landmark Detail Drawer */}
        <LandmarkDetailDrawer
          landmark={currentSelectedLandmark}
          onClose={() => {
            setSelectedLandmark(null);
            setIsDrawerMinimized(false);
          }}
          isMinimized={isDrawerMinimized}
          onToggleMinimize={() => setIsDrawerMinimized(!isDrawerMinimized)}
          onSelectArchitect={handleSelectArchitect}
          onSelectStyle={handleSelectStyle}
          onSelectDistrict={handleSelectDistrict}
          onShowArchitectBio={(arch) => setSelectedArchitectModal(arch)}
          onShowStyleInfo={(styleKey) => setSelectedStyleModal(styleKey)}
          yesterdaysPhotos={yesterdaysPhotos}
          yesterdaysAerials={yesterdaysAerials}
          loadingYesterdaysPhotos={loadingPhotos}
          onFocusPhotoOnMap={(photoId) => {
            setFocusedPhotoId(photoId);
            setShowHistoricalPhotos(true);
            setIsDrawerMinimized(true);
            if (viewMode === 'list') {
              setViewMode('split');
            }
          }}
        />
      </div>

      {/* Tag & Value Explorer Modal */}
      <TagExplorerModal
        isOpen={tagExplorerOpen}
        onClose={() => setTagExplorerOpen(false)}
        landmarks={landmarksData}
        onSelectArchitect={handleSelectArchitect}
        onSelectStyle={handleSelectStyle}
        onSelectDistrict={handleSelectDistrict}
        onSelectEra={handleSelectEra}
      />

      {/* Architect Biography Modal */}
      <ArchitectModal
        architectName={selectedArchitectModal}
        onClose={() => setSelectedArchitectModal(null)}
        landmarks={landmarksData}
        onSelectLandmark={(landmark) => {
          handleSelectLandmark(landmark);
          setViewMode('split');
        }}
        onFilterByArchitect={handleSelectArchitect}
      />

      {/* Architectural Style Modal */}
      <StyleModal
        styleKey={selectedStyleModal}
        onClose={() => setSelectedStyleModal(null)}
        landmarks={landmarksData}
        onSelectLandmark={(landmark) => {
          handleSelectLandmark(landmark);
          setViewMode('split');
        }}
        onFilterByStyle={handleSelectStyle}
      />
    </div>
  );
};

export default App;
