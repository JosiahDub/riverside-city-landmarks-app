import React, { useState } from 'react';
import { Landmark, UserLocation } from '../types';
import { getStyleInfo } from '../data/architecturalStyles';
import { MapPin, User, Layers, Calendar, Compass, ArrowUpDown, Star, ScrollText } from 'lucide-react';

interface LandmarkListViewProps {
  landmarks: Landmark[];
  selectedLandmark: Landmark | null;
  onSelectLandmark: (landmark: Landmark) => void;
  userLocation: UserLocation | null;
}

type SortOption = 'ref' | 'name' | 'year' | 'distance';

export const LandmarkListView: React.FC<LandmarkListViewProps> = ({
  landmarks,
  selectedLandmark,
  onSelectLandmark,
  userLocation,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('ref');

  const sortedLandmarks = [...landmarks].sort((a, b) => {
    if (sortBy === 'ref') return a.refNumber - b.refNumber;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'year') {
      const aY = a.year || 9999;
      const bY = b.year || 9999;
      return aY - bY;
    }
    if (sortBy === 'distance') {
      const aD = a.distanceMiles ?? 9999;
      const bD = b.distanceMiles ?? 9999;
      return aD - bD;
    }
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-stone-50 border-r border-stone-200">
      {/* Header with Sort dropdown */}
      <div className="p-3 border-b border-stone-200 bg-white flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600">
          {landmarks.length} Landmark{landmarks.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ref">Sort by Ref #</option>
            <option value="name">Sort by Name</option>
            <option value="year">Sort by Year Built</option>
            {userLocation && <option value="distance">Sort by Distance</option>}
          </select>
        </div>
      </div>

      {/* Landmarks List */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-200">
        {sortedLandmarks.map((landmark) => {
          const isSelected = selectedLandmark?.id === landmark.id;
          return (
            <div
              key={landmark.id}
              onClick={() => onSelectLandmark(landmark)}
              className={`p-3.5 flex gap-3 cursor-pointer transition ${
                isSelected
                  ? 'bg-amber-50/80 border-l-4 border-amber-600'
                  : 'bg-white hover:bg-stone-50'
              }`}
            >
              {landmark.thumbnail ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                  <img
                    src={landmark.thumbnail}
                    alt={landmark.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg shrink-0 bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 text-xs font-bold">
                  #{landmark.ref}
                </div>
              )}

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded">
                      #{landmark.ref || landmark.refNumber}
                    </span>
                    {landmark.isNationalHistoricLandmark && (
                      <span className="text-[10px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-600 fill-amber-500 shrink-0" />
                        NHL
                      </span>
                    )}
                    {landmark.hasPlaque && (
                      <span
                        className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-0.5"
                        title={`On-site historical plaque${(landmark.plaques?.length || 1) > 1 ? `s (${landmark.plaques?.length})` : ''} mapped with photo`}
                      >
                        <ScrollText className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        Plaque
                      </span>
                    )}
                    {landmark.year && (
                      <span className="text-[11px] text-stone-500 font-medium flex items-center gap-0.5">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {landmark.year}
                      </span>
                    )}
                    {landmark.distanceMiles !== undefined && (
                      <span className="text-[11px] text-blue-700 font-medium flex items-center gap-0.5 ml-auto">
                        <Compass className="w-3 h-3 text-blue-500" />
                        {landmark.distanceMiles} mi
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-sm text-stone-900 leading-snug line-clamp-2">
                    {landmark.name}
                  </h3>

                  {landmark.address && (
                    <p className="flex items-center gap-1 text-[11px] text-stone-500 truncate mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{landmark.address}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-1.5">
                  {landmark.architects.slice(0, 1).map((arch) => (
                    <span
                      key={arch}
                      className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 truncate max-w-[150px]"
                    >
                      <User className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{arch}</span>
                    </span>
                  ))}
                  {landmark.architectureStyles.slice(0, 1).map((style) => (
                    <span
                      key={style}
                      className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 truncate max-w-[150px]"
                    >
                      <Layers className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{getStyleInfo(style).name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {sortedLandmarks.length === 0 && (
          <div className="p-8 text-center text-stone-500 text-sm">
            No landmarks match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
