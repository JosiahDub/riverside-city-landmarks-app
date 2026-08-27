import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';

interface YearRangeFilterProps {
  minYear: number | null;
  maxYear: number | null;
  onChange: (min: number | null, max: number | null) => void;
  minPossibleYear?: number;
  maxPossibleYear?: number;
  matchingCount?: number;
}

export const YearRangeFilter: React.FC<YearRangeFilterProps> = ({
  minYear,
  maxYear,
  onChange,
  minPossibleYear = 1870,
  maxPossibleYear = 1980,
  matchingCount,
}) => {
  const currentMin = minYear ?? minPossibleYear;
  const currentMax = maxYear ?? maxPossibleYear;
  const isFiltered = minYear !== null || maxYear !== null;

  const presets = [
    { label: 'All Years', min: null, max: null },
    { label: '1890–1920', min: 1890, max: 1920 },
    { label: '1870–1900', min: 1870, max: 1900 },
    { label: '1900–1930', min: 1900, max: 1930 },
    { label: '1930–1980', min: 1930, max: 1980 },
  ];

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 border border-stone-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Year Built Timeline
          </span>
        </div>
        {isFiltered && (
          <button
            onClick={() => onChange(null, null)}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition"
            title="Reset year filter"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const isActive = minYear === p.min && maxYear === p.max;
          return (
            <button
              key={p.label}
              onClick={() => onChange(p.min, p.max)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Range Sliders / Inputs */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
          <span>{currentMin}</span>
          <span className="text-stone-400 font-normal">to</span>
          <span>{currentMax}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">From Year</label>
            <input
              type="number"
              min={minPossibleYear}
              max={currentMax}
              value={currentMin}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChange(val, currentMax);
              }}
              className="w-full text-xs p-1.5 border border-stone-200 rounded bg-stone-50 text-stone-800"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">To Year</label>
            <input
              type="number"
              min={currentMin}
              max={maxPossibleYear}
              value={currentMax}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChange(currentMin, val);
              }}
              className="w-full text-xs p-1.5 border border-stone-200 rounded bg-stone-50 text-stone-800"
            />
          </div>
        </div>

        {matchingCount !== undefined && isFiltered && (
          <div className="text-[11px] text-amber-800 font-medium text-center pt-1">
            {matchingCount} landmark{matchingCount === 1 ? '' : 's'} built between {currentMin} and {currentMax}
          </div>
        )}
      </div>
    </div>
  );
};
