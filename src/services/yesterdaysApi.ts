/**
 * Service for fetching georeferenced historical photos from Yesterdays (https://yesterdays.today)
 */

export interface YesterdaysPhoto {
  id: number;
  imageId: number;
  title: string;
  thumbnail: string;
  direction: number | null; // compass bearing 0-360 or null
  confidence: 'low' | 'medium' | 'high';
  georeferencedBy?: string;
  georeferencedAt?: string;
  lat: number;
  lon: number;
  detailUrl: string;
  yesterdaysUrl: string;
  originalDate?: string;
  dateDisplay?: string;
  collectionName?: string;
  sourceName?: string;
  fromAbove?: boolean;
}

export interface YesterdaysAerialPolygon {
  id: number;
  imageId: number;
  title: string;
  thumbnail: string;
  confidence: string;
  coordinates: [number, number][][]; // GeoJSON polygon coordinates [[lon, lat], ...]
  yesterdaysUrl: string;
  detailUrl: string;
}

export interface LandmarkPhotosResult {
  subject: string;
  wikidataId: string;
  photos: YesterdaysPhoto[];
  aerials: YesterdaysAerialPolygon[];
  totalCount: number;
}

// In-memory cache to prevent redundant network requests
const photoCache = new Map<string, LandmarkPhotosResult>();

/**
 * Normalizes any subject string or slug (e.g. "Q1920529-mission-inn", "Q1920529", "1920529")
 * into a clean Wikidata Q-ID (e.g. "Q1920529").
 */
export function extractWikidataId(subject: string): string | null {
  if (!subject) return null;
  const match = subject.trim().match(/Q\d+/i);
  if (match) {
    return match[0].toUpperCase();
  }
  // If pure numeric ID or other string, return as is
  return subject.trim();
}

/**
 * Returns a human-friendly compass heading string, e.g. "68° ENE"
 */
export function getCompassDirection(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined || isNaN(degrees)) return '';
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return `${Math.round(normalized)}° ${cardinals[index]}`;
}

/**
 * Fetches georeferenced historical photos and aerial polygons for a landmark subject.
 * Accepts any subject format like "Q1920529-mission-inn" or "Q1920529".
 */
export async function fetchLandmarkPhotos(subjectOrWikidata: string): Promise<LandmarkPhotosResult> {
  const qId = extractWikidataId(subjectOrWikidata);
  if (!qId) {
    return { subject: subjectOrWikidata, wikidataId: '', photos: [], aerials: [], totalCount: 0 };
  }

  // Check cache first
  if (photoCache.has(qId)) {
    return photoCache.get(qId)!;
  }

  try {
    // Parallel fetch:
    // 1) Point georeferences (exact camera positions & directions)
    // 2) Images list (dates, collections, archive sources)
    // 3) From-above aerial polygon footprints
    const [geoRes, imgRes, aerialRes] = await Promise.all([
      fetch(`https://yesterdays.today/api/v2/georeferences/?subject=${encodeURIComponent(qId)}&page_size=100`),
      fetch(`https://yesterdays.today/api/v2/images/?subject=${encodeURIComponent(qId)}&georeferenced=true&page_size=100`),
      fetch(`https://yesterdays.today/api/v2/from-above-georeferences/?subject=${encodeURIComponent(qId)}&page_size=50`).catch(() => null),
    ]);

    const geoData = geoRes.ok ? await geoRes.json() : { features: [] };
    const imgData = imgRes.ok ? await imgRes.json() : { results: [] };
    const aerialData = aerialRes && aerialRes.ok ? await aerialRes.json() : { features: [] };

    // Index image metadata by image_id
    const imageMetaMap = new Map<number, {
      dateDisplay?: string;
      originalDate?: string;
      collectionName?: string;
      sourceName?: string;
      fromAbove?: boolean;
    }>();

    (imgData.results || []).forEach((img: any) => {
      imageMetaMap.set(img.id, {
        dateDisplay: img.date_display || undefined,
        originalDate: img.original_date || undefined,
        collectionName: img.collection?.name || undefined,
        sourceName: img.collection?.source_name || undefined,
        fromAbove: img.from_above || false,
      });
    });

    // Map point georeference features
    const photos: YesterdaysPhoto[] = (geoData.features || []).map((feat: any) => {
      const p = feat.properties || {};
      const coords = feat.geometry?.coordinates || [0, 0];
      const imageId = p.image_id;
      const meta = imageMetaMap.get(imageId) || {};

      return {
        id: feat.id,
        imageId,
        title: p.image_title || 'Historical Photograph',
        thumbnail: p.image_thumbnail || '',
        direction: typeof p.direction === 'number' ? p.direction : null,
        confidence: p.confidence || 'medium',
        georeferencedBy: p.georeferenced_by || undefined,
        georeferencedAt: p.georeferenced_at || undefined,
        lon: coords[0],
        lat: coords[1],
        detailUrl: `https://yesterdays.today/api/v2/images/${imageId}/`,
        yesterdaysUrl: `https://yesterdays.today/images/${imageId}/`,
        originalDate: meta.originalDate,
        dateDisplay: meta.dateDisplay,
        collectionName: meta.collectionName,
        sourceName: meta.sourceName,
        fromAbove: meta.fromAbove,
      };
    });

    // Map aerial polygon georeferences
    const aerials: YesterdaysAerialPolygon[] = (aerialData.features || []).map((feat: any) => {
      const p = feat.properties || {};
      const imageId = p.image_id;
      return {
        id: feat.id,
        imageId,
        title: p.image_title || 'Aerial Historical Photograph',
        thumbnail: p.image_thumbnail || '',
        confidence: p.confidence || 'medium',
        coordinates: feat.geometry?.coordinates || [],
        detailUrl: `https://yesterdays.today/api/v2/images/${imageId}/`,
        yesterdaysUrl: `https://yesterdays.today/images/${imageId}/`,
      };
    });

    const result: LandmarkPhotosResult = {
      subject: subjectOrWikidata,
      wikidataId: qId,
      photos,
      aerials,
      totalCount: photos.length + aerials.length,
    };

    photoCache.set(qId, result);
    return result;
  } catch (error) {
    console.error(`[Yesterdays API] Failed to fetch photos for subject ${subjectOrWikidata}:`, error);
    return {
      subject: subjectOrWikidata,
      wikidataId: qId,
      photos: [],
      aerials: [],
      totalCount: 0,
    };
  }
}
