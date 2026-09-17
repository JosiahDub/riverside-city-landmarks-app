import rawCreators from './creators.json';
import { ArchitectInfo } from '../types';

export interface CreatorRecord {
  shortcode?: string;
  displayName: string;
  wikidataName?: string;
  firm?: string;
  years?: string;
  role?: string;
  bio?: string;
}

// Extra metadata preserving portraits, wikidata QIDs, and wikipedia links
export const CREATOR_METADATA_EXTRAS: Record<string, Partial<ArchitectInfo>> = {
  'Peter J. Weber': {
    wikidataId: 'Q16017899',
    wikipediaTitle: 'Peter J. Weber',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Peter_J._Weber',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Peter_J_Weber.jpg/330px-Peter_J_Weber.jpg'
  },
  'G. Stanley Wilson': {
    wikidataId: 'Q15443216',
    wikipediaTitle: 'G. Stanley Wilson',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/G._Stanley_Wilson',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/G._Stanley_Wilson.jpg/330px-G._Stanley_Wilson.jpg'
  },
  'Arthur B. Benton': {
    wikidataId: 'Q4797962',
    wikipediaTitle: 'Arthur Burnett Benton',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Arthur_Burnett_Benton',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Arthur_Burnett_Benton.png/330px-Arthur_Burnett_Benton.png'
  },
  'Arthur Burnett Benton': {
    wikidataId: 'Q4797962',
    wikipediaTitle: 'Arthur Burnett Benton',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Arthur_Burnett_Benton',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Arthur_Burnett_Benton.png/330px-Arthur_Burnett_Benton.png'
  },
  'Julia Morgan': {
    wikidataId: 'Q259368',
    wikipediaTitle: 'Julia Morgan',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Julia_Morgan',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Julia_Morgan.jpg'
  },
  'Franklin Pierce Burnham': {
    wikidataId: 'Q5491744',
    wikipediaTitle: 'Franklin Pierce Burnham',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Franklin_Pierce_Burnham'
  },
  'Henry L. A. Jekel': {
    wikidataId: 'Q106517006',
    wikipediaTitle: 'Henry L. A. Jekel',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Henry_L._A._Jekel'
  },
  'James Knox Taylor': {
    wikidataId: 'Q6137452',
    wikipediaTitle: 'James Knox Taylor',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/James_Knox_Taylor',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/James_Knox_Taylor.jpg/330px-James_Knox_Taylor.jpg'
  },
  'Herman O. Ruhnau': {
    wikidataId: 'Q112228189',
    wikipediaTitle: 'Herman O. Ruhnau',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Herman_O._Ruhnau',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Herman_Ruhnau%2C_Architect.jpeg/330px-Herman_Ruhnau%2C_Architect.jpeg'
  },
  'Lois Davidson Gottlieb': {
    wikidataId: 'Q18686369',
    wikipediaTitle: 'Lois Gottlieb',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Lois_Gottlieb'
  },
  'Lois Gottlieb': {
    wikidataId: 'Q18686369',
    wikipediaTitle: 'Lois Gottlieb',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Lois_Gottlieb'
  },
  'Clifford A. Balch': {
    wikidataId: 'Q124968137'
  },
  'Clifford Balch': {
    wikidataId: 'Q124968137'
  },
  'Clinton Marr': {
    wikidataId: 'Q141239795'
  },
  'John A. Walls': {
    wikidataId: 'Q124968149'
  },
  'Myron Hunt': {
    wikidataId: 'Q6948452',
    wikipediaTitle: 'Myron Hunt',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Myron_Hunt',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Myron_Hunt.jpg/330px-Myron_Hunt.jpg'
  },
  'A. W. Boggs': {
    wikidataId: 'Q141193839'
  },
  'Augustus Washington Boggs': {
    wikidataId: 'Q141193839'
  },
  'Seehorn & Preston': {
    wikidataId: 'Q141193069'
  },
  'A. C. Willard': {
    wikidataId: 'Q140778690'
  },
  'Adam Clark Willard': {
    wikidataId: 'Q140778690'
  },
  'Adam C. Willard': {
    wikidataId: 'Q140778690'
  },
  'James Madison Wood': {
    wikidataId: 'Q140779110'
  },
  'Welmer P. Lamar': {
    wikidataId: 'Q141347258'
  },
  'Welmer Parsons Lamar': {
    wikidataId: 'Q141347258'
  },
  'John Crockett Goldsworthy': {
    wikidataId: 'Q141379792',
    bio: 'John Crockett Goldsworthy was a civil engineer and surveyor who prepared the original 1870 town plat for the Southern California Colony Association, establishing the historic Mile Square grid that forms the core of downtown Riverside.'
  },
  'Matthew Gage': {
    wikidataId: 'Q141448955'
  },
  'Franz Philip Hosp': {
    wikidataId: 'Q112961231'
  },
  'Quartermaster Corps': {
    wikidataId: 'Q7269323',
    wikipediaTitle: 'Quartermaster Corps (United States Army)',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Quartermaster_Corps_(United_States_Army)'
  },
  'U.S. Army Quartermaster Corps': {
    wikidataId: 'Q7269323',
    wikipediaTitle: 'Quartermaster Corps (United States Army)',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Quartermaster_Corps_(United_States_Army)'
  },
  'Robert V. Leeson': {
    wikidataId: 'Q141006869'
  },
  'John C. Austin': {
    wikidataId: 'Q6224265'
  },
  'Oliver Perry Dennis': {
    wikidataId: 'Q99192959'
  },
  'Philip Esbensen': {
    wikidataId: 'Q141401151'
  },
  'H. L. Evans': {
    wikidataId: 'Q141194783'
  },
  'Knowlton Fernald Jr.': {
    wikidataId: 'Q141401257'
  },
  'Charles O. Matcham': {
    wikidataId: 'Q124959569'
  },
  'Charles Ormrod Matcham Sr': {
    wikidataId: 'Q124959569'
  },
  'Charles Ormrod Matcham Sr.': {
    wikidataId: 'Q124959569'
  },
  'Louis du Puget Millar': {
    wikidataId: 'Q141401465'
  },
  'Moise, Harbach and Hewlett': {
    wikidataId: 'Q141260363'
  },
  'John C. Pelton Jr.': {
    wikidataId: 'Q55508624'
  },
  'Seeley L. Pillar': {
    wikidataId: 'Q140737813'
  },
  'Walter C. See': {
    wikidataId: 'Q141401478'
  },
  'James C. Stanley': {
    wikidataId: 'Q141401532'
  },
  'E. Kurt Steinmann': {
    wikidataId: 'Q141401676'
  },
  'Eugen Kurt Steinmann': {
    wikidataId: 'Q141401676'
  },
  'Garrett Beekman Van Pelt Jr.': {
    wikidataId: 'Q57272798'
  }
};

