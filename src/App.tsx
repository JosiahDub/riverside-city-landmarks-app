import React, { useState, useMemo, useEffect, useCallback } from 'react';
import rawLandmarks from './data/landmarks.json';
import { Landmark, FilterState, UserLocation } from './types';
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

export const App: React.FC = () => {
  const [landmarksData, setLandmarksData] = useState<Landmark[]>(rawLandmarks as Landmark[]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [tagExplorerOpen, setTagExplorerOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedArchitectModal, setSelectedArchitectModal] = useState<string | null>(null);
  const [selectedStyleModal, setSelectedStyleModal] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [showStatusPage, setShowStatusPage] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#status';
  });

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
        const matchesName = landmark.name.toLowerCase().includes(query);
        const matchesRef = landmark.ref.toLowerCase() === query || landmark.ref.includes(query);
        const matchesArchitect = landmark.architects.some((a) => a.toLowerCase().includes(query));
        const matchesStyle = landmark.architectureStyles.some((s) => s.toLowerCase().includes(query));
        const matchesAddress = landmark.address ? landmark.address.toLowerCase().includes(query) : false;
        const matchesDesc = landmark.description.toLowerCase().includes(query);

        if (!matchesName && !matchesRef && !matchesArchitect && !matchesStyle && !matchesAddress && !matchesDesc) {
          return false;
        }
      }

      // Architect filter (supports multiple selection, matches if landmark has any selected architect)
      if (filters.selectedArchitects.length > 0) {
        const hasArchitect = filters.selectedArchitects.some((targetArch) =>
          landmark.architects.some((a) => a.toLowerCase() === targetArch.toLowerCase())
        );
        if (!hasArchitect) return false;
      }

      // Style filter
      if (filters.selectedStyles.length > 0) {
        const hasStyle = filters.selectedStyles.some((targetStyle) =>
          landmark.architectureStyles.some((s) => s.toLowerCase() === targetStyle.toLowerCase())
        );
        if (!hasStyle) return false;
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
    if (!filters.selectedArchitects.includes(architect)) {
      setFilters((prev) => ({
        ...prev,
        selectedArchitects: [...prev.selectedArchitects, architect],
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
      yearMin: null,
      yearMax: null,
      hasImageOnly: false,
      category: 'all',
    });
  };

  // Live Sync with OpenStreetMap Overpass & Wikidata
  const handleLiveSync = async () => {
    setIsSyncing(true);
    setSyncNotice('Connecting to OpenStreetMap Overpass API...');
    try {
      const overpassQuery = `[out:json][timeout:60]; nwr["ref:US-CA:city_of_riverside_cultural_heritage_board"]; out center tags;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(overpassQuery),
      });

      if (!res.ok) throw new Error(`Overpass returned status ${res.status}`);
      const data = await res.json();
      const elements = data.elements || [];

      if (elements.length > 0) {
        setLandmarksData((prev) => {
          const map = new Map(prev.map((l) => [`${l.osmType}-${l.osmId}`, l]));
          elements.forEach((el: any) => {
            const key = `${el.type}-${el.id}`;
            const existing = map.get(key);
            if (existing && el.tags) {
              const tags = el.tags;
              const architects = tags.architect
                ? tags.architect.split(';').map((a: string) => a.trim()).filter(Boolean)
                : existing.architects;
              const styles = tags['building:architecture']
                ? tags['building:architecture'].split(';').map((s: string) => s.trim().toLowerCase().replace(/[\s-]/g, '_')).filter(Boolean)
                : existing.architectureStyles;
              let year = existing.year;
              if (tags.start_date) {
                const match = tags.start_date.match(/(\d{4})/);
                if (match) year = parseInt(match[1], 10);
              }
              const residents = tags.notable_resident || tags.resident
                ? (tags.notable_resident || tags.resident).split(';').map((r: string) => r.trim()).filter(Boolean)
                : existing.notableResidents;

              map.set(key, {
                ...existing,
                name: tags.name || existing.name,
                startDate: tags.start_date || existing.startDate,
                year,
                architects,
                architectureStyles: styles,
                notableResidents: residents,
                allTags: tags,
              });
            }
          });
          return Array.from(map.values());
        });
      }

      setSyncNotice(`Synced ${elements.length} live landmark features from OSM!`);
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err: any) {
      console.warn('Live sync fallback to local cache:', err.message);
      setSyncNotice('Using verified local dataset (155 landmarks)');
      setTimeout(() => setSyncNotice(null), 4000);
    } finally {
      setIsSyncing(false);
    }
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
          setSelectedLandmark(landmark);
          setShowStatusPage(false);
          if (window.location.hash === '#status') {
            window.history.pushState(null, '', window.location.pathname);
          }
          setViewMode('split');
        }}
        onSyncLive={handleLiveSync}
        isSyncing={isSyncing}
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
        onViewModeChange={setViewMode}
        onLocateUser={handleLocateUser}
        isLocating={isLocating}
        onResetFilters={handleResetFilters}
        onSyncLive={handleLiveSync}
        isSyncing={isSyncing}
        onOpenStatusPage={() => {
          setShowStatusPage(true);
          window.location.hash = '#status';
        }}
        isStatusPage={showStatusPage}
      />

      {/* Sync notification toast */}
      {syncNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{syncNotice}</span>
        </div>
      )}

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
        {(viewMode === 'split' || viewMode === 'list') && (
          <div
            className={`${
              viewMode === 'list' ? 'w-full' : 'hidden md:block w-96 lg:w-[420px]'
            } h-full shrink-0 z-10`}
          >
            <LandmarkListView
              landmarks={filteredLandmarks}
              selectedLandmark={currentSelectedLandmark}
              onSelectLandmark={setSelectedLandmark}
              userLocation={userLocation}
            />
          </div>
        )}

        {/* Map View */}
        {viewMode !== 'list' && (
          <div className="flex-1 h-full relative">
            <Map
              landmarks={filteredLandmarks}
              selectedLandmark={currentSelectedLandmark}
              onSelectLandmark={setSelectedLandmark}
              userLocation={userLocation}
              onLocateUser={handleLocateUser}
              isLocating={isLocating}
            />
          </div>
        )}

        {/* Landmark Detail Drawer */}
        <LandmarkDetailDrawer
          landmark={currentSelectedLandmark}
          onClose={() => setSelectedLandmark(null)}
          onSelectArchitect={handleSelectArchitect}
          onSelectStyle={handleSelectStyle}
          onShowArchitectBio={(arch) => setSelectedArchitectModal(arch)}
          onShowStyleInfo={(styleKey) => setSelectedStyleModal(styleKey)}
        />
      </div>

      {/* Tag & Value Explorer Modal */}
      <TagExplorerModal
        isOpen={tagExplorerOpen}
        onClose={() => setTagExplorerOpen(false)}
        landmarks={landmarksData}
        onSelectArchitect={handleSelectArchitect}
        onSelectStyle={handleSelectStyle}
        onSelectEra={handleSelectEra}
      />

      {/* Architect Biography Modal */}
      <ArchitectModal
        architectName={selectedArchitectModal}
        onClose={() => setSelectedArchitectModal(null)}
        landmarks={landmarksData}
        onSelectLandmark={(landmark) => {
          setSelectedLandmark(landmark);
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
          setSelectedLandmark(landmark);
          setViewMode('split');
        }}
        onFilterByStyle={handleSelectStyle}
      />
    </div>
  );
};

export default App;
