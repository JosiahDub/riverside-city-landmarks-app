import React, { useState, useMemo } from 'react';
import { Landmark } from '../types';
import { ARCHITECTS_DIRECTORY, getArchitectInfo } from '../data/architects';
import { ARCHITECTURE_STYLES, getStyleInfo } from '../data/architecturalStyles';
import { X, User, Layers, Calendar, Trees, ExternalLink, Filter, Search } from 'lucide-react';

interface TagExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  landmarks: Landmark[];
  onSelectArchitect: (architect: string) => void;
  onSelectStyle: (styleKey: string) => void;
  onSelectEra: (minYear: number, maxYear: number) => void;
}

type TabType = 'architects' | 'styles' | 'eras' | 'nature';

export const TagExplorerModal: React.FC<TagExplorerModalProps> = ({
  isOpen,
  onClose,
  landmarks,
  onSelectArchitect,
  onSelectStyle,
  onSelectEra,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('architects');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all unique architects with counts
  const architectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    landmarks.forEach((l) => {
      l.architects.forEach((arch) => {
        counts[arch] = (counts[arch] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        ...getArchitectInfo(name),
        count,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [landmarks]);

  // Extract all unique styles with counts
  const styleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    landmarks.forEach((l) => {
      l.architectureStyles.forEach((style) => {
        counts[style] = (counts[style] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([key, count]) => ({
        ...getStyleInfo(key),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [landmarks]);

  // Eras distribution
  const eras = [
    { label: 'Victorian & Pioneer Era (1870–1899)', min: 1870, max: 1899, desc: 'Early citrus settlement, Queen Anne mansions, Washington Navel Orange tree.' },
    { label: 'Beaux-Arts & Citrus Boom (1900–1915)', min: 1900, max: 1915, desc: 'Monumental Courthouse, early Mission Inn expansion, grand classicism.' },
    { label: 'Mission & Spanish Revival Golden Age (1916–1935)', min: 1916, max: 1935, desc: 'Municipal Auditorium, Mission Inn Rotunda, Peter J. Weber & G. Stanley Wilson masterworks.' },
    { label: 'Pre-War & Art Deco (1936–1949)', min: 1936, max: 1949, desc: 'Late historic revival residences and public infrastructure.' },
    { label: 'Mid-Century Modern & Contemporary (1950–Present)', min: 1950, max: 2026, desc: 'Riverside City Hall, modernist residences by Herman Ruhnau and Lois Gottlieb.' },
  ].map((era) => {
    const count = landmarks.filter((l) => l.year && l.year >= era.min && l.year <= era.max).length;
    return { ...era, count };
  });

  // Natural landmarks
  const natureLandmarks = useMemo(() => {
    return landmarks.filter((l) => l.natural || l.allTags.species || l.allTags.genus);
  }, [landmarks]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
              Landmark Tag & Value Explorer
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Explore unique OSM and Wikidata tags across all {landmarks.length} Riverside landmarks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons & Search */}
        <div className="p-3 sm:p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('architects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'architects'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Architects ({architectCounts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('styles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'styles'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Styles ({styleCounts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('eras')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'eras'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Eras / Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab('nature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                activeTab === 'nature'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span>Trees & Nature ({natureLandmarks.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50">
          {/* TAB 1: ARCHITECTS */}
          {activeTab === 'architects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {architectCounts
                .filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((arch) => (
                  <div
                    key={arch.name}
                    className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {arch.portraitUrl ? (
                            <img
                              src={arch.portraitUrl}
                              alt={arch.name}
                              className="w-14 h-14 rounded-full object-cover border-2 border-purple-200 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg border border-purple-200 shrink-0">
                              {arch.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-serif font-bold text-base text-stone-900">
                              {arch.name}
                            </h3>
                            <span className="inline-block mt-0.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                              {arch.count} Riverside landmark{arch.count > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      {arch.bio && (
                        <p className="text-xs text-stone-600 mt-3 line-clamp-3 leading-relaxed">
                          {arch.bio}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {arch.wikipediaUrl && (
                          <a
                            href={arch.wikipediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 hover:underline"
                          >
                            <span>Wikipedia</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </a>
                        )}
                        {arch.wikidataId && (
                          <a
                            href={`https://www.wikidata.org/wiki/${arch.wikidataId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 hover:underline"
                          >
                            <span>Wikidata ({arch.wikidataId})</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          onSelectArchitect(arch.name);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
                      >
                        <Filter className="w-3 h-3" />
                        <span>Filter Map</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB 2: ARCHITECTURAL STYLES */}
          {activeTab === 'styles' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                OSM tag <code className="font-mono text-amber-900 font-bold">building:architecture</code> uses abbreviated values (e.g. <code className="font-mono">queen_anne</code>, <code className="font-mono">mission_revival</code>). Below is the comprehensive index linking each architectural style to its history and Wikipedia article.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {styleCounts
                  .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.key.includes(searchTerm.toLowerCase()))
                  .map((style) => (
                    <div
                      key={style.key}
                      className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-base text-stone-900">
                              {style.name}
                            </h3>
                            <code className="text-[11px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                              {style.key}
                            </code>
                          </div>
                          <span className="text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                            {style.count} landmark{style.count > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-medium mb-2">
                          Era: {style.era}
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed mb-3">
                          {style.description}
                        </p>
                        {style.characteristics && style.characteristics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {style.characteristics.map((char) => (
                              <span
                                key={char}
                                className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded"
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <a
                          href={style.wikipediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline font-medium"
                        >
                          <span>Learn more on Wikipedia</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => {
                            onSelectStyle(style.key);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
                        >
                          <Filter className="w-3 h-3" />
                          <span>Filter Map</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: ERAS / TIMELINE */}
          {activeTab === 'eras' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Filter landmarks built within historic eras of the City of Riverside.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {eras.map((era) => (
                  <div
                    key={era.label}
                    className="bg-white rounded-xl p-4 border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-base text-stone-900">
                          {era.label}
                        </h4>
                        <span className="text-xs font-semibold bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full">
                          {era.count} landmarks
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">{era.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        onSelectEra(era.min, era.max);
                        onClose();
                      }}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 text-xs bg-stone-900 hover:bg-stone-800 text-white font-medium px-4 py-2 rounded-lg transition"
                    >
                      <Filter className="w-3 h-3" />
                      <span>Filter {era.min}–{era.max}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: NATURE & TREES */}
          {activeTab === 'nature' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600">
                Riverside has designated historic living trees and botanical landmarks honoring the citrus boom and regional heritage.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {natureLandmarks.map((tree) => (
                  <div
                    key={tree.id}
                    className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm flex items-start gap-3"
                  >
                    {tree.thumbnail ? (
                      <img
                        src={tree.thumbnail}
                        alt={tree.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Trees className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                          Landmark #{tree.ref || tree.refNumber}
                        </span>
                        {tree.year && <span className="text-xs text-stone-500">{tree.year}</span>}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 mt-1 truncate">
                        {tree.name}
                      </h4>
                      {tree.allTags.species && (
                        <p className="text-xs text-emerald-700 italic font-mono mt-0.5">
                          {tree.allTags.species}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
