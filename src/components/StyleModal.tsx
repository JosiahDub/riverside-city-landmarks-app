import React from 'react';
import { getStyleInfo } from '../data/architecturalStyles';
import { Landmark } from '../types';
import { X, ExternalLink, Filter, MapPin, Layers } from 'lucide-react';

interface StyleModalProps {
  styleKey: string | null;
  onClose: () => void;
  landmarks: Landmark[];
  onSelectLandmark: (landmark: Landmark) => void;
  onFilterByStyle: (styleKey: string) => void;
}

export const StyleModal: React.FC<StyleModalProps> = ({
  styleKey,
  onClose,
  landmarks,
  onSelectLandmark,
  onFilterByStyle,
}) => {
  if (!styleKey) return null;

  const info = getStyleInfo(styleKey);
  const matchingLandmarks = landmarks.filter((l) =>
    l.architectureStyles.includes(styleKey.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl border border-amber-200 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-800">
                  Architectural Style
                </span>
                <code className="text-[11px] font-mono bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                  {styleKey}
                </code>
              </div>
              <h2 className="font-serif font-bold text-2xl text-stone-900 leading-tight">
                {info.name}
              </h2>
              <span className="inline-block text-xs text-stone-500 font-medium mt-0.5">
                Era: {info.era} • {matchingLandmarks.length} Riverside landmark{matchingLandmarks.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Description */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-sm text-stone-700 leading-relaxed font-serif">
            {info.description}
          </div>

          {/* Defining Characteristics */}
          {info.characteristics.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Defining Architectural Characteristics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {info.characteristics.map((char) => (
                  <div
                    key={char}
                    className="flex items-center gap-2 text-xs text-stone-800 bg-amber-50/60 border border-amber-200/80 px-3 py-2 rounded-lg font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                    <span>{char}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links & Filter */}
          <div className="flex flex-wrap gap-3 text-xs">
            <a
              href={info.wikipediaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-medium transition shadow-sm"
            >
              <span>Read on Wikipedia</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
            {info.wikidataId && (
              <a
                href={`https://www.wikidata.org/wiki/${info.wikidataId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-medium transition shadow-sm"
              >
                <span>Wikidata ({info.wikidataId})</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>
            )}
            <button
              onClick={() => {
                onFilterByStyle(styleKey);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Show Only {info.name} Landmarks on Map</span>
            </button>
          </div>

          {/* Matching Landmarks */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Riverside Landmarks with {info.name} Architecture ({matchingLandmarks.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingLandmarks.map((landmark) => (
                <div
                  key={landmark.id}
                  onClick={() => {
                    onSelectLandmark(landmark);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-stone-200 bg-white hover:border-amber-300 hover:shadow-md cursor-pointer transition flex items-start gap-3"
                >
                  {landmark.thumbnail ? (
                    <img
                      src={landmark.thumbnail}
                      alt={landmark.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 font-bold text-xs shrink-0">
                      #{landmark.ref}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                      <span className="font-bold text-amber-800">#{landmark.ref}</span>
                      {landmark.year && <span>• {landmark.year}</span>}
                    </div>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 leading-snug truncate mt-0.5">
                      {landmark.name}
                    </h4>
                    {landmark.architects.length > 0 && (
                      <p className="text-[11px] text-purple-700 truncate mt-0.5">
                        {landmark.architects.join(', ')}
                      </p>
                    )}
                    {landmark.address && (
                      <p className="flex items-center gap-1 text-[11px] text-stone-500 truncate mt-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>{landmark.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
