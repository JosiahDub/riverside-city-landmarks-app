import React from 'react';
import { getArchitectInfo } from '../data/architects';
import { Landmark } from '../types';
import { X, ExternalLink, Filter, MapPin } from 'lucide-react';

interface ArchitectModalProps {
  architectName: string | null;
  onClose: () => void;
  landmarks: Landmark[];
  onSelectLandmark: (landmark: Landmark) => void;
  onFilterByArchitect: (architect: string) => void;
}

export const ArchitectModal: React.FC<ArchitectModalProps> = ({
  architectName,
  onClose,
  landmarks,
  onSelectLandmark,
  onFilterByArchitect,
}) => {
  if (!architectName) return null;

  const info = getArchitectInfo(architectName);
  const works = landmarks.filter((l) =>
    l.architects.some((a) => a.toLowerCase() === architectName.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {info.portraitUrl ? (
              <img
                src={info.portraitUrl}
                alt={info.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-300 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-2xl border border-purple-200 shrink-0">
                {info.name.charAt(0)}
              </div>
            )}
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-purple-700 block">
                Master Architect
              </span>
              <h2 className="font-serif font-bold text-2xl text-stone-900 leading-tight">
                {info.name}
              </h2>
              <span className="inline-block text-xs text-stone-500 font-medium mt-0.5">
                {works.length} Riverside designated landmark{works.length === 1 ? '' : 's'}
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
          {/* Biography */}
          {info.bio && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-sm text-stone-700 leading-relaxed font-serif">
              {info.bio}
            </div>
          )}

          {/* External Links */}
          <div className="flex flex-wrap gap-3 text-xs">
            {info.wikipediaUrl && (
              <a
                href={info.wikipediaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-medium transition shadow-sm"
              >
                <span>Read Wikipedia Article</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>
            )}
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
                onFilterByArchitect(architectName);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Show Only {info.name}'s Works on Map</span>
            </button>
          </div>

          {/* Designated Works */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Designated Landmarks in Riverside ({works.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {works.map((landmark) => (
                <div
                  key={landmark.id}
                  onClick={() => {
                    onSelectLandmark(landmark);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-stone-200 bg-white hover:border-purple-300 hover:shadow-md cursor-pointer transition flex items-start gap-3"
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
