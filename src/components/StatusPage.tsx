import React, { useState, useMemo } from 'react';
import { Landmark } from '../types';
import { getStyleInfo } from '../data/architecturalStyles';
import { 
  CheckCircle2, XCircle, AlertCircle, ExternalLink, Search, 
  ArrowLeft, Download, Copy, Check, Filter, Layers, User, Calendar, Image as ImageIcon, Users
} from 'lucide-react';

interface StatusPageProps {
  landmarks: Landmark[];
  onBackToMap: () => void;
  onSelectLandmarkOnMap: (landmark: Landmark) => void;
}

type MissingFilter = 'all' | 'missing_any' | 'missing_date' | 'missing_style' | 'missing_architect' | 'missing_image' | 'missing_residents' | 'complete';
type SortField = 'ref' | 'name' | 'missingCount';

export const StatusPage: React.FC<StatusPageProps> = ({
  landmarks,
  onBackToMap,
  onSelectLandmarkOnMap,
}) => {
  const [filterType, setFilterType] = useState<MissingFilter>('missing_any');
  const [searchQuery, setSearchQuery] = useState('');
  const [excludeNature, setExcludeNature] = useState(true);
  const [sortField, setSortField] = useState<SortField>('ref');
  const [sortAsc, setSortAsc] = useState(true);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Categorize landmarks
  const isNatureLandmark = (l: Landmark) => Boolean(l.natural || l.allTags.species || l.allTags.genus);

  const baseList = useMemo(() => {
    if (excludeNature) {
      return landmarks.filter((l) => !isNatureLandmark(l));
    }
    return landmarks;
  }, [landmarks, excludeNature]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = baseList.length;
    let hasDate = 0;
    let hasStyle = 0;
    let hasArchitect = 0;
    let hasImage = 0;
    let hasResidents = 0;
    let fullyComplete = 0;

    baseList.forEach((l) => {
      const dateOk = Boolean(l.year || l.startDate);
      const styleOk = l.architectureStyles && l.architectureStyles.length > 0;
      const archOk = l.architects && l.architects.length > 0;
      const imgOk = Boolean(l.imageUrl);
      const resOk = Boolean(l.notableResidents && l.notableResidents.length > 0);

      if (dateOk) hasDate++;
      if (styleOk) hasStyle++;
      if (archOk) hasArchitect++;
      if (imgOk) hasImage++;
      if (resOk) hasResidents++;
      if (dateOk && styleOk && archOk) fullyComplete++;
    });

    return {
      total,
      hasDate,
      missingDate: total - hasDate,
      hasStyle,
      missingStyle: total - hasStyle,
      hasArchitect,
      missingArchitect: total - hasArchitect,
      hasImage,
      missingImage: total - hasImage,
      hasResidents,
      missingResidents: total - hasResidents,
      fullyComplete,
    };
  }, [baseList]);

  // Filtered landmarks
  const filteredLandmarks = useMemo(() => {
    return baseList.filter((l) => {
      const hasDate = Boolean(l.year || l.startDate);
      const hasStyle = l.architectureStyles && l.architectureStyles.length > 0;
      const hasArchitect = l.architects && l.architects.length > 0;
      const hasImage = Boolean(l.imageUrl);
      const hasResidents = Boolean(l.notableResidents && l.notableResidents.length > 0);

      // Status filter
      if (filterType === 'missing_any' && hasDate && hasStyle && hasArchitect) return false;
      if (filterType === 'missing_date' && hasDate) return false;
      if (filterType === 'missing_style' && hasStyle) return false;
      if (filterType === 'missing_architect' && hasArchitect) return false;
      if (filterType === 'missing_image' && hasImage) return false;
      if (filterType === 'missing_residents' && hasResidents) return false;
      if (filterType === 'complete' && (!hasDate || !hasStyle || !hasArchitect)) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = l.ref.toLowerCase().includes(q);
        const matchesName = l.name.toLowerCase().includes(q);
        const matchesAddress = l.address ? l.address.toLowerCase().includes(q) : false;
        if (!matchesRef && !matchesName && !matchesAddress) return false;
      }

      return true;
    });
  }, [baseList, filterType, searchQuery]);

  // Sorted landmarks
  const sortedLandmarks = useMemo(() => {
    return [...filteredLandmarks].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'ref') {
        comparison = a.refNumber - b.refNumber;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'missingCount') {
        const aMissing = (a.year ? 0 : 1) + (a.architectureStyles.length ? 0 : 1) + (a.architects.length ? 0 : 1);
        const bMissing = (b.year ? 0 : 1) + (b.architectureStyles.length ? 0 : 1) + (b.architects.length ? 0 : 1);
        comparison = bMissing - aMissing;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredLandmarks, sortField, sortAsc]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['RefNumber', 'Name', 'YearBuilt', 'HasDate', 'ArchitectureStyle', 'HasStyle', 'Architects', 'HasArchitect', 'HasImage', 'NotableResidents', 'WikidataID', 'OSMUrl'];
    const rows = sortedLandmarks.map((l) => [
      `"${l.ref}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.year || l.startDate || ''}"`,
      l.year || l.startDate ? 'YES' : 'NO',
      `"${l.architectureStyles.join('; ')}"`,
      l.architectureStyles.length > 0 ? 'YES' : 'NO',
      `"${l.architects.join('; ')}"`,
      l.architects.length > 0 ? 'YES' : 'NO',
      l.imageUrl ? 'YES' : 'NO',
      `"${(l.notableResidents || []).join('; ')}"`,
      `"${l.wikidata || ''}"`,
      `"${l.osmUrl}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riverside-landmarks-data-status-${filterType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy missing ref numbers to clipboard
  const handleCopyRefs = () => {
    const refs = sortedLandmarks.map((l) => l.ref).join(', ');
    navigator.clipboard.writeText(refs);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-30 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-stone-900 leading-tight">
                  Data Quality & Completeness Audit
                </h1>
                <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Status Tracker
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Track landmarks that need construction dates, styles, architects, and notable residents in OpenStreetMap & Wikidata
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopyRefs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium shadow-sm transition"
              title="Copy visible landmark reference numbers"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
              <span>{copiedNotification ? 'Copied Refs!' : 'Copy Refs'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-sm transition"
              title="Export visible data to CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 w-full space-y-6 flex-1">
        {/* Progress Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Audited</span>
            <div className="mt-2">
              <span className="text-2xl font-bold text-stone-900">{stats.total}</span>
              <span className="text-[11px] text-stone-500 ml-1.5">landmarks</span>
            </div>
            <div className="mt-2 text-[10px] text-stone-400">
              {stats.fullyComplete} complete ({Math.round((stats.fullyComplete / stats.total) * 100)}%)
            </div>
          </div>

          {/* Dates */}
          <div 
            onClick={() => setFilterType('missing_date')}
            className={`p-3.5 rounded-xl border shadow-sm cursor-pointer transition flex flex-col justify-between ${
              filterType === 'missing_date' ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20' : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-700" /> Date / Year
              </span>
              <span className="text-xs font-bold text-amber-900">{stats.hasDate}/{stats.total}</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-stone-900">{stats.missingDate}</span>
                <span className="text-[11px] font-semibold text-rose-600">missing</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${(stats.hasDate / stats.total) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">{Math.round((stats.hasDate / stats.total) * 100)}% filled</div>
          </div>

          {/* Styles */}
          <div 
            onClick={() => setFilterType('missing_style')}
            className={`p-3.5 rounded-xl border shadow-sm cursor-pointer transition flex flex-col justify-between ${
              filterType === 'missing_style' ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20' : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-700" /> Style
              </span>
              <span className="text-xs font-bold text-amber-900">{stats.hasStyle}/{stats.total}</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-stone-900">{stats.missingStyle}</span>
                <span className="text-[11px] font-semibold text-rose-600">missing</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${(stats.hasStyle / stats.total) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">{Math.round((stats.hasStyle / stats.total) * 100)}% filled</div>
          </div>

          {/* Architects */}
          <div 
            onClick={() => setFilterType('missing_architect')}
            className={`p-3.5 rounded-xl border shadow-sm cursor-pointer transition flex flex-col justify-between ${
              filterType === 'missing_architect' ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-400/20' : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                <User className="w-3 h-3 text-purple-700" /> Architect
              </span>
              <span className="text-xs font-bold text-purple-900">{stats.hasArchitect}/{stats.total}</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-stone-900">{stats.missingArchitect}</span>
                <span className="text-[11px] font-semibold text-rose-600">missing</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(stats.hasArchitect / stats.total) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">{Math.round((stats.hasArchitect / stats.total) * 100)}% filled</div>
          </div>

          {/* Images */}
          <div 
            onClick={() => setFilterType('missing_image')}
            className={`p-3.5 rounded-xl border shadow-sm cursor-pointer transition flex flex-col justify-between ${
              filterType === 'missing_image' ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/20' : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-emerald-700" /> Photo
              </span>
              <span className="text-xs font-bold text-emerald-900">{stats.hasImage}/{stats.total}</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-stone-900">{stats.missingImage}</span>
                <span className="text-[11px] font-semibold text-rose-600">missing</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(stats.hasImage / stats.total) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">{Math.round((stats.hasImage / stats.total) * 100)}% filled</div>
          </div>

          {/* Notable Residents */}
          <div 
            onClick={() => setFilterType('missing_residents')}
            className={`p-3.5 rounded-xl border shadow-sm cursor-pointer transition flex flex-col justify-between ${
              filterType === 'missing_residents' ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20' : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-700" /> Residents
              </span>
              <span className="text-xs font-bold text-blue-900">{stats.hasResidents}/{stats.total}</span>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-stone-900">{stats.missingResidents}</span>
                <span className="text-[11px] font-semibold text-stone-400">unlisted</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(stats.hasResidents / stats.total) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">Ready for research</div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setFilterType('missing_any')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'missing_any' ? 'bg-rose-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Missing Any Core Field
            </button>
            <button
              onClick={() => setFilterType('missing_date')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'missing_date' ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Missing Date ({stats.missingDate})
            </button>
            <button
              onClick={() => setFilterType('missing_style')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'missing_style' ? 'bg-amber-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Missing Style ({stats.missingStyle})
            </button>
            <button
              onClick={() => setFilterType('missing_architect')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'missing_architect' ? 'bg-purple-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Missing Architect ({stats.missingArchitect})
            </button>
            <button
              onClick={() => setFilterType('missing_image')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'missing_image' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Missing Photo ({stats.missingImage})
            </button>
            <button
              onClick={() => setFilterType('complete')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'complete' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Fully Complete ({stats.fullyComplete})
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === 'all' ? 'bg-stone-900 text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All ({stats.total})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeNature}
                onChange={(e) => setExcludeNature(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Buildings only (hide trees/parks)</span>
            </label>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search landmark or #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Results Counter & Sorting */}
        <div className="flex items-center justify-between text-xs text-stone-600 px-1">
          <div>
            Showing <strong className="text-stone-900">{sortedLandmarks.length}</strong> landmarks
          </div>
          <div className="flex items-center gap-3">
            <span className="text-stone-400">Sort by:</span>
            <button
              onClick={() => {
                if (sortField === 'ref') setSortAsc(!sortAsc);
                else { setSortField('ref'); setSortAsc(true); }
              }}
              className={`font-semibold hover:underline ${sortField === 'ref' ? 'text-amber-800' : 'text-stone-600'}`}
            >
              Ref # {sortField === 'ref' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => {
                if (sortField === 'name') setSortAsc(!sortAsc);
                else { setSortField('name'); setSortAsc(true); }
              }}
              className={`font-semibold hover:underline ${sortField === 'name' ? 'text-amber-800' : 'text-stone-600'}`}
            >
              Name {sortField === 'name' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => {
                if (sortField === 'missingCount') setSortAsc(!sortAsc);
                else { setSortField('missingCount'); setSortAsc(false); }
              }}
              className={`font-semibold hover:underline ${sortField === 'missingCount' ? 'text-amber-800' : 'text-stone-600'}`}
            >
              Most Incomplete {sortField === 'missingCount' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-600 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-14">#</th>
                  <th className="py-3 px-4 min-w-[220px]">Landmark</th>
                  <th className="py-3 px-3 w-28">Date / Year</th>
                  <th className="py-3 px-3 min-w-[150px]">Architecture Style</th>
                  <th className="py-3 px-3 min-w-[170px]">Architect</th>
                  <th className="py-3 px-3 w-24">Photo</th>
                  <th className="py-3 px-3 min-w-[130px]">Notable Residents</th>
                  <th className="py-3 px-4 text-right w-36">Contribute / Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sortedLandmarks.map((landmark) => {
                  const hasDate = Boolean(landmark.year || landmark.startDate);
                  const hasStyle = landmark.architectureStyles.length > 0;
                  const hasArchitect = landmark.architects.length > 0;
                  const hasImage = Boolean(landmark.imageUrl);
                  const hasResidents = Boolean(landmark.notableResidents && landmark.notableResidents.length > 0);

                  const osmEditUrl = `https://www.openstreetmap.org/edit?${landmark.osmType}=${landmark.osmId}`;
                  const wikidataUrl = landmark.wikidata ? `https://www.wikidata.org/wiki/${landmark.wikidata}` : null;

                  return (
                    <tr key={landmark.id} className="hover:bg-stone-50/70 transition">
                      {/* Landmark Ref # */}
                      <td className="py-3 px-4 font-bold text-amber-900">
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-xs">
                          #{landmark.ref || landmark.refNumber}
                        </span>
                      </td>

                      {/* Name & Address */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {landmark.thumbnail ? (
                            <img
                              src={landmark.thumbnail}
                              alt={landmark.name}
                              className="w-9 h-9 rounded object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-bold shrink-0">
                              #{landmark.ref}
                            </div>
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() => onSelectLandmarkOnMap(landmark)}
                              className="font-serif font-bold text-stone-900 hover:text-amber-800 hover:underline text-left block truncate max-w-xs"
                              title="View on Map"
                            >
                              {landmark.name}
                            </button>
                            {landmark.address && (
                              <p className="text-[11px] text-stone-400 truncate mt-0.5">
                                {landmark.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date / Year */}
                      <td className="py-3 px-3">
                        {hasDate ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {landmark.year || landmark.startDate}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            Missing
                          </span>
                        )}
                      </td>

                      {/* Architecture Style */}
                      <td className="py-3 px-3">
                        {hasStyle ? (
                          <div className="flex flex-wrap gap-1">
                            {landmark.architectureStyles.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium"
                              >
                                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                                {getStyleInfo(s).name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            Missing
                          </span>
                        )}
                      </td>

                      {/* Architect */}
                      <td className="py-3 px-3">
                        {hasArchitect ? (
                          <div className="flex flex-wrap gap-1">
                            {landmark.architects.map((a) => (
                              <span
                                key={a}
                                className="inline-flex items-center gap-1 text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-medium"
                              >
                                <CheckCircle2 className="w-3 h-3 text-purple-600" />
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            Missing
                          </span>
                        )}
                      </td>

                      {/* Photo */}
                      <td className="py-3 px-3">
                        {hasImage ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Photo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-stone-400 text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-stone-300" />
                            None
                          </span>
                        )}
                      </td>

                      {/* Notable Residents */}
                      <td className="py-3 px-3">
                        {hasResidents ? (
                          <div className="flex flex-wrap gap-1">
                            {(landmark.notableResidents || []).map((r) => (
                              <span
                                key={r}
                                className="inline-flex items-center gap-1 text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium"
                              >
                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">Unlisted</span>
                        )}
                      </td>

                      {/* Action Links */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={osmEditUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-medium text-[11px] transition"
                            title="Edit feature in OpenStreetMap iD editor"
                          >
                            <span>Edit OSM</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          {wikidataUrl && (
                            <a
                              href={wikidataUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded font-medium text-[11px] transition"
                              title="Edit item in Wikidata"
                            >
                              <span>Wikidata</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {sortedLandmarks.length === 0 && (
              <div className="py-12 text-center text-stone-500">
                <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="font-medium">No landmarks found matching the selected filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
