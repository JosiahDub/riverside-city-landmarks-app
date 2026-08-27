import React from 'react';
import { FilterState } from '../types';
import { Search, Tag, Calendar, Compass, List, Map as MapIcon, X, SlidersHorizontal, RefreshCw, ClipboardCheck } from 'lucide-react';

interface NavbarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onOpenTagExplorer: () => void;
  onToggleTimeline: () => void;
  timelineOpen: boolean;
  totalCount: number;
  filteredCount: number;
  viewMode: 'split' | 'map' | 'list';
  onViewModeChange: (mode: 'split' | 'map' | 'list') => void;
  onLocateUser: () => void;
  isLocating: boolean;
  isSyncing: boolean;
  onOpenStatusPage: () => void;
  isStatusPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  filters,
  onFilterChange,
  onOpenTagExplorer,
  onToggleTimeline,
  timelineOpen,
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  onLocateUser,
  isLocating,
  onResetFilters,
  onSyncLive,
  isSyncing,
  onOpenStatusPage,
  isStatusPage,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.selectedArchitects.length > 0 ||
    filters.selectedStyles.length > 0 ||
    filters.yearMin !== null ||
    filters.yearMax !== null ||
    filters.hasImageOnly ||
    filters.category !== 'all';

  return (
    <header className="bg-white border-b border-stone-200 shadow-sm z-20 shrink-0">
      {/* Primary Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Branding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta to-amber-700 text-white flex items-center justify-center shadow-md font-serif font-bold text-xl">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-stone-900 leading-tight">
                  Riverside Landmarks
                </h1>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  OSM + Wikidata
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                City of Riverside Cultural Heritage Board • 100% Free Open Data
              </p>
            </div>
          </div>

          {/* Mobile view toggle */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => onViewModeChange(viewMode === 'map' ? 'list' : 'map')}
              className="p-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 text-xs flex items-center gap-1"
            >
              {viewMode === 'map' ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search landmark name, #, architect, style, address..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Data Status Audit Button */}
          <button
            onClick={onOpenStatusPage}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition shrink-0 ${
              isStatusPage
                ? 'bg-rose-700 text-white border-rose-800'
                : 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900'
            }`}
            title="View data completeness audit for dates, styles, architects, and residents"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-rose-700" />
            <span>Data Status</span>
          </button>

          {/* Explore Tags Button */}
          <button
            onClick={onOpenTagExplorer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold shadow-sm transition shrink-0"
          >
            <Tag className="w-3.5 h-3.5 text-purple-700" />
            <span>Tags Explorer</span>
          </button>

          {/* Timeline Toggle */}
          <button
            onClick={onToggleTimeline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition shrink-0 ${
              timelineOpen || filters.yearMin !== null || filters.yearMax !== null
                ? 'bg-amber-600 text-white border-amber-700'
                : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          {/* Geolocation Button */}
          <button
            onClick={onLocateUser}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold shadow-sm transition shrink-0"
          >
            <Compass className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
          </button>

          {/* Sync / Refresh */}
          <button
            onClick={onSyncLive}
            disabled={isSyncing}
            title="Refresh latest tags from OpenStreetMap & Wikidata"
            className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 shadow-sm transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-terracotta' : ''}`} />
          </button>

          {/* View Mode Desktop Toggle */}
          <div className="hidden md:flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-100 p-0.5 shrink-0">
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                viewMode === 'split' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Split View (List + Map)"
            >
              Split
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                viewMode === 'map' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Full Map"
            >
              Map
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Full List"
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="bg-stone-50 border-t border-stone-200 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-stone-600 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-stone-500" />
              Active Filters:
            </span>

            {/* Selected Architects */}
            {filters.selectedArchitects.map((arch) => (
              <span
                key={arch}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full font-medium"
              >
                <span>Architect: {arch}</span>
                <button
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      selectedArchitects: filters.selectedArchitects.filter((a) => a !== arch),
                    })
                  }
                  className="hover:text-purple-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Selected Styles */}
            {filters.selectedStyles.map((style) => (
              <span
                key={style}
                className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-medium"
              >
                <span>Style: {style}</span>
                <button
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      selectedStyles: filters.selectedStyles.filter((s) => s !== style),
                    })
                  }
                  className="hover:text-amber-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Year Range */}
            {(filters.yearMin !== null || filters.yearMax !== null) && (
              <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-900 border border-stone-300 px-2 py-0.5 rounded-full font-medium">
                <span>
                  Years: {filters.yearMin ?? 'Early'}–{filters.yearMax ?? 'Present'}
                </span>
                <button
                  onClick={() => onFilterChange({ ...filters, yearMin: null, yearMax: null })}
                  className="hover:text-stone-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-stone-500">
              Showing <strong className="text-stone-900">{filteredCount}</strong> of {totalCount}
            </span>
            <button
              onClick={onResetFilters}
              className="text-terracotta hover:underline font-semibold text-xs"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
