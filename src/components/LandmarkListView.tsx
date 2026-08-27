import React, { useState } from 'react';
import { Landmark, UserLocation } from '../types';
import { getStyleInfo } from '../data/architecturalStyles';
import { MapPin, User, Layers, Calendar, Compass, ArrowUpDown } from 'lucide-react';

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
  const [sortBy, setSortBy] = useState<SortOption>(userLocation ? 'distance' : 'ref');

  const sortedLandmarks = [...landmarks].sort((a, b) => {
    if (sortBy === 'ref') {
      return a.refNumber - b.refNumber;
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'year') {
      return (a.year || 9999) - (b.year || 9999);
    }
    if (sortBy === 'distance') {
      return (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999);
    }
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-stone-50 border-r border-stone-200">
      {/* Sort & Count Header */}
      <div className="p-3 border-b border-stone-200 bg-white flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-600">
          Showing <span className="text-stone-900 font-bold">{landmarks.length}</span> landmarks
        </span>
        <div className="flex items-center gap-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="ref">Sort by Landmark #</option>
            <option value="name">Sort by Name</option>
            <option value="year">Sort by Year Built</option>
            {userLocation && <option value="distance">Sort by Distance</option>}
          </select>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {sortedLandmarks.map((landmark) => {
          const isSelected = selectedLandmark?.id === landmark.id;
          return (
            <div
              key={landmark.id}
              onClick={() => onSelectLandmark(landmark)}
              className={`p-3 rounded-xl border transition cursor-pointer flex gap-3 ${
                isSelected
                  ? 'bg-amber-50/80 border-amber-400 shadow-md ring-1 ring-amber-400'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'
              }`}
            >
              {landmark.thumbnail ? (
                <img
                  src={landmark.thumbnail}
                  alt={landmark.name}
                  className="w-20 h-20 rounded-lg object-cover bg-stone-100 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-stone-100 flex flex-col items-center justify-center text-stone-400 font-bold text-xs shrink-0 border border-stone-200">
                  <span className="text-stone-300">#</span>
                  <span>{landmark.ref || landmark.refNumber}</span>
                </div>
              )}

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded">
                      #{landmark.ref || landmark.refNumber}
                    </span>
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
