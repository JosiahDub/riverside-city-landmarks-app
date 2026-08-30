import React, { useState, useEffect, useMemo } from 'react';
import { Landmark, Plaque } from '../types';
import { getStyleInfo } from '../data/architecturalStyles';
import { X, ExternalLink, MapPin, Calendar, Compass, User, BookOpen, Layers, ChevronDown, ChevronUp, Image as ImageIcon, Award, Star, ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);

  // Gallery images combining main building photo and on-site plaque photos
  const galleryImages = useMemo(() => {
    if (!landmark) return [];
    const list: { url: string; title: string; subtitle?: string; commons?: string; type: 'building' | 'plaque'; osmUrl?: string }[] = [];
    if (landmark.imageUrl) {
      list.push({
        url: landmark.imageUrl,
        title: landmark.name,
        subtitle: 'Landmark Building / Feature',
        commons: landmark.commonsImage || undefined,
        type: 'building',
        osmUrl: landmark.osmUrl
      });
    }
    (landmark.plaques || []).forEach((pl, idx) => {
      if (pl.imageUrl) {
        list.push({
          url: pl.imageUrl,
          title: pl.name || `Historical Plaque ${idx + 1}`,
          subtitle: 'On-Site Historical Plaque',
          commons: pl.commonsImage || undefined,
          type: 'plaque',
          osmUrl: pl.osmUrl
        });
      }
    });
    return list;
  }, [landmark]);

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
          {/* Title & Badges */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {landmark.isNationalHistoricLandmark && (
                <span className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs">
                  <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                  <span>National Historic Landmark{landmark.nationalHistoricLandmarkDate ? ` (Designated ${landmark.nationalHistoricLandmarkDate})` : ''}</span>
                </span>
              )}
              {landmark.hasPlaque && (
                <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-lg shadow-xs">
                  <ScrollText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{landmark.plaques?.length || 1} Historical Plaque{(landmark.plaques?.length || 1) > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
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

          {/* Image Block */}
          {landmark.imageUrl ? (
            <div className="relative group rounded-xl overflow-hidden shadow-md bg-stone-100 border border-stone-200">
              <img
                src={landmark.imageUrl}
                alt={landmark.name}
                className="w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                onClick={() => {
                  setModalImageIndex(0);
                  setImageModalOpen(true);
                }}
              />
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                {landmark.plaques && landmark.plaques.some(p => p.imageUrl) && (
                  <button
                    onClick={() => {
                      const firstPlaqueIdx = galleryImages.findIndex(g => g.type === 'plaque');
                      setModalImageIndex(firstPlaqueIdx !== -1 ? firstPlaqueIdx : 0);
                      setImageModalOpen(true);
                    }}
                    className="bg-amber-900/90 hover:bg-amber-950 text-white text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur transition shadow-md font-medium"
                    title="View historical plaque photo"
                  >
                    <ScrollText className="w-3.5 h-3.5 text-amber-300" />
                    <span>View Plaque{landmark.plaques.length > 1 ? ` (${landmark.plaques.length})` : ''}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setModalImageIndex(0);
                    setImageModalOpen(true);
                  }}
                  className="bg-black/70 hover:bg-black text-white text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur transition shadow-md"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Full Image
                </button>
              </div>
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
          ) : landmark.plaques && landmark.plaques.some(p => p.imageUrl) ? (
            /* Fallback to first plaque image if main building photo is missing */
            <div className="relative group rounded-xl overflow-hidden shadow-md bg-stone-100 border border-stone-200">
              <img
                src={landmark.plaques.find(p => p.imageUrl)!.imageUrl!}
                alt="Historical Plaque"
                className="w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                onClick={() => {
                  setModalImageIndex(0);
                  setImageModalOpen(true);
                }}
              />
              <div className="absolute top-2.5 left-2.5 bg-amber-900/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md backdrop-blur flex items-center gap-1 shadow-xs">
                <ScrollText className="w-3 h-3 text-amber-300" />
                <span>On-Site Historical Plaque</span>
              </div>
              <button
                onClick={() => {
                  setModalImageIndex(0);
                  setImageModalOpen(true);
                }}
                className="absolute bottom-2.5 right-2.5 bg-black/70 hover:bg-black text-white text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur transition shadow-md font-medium"
              >
                <ImageIcon className="w-3.5 h-3.5" /> View Plaque Photo
              </button>
            </div>
          ) : (
            <div className="h-28 rounded-xl border border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-stone-400 text-xs">
              <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
              <span>No image currently linked in OpenStreetMap/Wikidata</span>
            </div>
          )}

          {/* Quick Facts Grid */}
          <div className={`grid ${landmark.isNationalHistoricLandmark ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'} gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200 text-sm`}>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">Year Built / Era</span>
              <div className="flex items-center gap-1.5 font-medium text-stone-800">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{landmark.year || landmark.startDate || 'Date Unlisted'}</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">City Landmark</span>
              <div className="flex items-center gap-1.5 font-medium text-stone-800">
                <Award className="w-4 h-4 text-purple-700 shrink-0" />
                <span className="truncate">
                  {landmark.designationDate ? `Designated ${landmark.designationDate}` : 'City of Riverside'}
                </span>
              </div>
            </div>
            {landmark.isNationalHistoricLandmark && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-0.5">National Landmark</span>
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                  <span className="truncate">
                    {landmark.nationalHistoricLandmarkDate ? `Designated ${landmark.nationalHistoricLandmarkDate}` : 'National Landmark'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Historical Plaques Section */}
          {landmark.plaques && landmark.plaques.length > 0 && (
            <div className="space-y-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <ScrollText className="w-4 h-4 text-amber-700" />
                  Historical Plaque{landmark.plaques.length > 1 ? `s (${landmark.plaques.length})` : ''}
                </h3>
                <span className="text-[11px] text-amber-800 font-medium bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  Mapped on OSM
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {landmark.plaques.map((plaque, idx) => (
                  <div
                    key={plaque.id || idx}
                    className="bg-white rounded-lg border border-amber-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    {plaque.imageUrl ? (
                      <div
                        className="relative group h-36 bg-stone-100 cursor-pointer overflow-hidden"
                        onClick={() => {
                          const plIdx = galleryImages.findIndex(g => g.url === plaque.imageUrl);
                          setModalImageIndex(plIdx !== -1 ? plIdx : 0);
                          setImageModalOpen(true);
                        }}
                      >
                        <img
                          src={plaque.imageUrl}
                          alt={plaque.name || 'Historical Plaque'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-black/75 text-white text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition">
                            <ImageIcon className="w-3.5 h-3.5" /> View Plaque
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 bg-amber-50/50 flex flex-col items-center justify-center text-amber-800/60 text-xs">
                        <ScrollText className="w-5 h-5 mb-1" />
                        <span>Plaque mapped on OSM</span>
                      </div>
                    )}

                    <div className="p-2.5">
                      <h4 className="font-serif font-bold text-xs text-stone-900 leading-tight">
                        {plaque.name || 'Historical Plaque'}
                      </h4>
                      {plaque.material && (
                        <span className="text-[10px] text-stone-500 capitalize block mt-0.5">
                          Material: {plaque.material}
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-100 text-[11px]">
                        {plaque.imageUrl ? (
                          <button
                            onClick={() => {
                              const plIdx = galleryImages.findIndex(g => g.url === plaque.imageUrl);
                              setModalImageIndex(plIdx !== -1 ? plIdx : 0);
                              setImageModalOpen(true);
                            }}
                            className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 hover:underline"
                          >
                            <span>View Plaque</span>
                          </button>
                        ) : (
                          <span className="text-stone-400 text-[10px]">Photo unlisted</span>
                        )}

                        <a
                          href={plaque.osmUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-stone-500 hover:text-stone-800 flex items-center gap-0.5 ml-auto text-[10px]"
                          title="View node on OpenStreetMap"
                        >
                          <span>OSM Plaque</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Gallery / Full Image Modal (Building + Plaques) */}
      {imageModalOpen && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4"
          onClick={() => setImageModalOpen(false)}
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-white max-w-4xl px-2 py-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                {modalImageIndex + 1} / {galleryImages.length}
              </span>
              <span className="text-xs font-medium text-stone-300">
                {galleryImages[modalImageIndex]?.subtitle}
              </span>
            </div>
            <button
              onClick={() => setImageModalOpen(false)}
              className="p-2 text-white/80 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-700 transition"
              title="Close image viewer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image Container with Left/Right Navigation */}
          <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center min-h-0 py-2" onClick={(e) => e.stopPropagation()}>
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                }}
                className="absolute left-2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur border border-white/10"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={galleryImages[modalImageIndex]?.url}
              alt={galleryImages[modalImageIndex]?.title}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
            />

            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition backdrop-blur border border-white/10"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Info & Selector Tabs */}
          <div className="w-full max-w-4xl text-center space-y-2 pb-2" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="text-white font-serif font-bold text-base sm:text-lg leading-snug">
                {galleryImages[modalImageIndex]?.title}
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-stone-400 mt-1 flex-wrap">
                {galleryImages[modalImageIndex]?.commons && (
                  <span>Wikimedia Commons: <strong className="text-stone-300 font-mono">{galleryImages[modalImageIndex].commons}</strong></span>
                )}
                {galleryImages[modalImageIndex]?.osmUrl && (
                  <a
                    href={galleryImages[modalImageIndex].osmUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View on OpenStreetMap</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Thumbnail Selector */}
            {galleryImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1 overflow-x-auto max-w-full px-4">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setModalImageIndex(i)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      i === modalImageIndex ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105' : 'border-stone-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                    {img.type === 'plaque' && (
                      <span className="absolute bottom-0 inset-x-0 bg-amber-900/90 text-[8px] text-amber-200 text-center font-bold">
                        Plaque
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
