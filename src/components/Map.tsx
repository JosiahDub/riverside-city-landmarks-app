import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Landmark, UserLocation, YesterdaysPhoto, YesterdaysAerialPolygon } from '../types';
import { getCompassDirection } from '../services/yesterdaysApi';
import { Camera, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

interface MapProps {
  landmarks: Landmark[];
  selectedLandmark: Landmark | null;
  onSelectLandmark: (landmark: Landmark) => void;
  userLocation: UserLocation | null;
  onLocateUser: () => void;
  isLocating: boolean;
  yesterdaysPhotos?: YesterdaysPhoto[];
  yesterdaysAerials?: YesterdaysAerialPolygon[];
  loadingPhotos?: boolean;
  showHistoricalPhotos?: boolean;
  onToggleHistoricalPhotos?: () => void;
  focusedPhotoId?: number | null;
  onSelectHistoricalPhoto?: (photo: YesterdaysPhoto) => void;
  photosLandmark?: Landmark | null;
  onClearHistoricalPhotos?: () => void;
  onReopenLandmarkDetails?: () => void;
  isLeftPanelCollapsed?: boolean;
  onToggleLeftPanel?: () => void;
}

type BaseLayerType = 'osm' | 'topo' | 'satellite';

const BASE_LAYERS: Record<BaseLayerType, { name: string; url: string; attribution: string; maxZoom: number }> = {
  osm: {
    name: 'Street (OSM)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  topo: {
    name: 'Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, USGS, NOAA',
    maxZoom: 18,
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
};

export const Map: React.FC<MapProps> = ({
  landmarks,
  selectedLandmark,
  onSelectLandmark,
  userLocation,
  onLocateUser,
  isLocating,
  yesterdaysPhotos = [],
  yesterdaysAerials = [],
  loadingPhotos = false,
  showHistoricalPhotos = true,
  onToggleHistoricalPhotos,
  focusedPhotoId = null,
  onSelectHistoricalPhoto,
  photosLandmark = null,
  onClearHistoricalPhotos,
  onReopenLandmarkDetails,
  isLeftPanelCollapsed = false,
  onToggleLeftPanel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.LayerGroup | null>(null);
  const historicalMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const aerialsLayerRef = useRef<L.LayerGroup | null>(null);
  const photoMarkersMapRef = useRef<globalThis.Map<number, L.Marker>>(new globalThis.Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayerType>('osm');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Riverside downtown center default: 33.9806, -117.3755
    const map = L.map(mapContainerRef.current, {
      center: [33.9806, -117.3755],
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer (Standard OpenStreetMap - 100% free, no API key, no watermark)
    const layerConfig = BASE_LAYERS.osm;
    const tiles = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
    }).addTo(map);

    tileLayerRef.current = tiles;
    markersLayerRef.current = L.layerGroup().addTo(map);
    userMarkerRef.current = L.layerGroup().addTo(map);
    historicalMarkersLayerRef.current = L.layerGroup().addTo(map);
    aerialsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle dynamic map container resizing (e.g. sidebar collapse/expand)
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Switch Tile Layer when activeBaseLayer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = BASE_LAYERS[activeBaseLayer];
    const newTiles = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [activeBaseLayer]);

  // Update Markers when landmarks or selectedLandmark changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    landmarks.forEach((landmark) => {
      if (!landmark.lat || !landmark.lon) return;

      const isSelected = selectedLandmark?.id === landmark.id;
      const isNature = landmark.natural || landmark.allTags.species || landmark.allTags.genus;
      const hasArchitect = landmark.architects.length > 0;

      // Color scheme
      let bgColor = '#c85a32'; // terracotta default
      if (isNature) bgColor = '#2e7d32'; // forest green for trees/parks
      else if (hasArchitect) bgColor = '#9333ea'; // purple for architect-designed

      const iconHtml = `
        <div class="landmark-pin ${isSelected ? 'selected' : ''}" style="
          width: ${isSelected ? '36px' : '28px'};
          height: ${isSelected ? '36px' : '28px'};
          background-color: ${isSelected ? '#e0764e' : bgColor};
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: ${landmark.ref ? (landmark.ref.length > 2 ? '10px' : '12px') : '10px'};
          border-radius: 9999px;
          cursor: pointer;
        ">
          ${landmark.ref ? landmark.ref : '★'}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([landmark.lat, landmark.lon], { icon: customIcon });

      // Popup preview
      const popupHtml = document.createElement('div');
      popupHtml.className = 'w-64 overflow-hidden text-stone-800 p-3';
      popupHtml.innerHTML = `
        <div class="flex items-center gap-2 mb-1.5">
          <span class="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full">
            Landmark #${landmark.ref || landmark.refNumber}
          </span>
          ${landmark.year ? `<span class="text-xs text-stone-500 font-medium">Built ${landmark.year}</span>` : ''}
        </div>
        ${landmark.thumbnail ? `
          <div class="w-full h-28 mb-2 rounded-md overflow-hidden bg-stone-100">
            <img src="${landmark.thumbnail}" alt="${landmark.name}" class="w-full h-full object-cover" />
          </div>
        ` : ''}
        <h4 class="font-serif font-bold text-sm leading-tight text-stone-900 mb-1">${landmark.name}</h4>
        ${landmark.architects.length > 0 ? `
          <p class="text-xs text-stone-600 mb-1"><span class="font-semibold text-stone-700">Architect:</span> ${landmark.architects.join(', ')}</p>
        ` : ''}
        ${landmark.isNationalHistoricLandmark ? `
          <div class="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 shadow-xs">
            <span>⭐ National Historic Landmark${landmark.nationalHistoricLandmarkDate ? ` (${landmark.nationalHistoricLandmarkDate})` : ''}</span>
          </div>
        ` : ''}
        ${landmark.hasPlaque ? `
          <div class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1">
            <span>📜 Historical Plaque On Site</span>
          </div>
        ` : ''}
        ${landmark.designationDate ? `
          <p class="text-[11px] text-purple-800 mb-1.5 font-medium">🏛️ Designated ${landmark.designationDate}</p>
        ` : ''}
        ${landmark.address ? `
          <p class="text-xs text-stone-500 mb-2 truncate">${landmark.address}</p>
        ` : ''}
        <button class="view-details-btn w-full text-center bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium py-1.5 px-3 rounded shadow-sm transition">
          Explore Landmark
        </button>
      `;

      popupHtml.querySelector('.view-details-btn')?.addEventListener('click', () => {
        onSelectLandmark(landmark);
      });

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectLandmark(landmark);
      });

      markersLayer.addLayer(marker);
    });
  }, [landmarks, selectedLandmark, onSelectLandmark]);

  // Pan to selected landmark
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLandmark || !selectedLandmark.lat || !selectedLandmark.lon) return;

    map.flyTo([selectedLandmark.lat, selectedLandmark.lon], Math.max(map.getZoom(), 16), {
      duration: 0.8,
    });
  }, [selectedLandmark]);

  // Update Historical Photos & Aerial Polygons Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const historicalLayer = historicalMarkersLayerRef.current;
    const aerialsLayer = aerialsLayerRef.current;
    if (!map || !historicalLayer || !aerialsLayer) return;

    historicalLayer.clearLayers();
    aerialsLayer.clearLayers();
    photoMarkersMapRef.current.clear();

    if (!showHistoricalPhotos) return;

    // 1) Render Point Historical Photos
    yesterdaysPhotos.forEach((photo) => {
      if (!photo.lat || !photo.lon) return;

      const isFocused = focusedPhotoId === photo.id;
      const hasDirection = photo.direction !== null && photo.direction !== undefined && !isNaN(photo.direction);

      const iconHtml = `
        <div class="historical-photo-marker ${isFocused ? 'focused' : ''}" style="
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${hasDirection ? `
            <div style="
              position: absolute;
              width: 48px;
              height: 48px;
              top: 0;
              left: 0;
              pointer-events: none;
              transform: rotate(${photo.direction}deg);
              transform-origin: 24px 24px;
            ">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M 24 24 L 16.5 3.3 A 22 22 0 0 1 31.5 3.3 Z" fill="rgba(217, 119, 6, 0.45)" stroke="rgba(180, 83, 9, 0.85)" stroke-width="1.2" />
              </svg>
            </div>
          ` : ''}
          <div style="
            position: relative;
            z-index: 2;
            width: 24px;
            height: 24px;
            border-radius: 9999px;
            background-color: ${isFocused ? '#d97706' : '#92400e'};
            border: 2px solid #ffffff;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          ">
            <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'historical-leaflet-marker',
        html: iconHtml,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([photo.lat, photo.lon], { icon: customIcon });

      // Popup
      const popupHtml = document.createElement('div');
      popupHtml.className = 'w-64 overflow-hidden text-stone-800 p-3';
      popupHtml.innerHTML = `
        <div class="flex items-center justify-between gap-1 mb-1.5">
          <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            📷 Historical Photo
          </span>
          ${photo.dateDisplay ? `<span class="text-xs font-semibold text-amber-800">${photo.dateDisplay}</span>` : ''}
        </div>
        ${photo.thumbnail ? `
          <div class="w-full h-36 mb-2 rounded-md overflow-hidden bg-stone-900 shadow-xs">
            <img src="${photo.thumbnail}" alt="${photo.title.replace(/"/g, '&quot;')}" class="w-full h-full object-cover" />
          </div>
        ` : ''}
        <h4 class="font-serif font-bold text-xs leading-snug text-stone-900 mb-1 line-clamp-2">${photo.title}</h4>
        ${hasDirection ? `
          <p class="text-[11px] text-stone-600 mb-1 flex items-center gap-1">
            <span class="font-semibold text-stone-700">Camera Bearing:</span>
            <span class="font-medium text-amber-900">${getCompassDirection(photo.direction)}</span>
          </p>
        ` : ''}
        ${photo.collectionName || photo.sourceName ? `
          <p class="text-[10px] text-stone-500 mb-2 truncate">
            ${[photo.collectionName, photo.sourceName].filter(Boolean).join(' • ')}
          </p>
        ` : ''}
        <div class="flex items-center gap-2 pt-1 border-t border-stone-200">
          <a
            href="${photo.yesterdaysUrl}"
            target="_blank"
            rel="noreferrer"
            class="w-full text-center bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-medium py-1.5 px-2 rounded shadow-xs transition flex items-center justify-center gap-1"
          >
            <span>View on Yesterdays.today</span>
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });
      marker.on('click', () => {
        onSelectHistoricalPhoto?.(photo);
      });

      photoMarkersMapRef.current.set(photo.id, marker);
      historicalLayer.addLayer(marker);
    });

    // 2) Render Aerial Coverage Polygons
    yesterdaysAerials.forEach((aerial) => {
      if (!aerial.coordinates || aerial.coordinates.length === 0) return;

      const polyCoords = aerial.coordinates.map((ring) =>
        ring.map(([lon, lat]) => [lat, lon] as [number, number])
      );

      const polygon = L.polygon(polyCoords, {
        color: '#d97706',
        weight: 2,
        dashArray: '5, 5',
        fillColor: '#f59e0b',
        fillOpacity: 0.15,
      });

      const popupHtml = document.createElement('div');
      popupHtml.className = 'w-64 overflow-hidden text-stone-800 p-3';
      popupHtml.innerHTML = `
        <div class="flex items-center justify-between gap-1 mb-1.5">
          <span class="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ✈️ Aerial Coverage Area
          </span>
        </div>
        ${aerial.thumbnail ? `
          <div class="w-full h-36 mb-2 rounded-md overflow-hidden bg-stone-900 shadow-xs">
            <img src="${aerial.thumbnail}" alt="${aerial.title.replace(/"/g, '&quot;')}" class="w-full h-full object-cover" />
          </div>
        ` : ''}
        <h4 class="font-serif font-bold text-xs leading-snug text-stone-900 mb-2">${aerial.title}</h4>
        <a
          href="${aerial.yesterdaysUrl}"
          target="_blank"
          rel="noreferrer"
          class="w-full text-center bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-medium py-1.5 px-2 rounded shadow-xs transition flex items-center justify-center gap-1"
        >
          <span>View Aerial on Yesterdays</span>
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      `;

      polygon.bindPopup(popupHtml, { maxWidth: 280 });
      aerialsLayer.addLayer(polygon);
    });
  }, [yesterdaysPhotos, yesterdaysAerials, showHistoricalPhotos, focusedPhotoId, onSelectHistoricalPhoto]);

  // Handle focusedPhotoId to zoom and open popup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedPhotoId) return;

    const photo = yesterdaysPhotos.find((p) => p.id === focusedPhotoId || p.imageId === focusedPhotoId);
    if (!photo || !photo.lat || !photo.lon) return;

    map.flyTo([photo.lat, photo.lon], Math.max(map.getZoom(), 17), { duration: 0.8 });

    const marker = photoMarkersMapRef.current.get(photo.id);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 500);
    }
  }, [focusedPhotoId, yesterdaysPhotos]);

  // Handle User Location & "Zoom to closest landmarks"
  useEffect(() => {
    const map = mapInstanceRef.current;
    const userLayer = userMarkerRef.current;
    if (!map || !userLayer) return;

    userLayer.clearLayers();

    if (userLocation) {
      const { lat, lon, accuracy } = userLocation;

      // User location marker
      const userHtml = `
        <div class="user-location-marker" style="
          width: 18px;
          height: 18px;
          background-color: #2563eb;
          border: 3px solid #ffffff;
          border-radius: 9999px;
        "></div>
      `;

      const userIcon = L.divIcon({
        className: 'user-marker',
        html: userHtml,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([lat, lon], { icon: userIcon });
      marker.bindPopup(`<strong>Your Location</strong><br>Accuracy: ~${Math.round(accuracy || 10)}m`);
      userLayer.addLayer(marker);

      if (accuracy && accuracy < 1000) {
        const circle = L.circle([lat, lon], {
          radius: accuracy,
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.15,
          weight: 1,
        });
        userLayer.addLayer(circle);
      }
    }
  }, [userLocation]);

  // Fit bounds to include user and closest landmarks
  const zoomToNearestLandmarks = () => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation || landmarks.length === 0) return;

    // Find landmarks with distance and take top 5 closest
    const sorted = [...landmarks]
      .filter((l) => l.lat && l.lon)
      .sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999))
      .slice(0, 5);

    if (sorted.length === 0) {
      map.setView([userLocation.lat, userLocation.lon], 15);
      return;
    }

    const points: L.LatLngExpression[] = [
      [userLocation.lat, userLocation.lon],
      ...sorted.map((l) => [l.lat, l.lon] as [number, number]),
    ];

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  };

  // Reset to Riverside Downtown
  const resetMap = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (landmarks.length > 0) {
      const validPoints = landmarks.filter((l) => l.lat && l.lon).map((l) => [l.lat, l.lon] as [number, number]);
      if (validPoints.length > 0) {
        map.fitBounds(L.latLngBounds(validPoints), { padding: [40, 40], maxZoom: 15 });
        return;
      }
    }
    map.flyTo([33.9806, -117.3755], 13);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Toggle Landmarks List Button */}
        {onToggleLeftPanel && (
          <button
            onClick={onToggleLeftPanel}
            title={isLeftPanelCollapsed ? 'Show Landmarks List' : 'Hide Landmarks List'}
            className="flex items-center gap-2 bg-white/95 backdrop-blur shadow-md hover:shadow-lg border border-stone-200 text-stone-800 font-medium text-xs px-3.5 py-2.5 rounded-lg transition-all active:scale-95 hover:bg-stone-50"
          >
            {isLeftPanelCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4 text-amber-700" />
                <span>Show List</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-stone-600" />
                <span>Hide List</span>
              </>
            )}
          </button>
        )}

        {/* Geolocation Button */}
        <button
          onClick={() => {
            onLocateUser();
            if (userLocation) {
              zoomToNearestLandmarks();
            }
          }}
          disabled={isLocating}
          title="Find closest landmarks to your location"
          className="flex items-center gap-2 bg-white/95 backdrop-blur shadow-md hover:shadow-lg border border-stone-200 text-stone-800 font-medium text-xs px-3.5 py-2.5 rounded-lg transition-all active:scale-95 hover:bg-stone-50"
        >
          <svg className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{isLocating ? 'Locating...' : userLocation ? 'Zoom to Closest' : 'Near Me'}</span>
        </button>

        {/* Reset View Button */}
        <button
          onClick={resetMap}
          title="Fit all landmarks"
          className="flex items-center gap-2 bg-white/95 backdrop-blur shadow-md hover:shadow-lg border border-stone-200 text-stone-800 font-medium text-xs px-3.5 py-2 rounded-lg transition-all active:scale-95 hover:bg-stone-50"
        >
          <svg className="w-4 h-4 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span>Fit Landmarks</span>
        </button>
      </div>

      {/* Layer Switcher (Top Right below zoom) */}
      <div className="absolute top-24 right-3 z-10 bg-white/95 backdrop-blur shadow-md border border-stone-200 rounded-lg p-1 flex flex-col gap-1 text-[11px] font-medium">
        {(['osm', 'topo', 'satellite'] as BaseLayerType[]).map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveBaseLayer(layer)}
            className={`px-2 py-1 rounded transition text-left ${
              activeBaseLayer === layer
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            {BASE_LAYERS[layer].name}
          </button>
        ))}
      </div>

      {/* Floating Historical Photos Control (Top Center) */}
      {(yesterdaysPhotos.length > 0 || loadingPhotos) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-stone-900/95 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-amber-500/50 text-xs backdrop-blur animate-fade-in max-w-[90vw] overflow-x-auto">
          {loadingPhotos ? (
            <span className="flex items-center gap-1.5 text-amber-300 whitespace-nowrap">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Loading historical photos...</span>
            </span>
          ) : (
            <>
              {photosLandmark && (
                <button
                  onClick={onReopenLandmarkDetails}
                  className="font-serif font-bold text-amber-400 hover:text-amber-200 transition underline-offset-2 hover:underline truncate max-w-[130px] sm:max-w-[200px] shrink-0"
                  title={`Open details for ${photosLandmark.name}`}
                >
                  🏛️ {photosLandmark.name}
                </button>
              )}
              <span className="flex items-center gap-1.5 font-semibold text-amber-300 shrink-0">
                <Camera className="w-3.5 h-3.5" />
                <span>{yesterdaysPhotos.length} Photo{yesterdaysPhotos.length === 1 ? '' : 's'}</span>
              </span>
              <span className="text-stone-400 text-[10px] hidden md:inline shrink-0">from Yesterdays.today</span>
              {onToggleHistoricalPhotos && (
                <button
                  onClick={onToggleHistoricalPhotos}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition shrink-0 ${
                    showHistoricalPhotos
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                  }`}
                  title={showHistoricalPhotos ? 'Hide photo markers' : 'Show photo markers'}
                >
                  {showHistoricalPhotos ? 'Showing' : 'Hidden'}
                </button>
              )}
              {onClearHistoricalPhotos && (
                <button
                  onClick={onClearHistoricalPhotos}
                  className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition shrink-0 ml-0.5"
                  title="Remove historical photos from map"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-6 left-4 z-10 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-stone-200 text-xs text-stone-700 flex-wrap">
        <span className="font-semibold text-stone-900">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#c85a32]"></span> Historic Landmark
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#9333ea]"></span> Master Architect
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2e7d32]"></span> Heritage Tree / Park
        </span>
        {yesterdaysPhotos.length > 0 && showHistoricalPhotos && (
          <span className="flex items-center gap-1.5 text-amber-900 font-medium">
            <span className="w-3 h-3 rounded-full bg-[#92400e] border border-white"></span> Photo Camera
          </span>
        )}
      </div>
    </div>
  );
};