function normalizeKey(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\band\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const KNOWN_ALIASES: Record<string, string> = {
  'adam c willard': 'acw',
  'adam clark willard': 'acw',
  'a c willard': 'acw',
  'franklin pierce burnham': 'bb',
  'burnham and bliesner': 'bb',
  'burnham & bliesner': 'bb',
  'garrett van pelt': 'gbvp',
  'herbert lyman gilman': 'hlg',
  'james m wood': 'jmw',
  'lois gottlieb': 'ldg',
  'martin williamson': 'mnw',
  'quartermaster corps': 'usa',
  'us army quartermaster corps': 'usa',
  'u s army quartermaster corps': 'usa',
  'welmer parsons lamar': 'wpl',
  'wilcox and rose': 'wr',
  'wilcox & rose': 'wr',
  'william henry mohr': 'whm'
};

const creatorsLookup: Record<string, CreatorRecord> = {};
(rawCreators as CreatorRecord[]).forEach((c) => {
  if (c.shortcode) creatorsLookup[c.shortcode.toLowerCase()] = c;
  if (c.wikidataName) creatorsLookup[normalizeKey(c.wikidataName)] = c;
  if (c.displayName) creatorsLookup[normalizeKey(c.displayName)] = c;
  if (c.firm) creatorsLookup[normalizeKey(c.firm)] = c;
});

export function getArchitectInfo(queryName: string): ArchitectInfo {
  const trimmed = (queryName || '').trim();
  if (!trimmed) {
    return { name: '', displayName: '' };
  }

  const norm = normalizeKey(trimmed);
  let creator = creatorsLookup[trimmed.toLowerCase()] || creatorsLookup[norm];
  if (!creator) {
    const aliasCode = KNOWN_ALIASES[norm];
    if (aliasCode && creatorsLookup[aliasCode]) {
      creator = creatorsLookup[aliasCode];
    }
  }

  if (creator) {
    const extra =
      (creator.displayName && CREATOR_METADATA_EXTRAS[creator.displayName]) ||
      (creator.wikidataName && CREATOR_METADATA_EXTRAS[creator.wikidataName]) ||
      (creator.firm && CREATOR_METADATA_EXTRAS[creator.firm]) ||
      CREATOR_METADATA_EXTRAS[trimmed];

    const displayName = creator.displayName || creator.firm || creator.wikidataName || trimmed;
    const wikidataName = creator.wikidataName || undefined;
    const firm = creator.firm || undefined;
    const years = creator.years || undefined;
    const bio = creator.bio || extra?.bio || `Architect credited with historic structures in the City of Riverside.`;

    return {
      name: displayName,
      displayName,
      wikidataName,
      firm,
      years,
      role: creator.role || extra?.role || 'Architect',
      bio,
      shortcode: creator.shortcode,
      wikidataId: extra?.wikidataId,
      wikipediaTitle: extra?.wikipediaTitle,
      wikipediaUrl:
        extra?.wikipediaUrl ||
        (wikidataName ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wikidataName)}` : undefined),
      portraitUrl: extra?.portraitUrl
    };
  }

  // Fallback for creators not in spreadsheet
  const extra = CREATOR_METADATA_EXTRAS[trimmed];
  if (extra) {
    return {
      name: trimmed,
      displayName: trimmed,
      ...extra
    };
  }

  return {
    name: trimmed,
    displayName: trimmed,
    wikipediaUrl: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(trimmed)}`,
    bio: `Architect credited with historic structures in the City of Riverside.`
  };
}

// Full directory exported for components that iterate over all creators
export const ARCHITECTS_DIRECTORY: Record<string, ArchitectInfo> = {};
(rawCreators as CreatorRecord[]).forEach((c) => {
  const key = c.displayName || c.firm || c.wikidataName;
  if (key) {
    ARCHITECTS_DIRECTORY[key] = getArchitectInfo(key);
  }
});
