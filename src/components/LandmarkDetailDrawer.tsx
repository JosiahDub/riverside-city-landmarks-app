import React, { useState, useEffect } from 'react';
import { Landmark } from '../types';
import { getStyleInfo } from '../data/architecturalStyles';
import { X, ExternalLink, MapPin, Calendar, Compass, User, BookOpen, Layers, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';

interface LandmarkDetailDrawerProps {
  landmark: Landmark | null;
  onClose: () => void;
  onSelectArchitect: (architect: string) => void;
  onSelectStyle: (styleKey: string) => void;
  onShowArchitectBio: (architect: string) => void;
  onShowStyleInfo: (styleKey: string) => void;
}

export const LandmarkDetailDrawer: React.FC<LandmarkDetailDrawerProps> = ({
  landmark,
  onClose,
  onSelectArchitect,
  onSelectStyle,
  onShowArchitectBio,
  onShowStyleInfo,
}) => {
  const [wikiSummary, setWikiSummary] = useState<string | null>(null);
  const [loadingWiki, setLoadingWiki] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Fetch Wikipedia summary if article title exists
  useEffect(() => {
    if (!landmark) {
      setWikiSummary(null);
      return;
    }

    if (landmark.wikipedia) {
      setLoadingWiki(true);
      const title = encodeURIComponent(landmark.wikipedia.replace(/ /g, '_'));
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.extract) {
            setWikiSummary(data.extract);
          } else {
            setWikiSummary(null);
          }
        })
        .catch(() => setWikiSummary(null))
        .finally(() => setLoadingWiki(false));
    } else {
      setWikiSummary(null);
    }
  }, [landmark]);

  if (!landmark) return null;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${landmark.lat},${landmark.lon}`;

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] lg:w-[520px] bg-white shadow-2xl border-l border-stone-200 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Landmark #{landmark.ref || landmark.refNumber}
            </span>
            {landmark.distanceMiles !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                <Compass className="w-3 h-3 text-blue-600" />
                {landmark.distanceMiles} mi away
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
            title="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="font-serif font-bold text-2xl text-stone-900 leading-snug">
              {landmark.name}
            </h2>
            {landmark.address && (
              <p className="flex items-center gap-1.5 text-stone-600 text-sm mt-1.5">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                <span>{landmark.address}</span>
              </p>
            )}
          </div>

          {/* Image */}
          {landmark.imageUrl ? (
            <div className="relative group rounded-xl overflow-hidden shadow-md bg-stone-100 border border-stone-200">
              <img
                src={landmark.imageUrl}
                alt={landmark.name}
                className="w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                onClick={() => setImageModalOpen(true)}
              />
              <button
                onClick={() => setImageModalOpen(true)}
                className="absolute bottom-2.5 right-2.5 bg-black/70 hover:bg-black text-white text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur transition"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Full Image
              </button>
              {landmark.commonsImage && (
                <div className="p-2 text-[11px] text-stone-500 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
                  <span className="truncate">Wikimedia Commons: {landmark.commonsImage.replace('File:', '')}</span>
                  <a
                    href={`https://commons.wikimedia.org/wiki/${landmark.commonsImage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-terracotta hover:underline shrink-0 ml-2"
                  >
                    Commons Page
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="h-28 rounded-xl border border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-stone-400 text-xs">
              <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
              <span>No image currently linked in OpenStreetMap/Wikidata</span>
            </div>
          )}

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">Year Built / Era</span>
              <div className="flex items-center gap-1.5 font-medium text-stone-800">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>{landmark.year || landmark.startDate || 'Date Unlisted'}</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">Designation</span>
              <span className="font-medium text-stone-800">City Landmark</span>
            </div>
          </div>

          {/* Architects Section */}
          {landmark.architects.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Architect{landmark.architects.length > 1 ? 's' : ''}
              </h3>
              <div className="flex flex-wrap gap-2">
                {landmark.architects.map((arch) => (
                  <div
                    key={arch}
                    className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    <button
                      onClick={() => onShowArchitectBio(arch)}
                      className="hover:underline text-left font-semibold"
                      title="View architect biography"
                    >
                      {arch}
                    </button>
                    <button
                      onClick={() => onSelectArchitect(arch)}
                      className="text-xs bg-purple-200 hover:bg-purple-300 text-purple-900 px-1.5 py-0.5 rounded transition"
                      title={`Filter map to landmarks by ${arch}`}
                    >
                      Filter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architectural Styles Section */}
          {landmark.architectureStyles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Architectural Style{landmark.architectureStyles.length > 1 ? 's' : ''}
              </h3>
              <div className="flex flex-wrap gap-2">
                {landmark.architectureStyles.map((styleKey) => {
                  const info = getStyleInfo(styleKey);
                  return (
                    <div
                      key={styleKey}
                      className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      <button
                        onClick={() => onShowStyleInfo(styleKey)}
                        className="hover:underline text-left font-semibold"
                        title="Learn more about this architectural style"
                      >
                        {info.name}
                      </button>
                      <button
                        onClick={() => onSelectStyle(styleKey)}
                        className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-1.5 py-0.5 rounded transition"
                        title={`Filter map to ${info.name} architecture`}
                      >
                        Filter
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description & Wikipedia Excerpt */}
          {(wikiSummary || landmark.description) && (
            <div className="space-y-2.5 bg-stone-50/70 p-4 rounded-xl border border-stone-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-stone-700" /> Historical Summary
              </h3>
              {loadingWiki && <p className="text-xs text-stone-400 italic">Fetching article details...</p>}
              {wikiSummary ? (
                <p className="text-sm text-stone-700 leading-relaxed font-serif">
                  {wikiSummary}
                </p>
              ) : landmark.description ? (
                <p className="text-sm text-stone-700 leading-relaxed font-serif">
                  {landmark.description}
                </p>
              ) : null}
              {landmark.wikipediaUrl && (
                <a
                  href={landmark.wikipediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-terracotta hover:underline font-medium mt-1"
                >
                  Read full article on Wikipedia <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Free-to-use & Reuse Data Links */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Free Open Data & Verification Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href={landmark.heritageWebsite}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 transition shadow-sm"
              >
                <span>City Heritage Board</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>

              {landmark.wikidataUrl && (
                <a
                  href={landmark.wikidataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 transition shadow-sm"
                >
                  <span>Wikidata ({landmark.wikidata})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </a>
              )}

              {landmark.wikipediaUrl && (
                <a
                  href={landmark.wikipediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 transition shadow-sm"
                >
                  <span>Wikipedia Article</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </a>
              )}

              <a
                href={landmark.osmUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 transition shadow-sm"
              >
                <span>OpenStreetMap ({landmark.osmType})</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-lg border border-stone-300 bg-stone-900 hover:bg-stone-800 text-white font-medium transition shadow-sm"
              >
                <Compass className="w-4 h-4" />
                <span>Get Directions to Landmark</span>
              </a>
            </div>
          </div>

          {/* Raw OSM Tags Accordion */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="w-full flex items-center justify-between p-3.5 text-left bg-stone-50 hover:bg-stone-100 transition text-xs font-semibold text-stone-700"
            >
              <span>View Raw OSM Tags ({Object.keys(landmark.allTags).length})</span>
              {showAllTags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAllTags && (
              <div className="p-3 bg-white border-t border-stone-200 max-h-60 overflow-y-auto font-mono text-[11px] space-y-1.5">
                {Object.entries(landmark.allTags).map(([key, val]) => (
                  <div key={key} className="flex items-start justify-between gap-2 py-0.5 border-b border-stone-100 last:border-0">
                    <span className="text-amber-900 font-semibold shrink-0">{key}</span>
                    <span className="text-stone-600 text-right break-all">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {imageModalOpen && landmark.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-stone-800/80 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={landmark.imageUrl}
            alt={landmark.name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="text-white text-center mt-3" onClick={(e) => e.stopPropagation()}>
            <p className="font-serif font-medium text-lg">{landmark.name}</p>
            {landmark.commonsImage && (
              <p className="text-stone-400 text-xs mt-1">
                Wikimedia Commons: {landmark.commonsImage}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
