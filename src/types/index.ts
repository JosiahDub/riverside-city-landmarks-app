export interface Landmark {
  id: string;
  osmType: 'node' | 'way' | 'relation';
  osmId: number;
  ref: string;
  refNumber: number;
  name: string;
  lat: number;
  lon: number;
  description: string;
  startDate: string | null;
  year: number | null;
  architects: string[];
  architectureStyles: string[];
  address: string | null;
  wikidata: string | null;
  wikidataUrl: string | null;
  wikipedia: string | null;
  wikipediaUrl: string | null;
  commonsImage: string | null;
  imageUrl: string | null;
  thumbnail: string | null;
  heritageWebsite: string;
  osmUrl: string;
  natural: string | null;
  building: string | null;
  historic: string | null;
  amenity: string | null;
  notableResidents?: string[];
  designationDate?: string | null;
  designationYear?: number | null;
  isNationalHistoricLandmark?: boolean;
  nationalHistoricLandmarkDate?: string | null;
  nationalHistoricLandmarkYear?: number | null;
  plaques?: Plaque[];
  hasPlaque?: boolean;
  allTags: Record<string, string>;
  distanceMiles?: number;
}

export interface Plaque {
  id: string;
  osmId: number;
  osmType: 'node' | 'way' | 'relation';
  name?: string;
  lat: number;
  lon: number;
  subjectWikidata: string;
  commonsImage?: string | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
  direction?: string | null;
  material?: string | null;
  osmUrl: string;
}

export interface FilterState {
  searchQuery: string;
  selectedArchitects: string[];
  selectedStyles: string[];
  yearMin: number | null;
  yearMax: number | null;
  hasImageOnly: boolean;
  category: 'all' | 'buildings' | 'nature_trees' | 'civic_ecclesiastical';
}

export interface UserLocation {
  lat: number;
  lon: number;
  accuracy?: number;
}

export interface ArchitectInfo {
  name: string;
  wikidataId?: string;
  wikipediaTitle?: string;
  wikipediaUrl?: string;
  portraitUrl?: string;
  bio?: string;
  landmarkCount?: number;
}
