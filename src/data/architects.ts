import { ArchitectInfo } from '../types';

export const ARCHITECTS_DIRECTORY: Record<string, ArchitectInfo> = {
  'Peter J. Weber': {
    name: 'Peter J. Weber',
    wikidataId: 'Q16017899',
    wikipediaTitle: 'Peter J. Weber',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Peter_J._Weber',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Peter_J_Weber.jpg/330px-Peter_J_Weber.jpg',
    bio: 'Peter Joseph Weber (1893–1983) was an American architect who worked in California from 1906 to 1958. Trained in the Beaux-Arts style and technique, he is known primarily for his work in Inland Southern California for the firm of G. Stanley Wilson, Architect as its lead designer. Nine of his designs for Wilson are listed on the National Register of Historic Places.'
  },
  'G. Stanley Wilson': {
    name: 'G. Stanley Wilson',
    wikidataId: 'Q15443216',
    wikipediaTitle: 'G. Stanley Wilson',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/G._Stanley_Wilson',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/G._Stanley_Wilson.jpg/330px-G._Stanley_Wilson.jpg',
    bio: 'George Stanley Wilson (1879–1958) was an English-born American architect based in Riverside, California. He began his career as a carpenter and quickly ascended as builder, architect, owner of his own firm, and civic icon. His firm produced over 1,000 projects between 1909 and 1956—primarily in Riverside, but spanning an area from the High Sierras to the Mexico Border, the Pacific Ocean to the Colorado River. 11 of his firm’s projects are listed in the National Register of Historic Places.'
  },
  'Arthur Benton': {
    name: 'Arthur Benton',
    wikidataId: 'Q4797962',
    wikipediaTitle: 'Arthur Burnett Benton',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Arthur_Burnett_Benton',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Arthur_Burnett_Benton.png/330px-Arthur_Burnett_Benton.png',
    bio: 'American architect.'
  },
  'Julia Morgan': {
    name: 'Julia Morgan',
    wikidataId: 'Q259368',
    wikipediaTitle: 'Julia Morgan',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Julia_Morgan',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Julia_Morgan.jpg',
    bio: 'American architect.'
  },
  'Franklin Pierce Burnham': {
    name: 'Franklin Pierce Burnham',
    wikidataId: 'Q5491744',
    wikipediaTitle: 'Franklin Pierce Burnham',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Franklin_Pierce_Burnham',
    bio: 'American architect.'
  },
  'Henry L. A. Jekel': {
    name: 'Henry L. A. Jekel',
    wikidataId: 'Q106517006',
    wikipediaTitle: 'Henry L. A. Jekel',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Henry_L._A._Jekel',
    bio: 'American architect.'
  },
  'James Knox Taylor': {
    name: 'James Knox Taylor',
    wikidataId: 'Q6137452',
    wikipediaTitle: 'James Knox Taylor',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/James_Knox_Taylor',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/James_Knox_Taylor.jpg/330px-James_Knox_Taylor.jpg',
    bio: 'American architect.'
  },
  'Herman O. Ruhnau': {
    name: 'Herman O. Ruhnau',
    wikidataId: 'Q112228189',
    wikipediaTitle: 'Herman O. Ruhnau',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Herman_O._Ruhnau',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Herman_Ruhnau%2C_Architect.jpeg/330px-Herman_Ruhnau%2C_Architect.jpeg',
    bio: 'American architect.'
  },
  'Lois Gottlieb': {
    name: 'Lois Gottlieb',
    wikidataId: 'Q18686369',
    wikipediaTitle: 'Lois Gottlieb',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Lois_Gottlieb',
    bio: 'American architect.'
  },
  'Clifford Balch': {
    name: 'Clifford Balch',
    wikidataId: 'Q108888258',
    bio: 'American architect.'
  },
  'Clinton Marr': {
    name: 'Clinton Marr',
    bio: 'American architect.'
  },
  'Robert H. Spurgeon, Jr.': {
    name: 'Robert H. Spurgeon, Jr.',
    bio: 'American architect.'
  },
  'Lester S. Moore': {
    name: 'Lester S. Moore',
    bio: 'American architect.'
  },
  'John A. Walls': {
    name: 'John A. Walls',
    wikidataId: 'Q124968149',
    bio: 'American architect.'
  },
  'Myron Hunt': {
    name: 'Myron Hunt',
    wikidataId: 'Q6948452',
    wikipediaTitle: 'Myron Hunt',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Myron_Hunt',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Myron_Hunt.jpg/330px-Myron_Hunt.jpg',
    bio: 'American architect.'
  },
  'A. W. Boggs': {
    name: 'A. W. Boggs',
    wikidataId: 'Q141193839',
    bio: 'American architect.'
  },
  'Seehorn & Preston': {
    name: 'Seehorn & Preston',
    wikidataId: 'Q141193069',
    bio: 'American architect.'
  }
};

export function getArchitectInfo(name: string): ArchitectInfo {
  const trimmed = name.trim();
  if (ARCHITECTS_DIRECTORY[trimmed]) {
    return ARCHITECTS_DIRECTORY[trimmed];
  }
  return {
    name: trimmed,
    wikipediaUrl: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(trimmed)}`,
    bio: `Architect credited with historic structures in the City of Riverside.`
  };
}
