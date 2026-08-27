import { ArchitectInfo } from '../types';

export const ARCHITECTS_DIRECTORY: Record<string, ArchitectInfo> = {
  'Peter J. Weber': {
    name: 'Peter J. Weber',
    wikidataId: 'Q16017899',
    wikipediaTitle: 'Peter J. Weber',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Peter_J._Weber',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Peter_J_Weber.jpg/330px-Peter_J_Weber.jpg',
    bio: 'Peter Joseph Weber (1893–1983) was an innovative American architect and craftsman based in Riverside. He served as the principal designer for G. Stanley Wilson, shaping iconic elements of the Mission Inn and designing the legendary Peter J. Weber House, famed for its intricate hand-carved woodwork, repurposed citrus crate materials, and unique solar water system.'
  },
  'G. Stanley Wilson': {
    name: 'G. Stanley Wilson',
    wikidataId: 'Q15443216',
    wikipediaTitle: 'G. Stanley Wilson',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/G._Stanley_Wilson',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/G._Stanley_Wilson.jpg/330px-G._Stanley_Wilson.jpg',
    bio: 'George Stanley Wilson (1879–1958) was Riverside’s most prolific architect. Raised in Riverside, he worked under Frank Miller on the Mission Inn, designing the International Rotunda and Authors Row. He also designed the Aurea Vista Hotel, Santa Cruz Inn, schools, libraries, and major civic landmarks throughout the Inland Empire.'
  },
  'Arthur Benton': {
    name: 'Arthur Benton',
    wikidataId: 'Q4797962',
    wikipediaTitle: 'Arthur Burnett Benton',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Arthur_Burnett_Benton',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Arthur_Burnett_Benton.png/330px-Arthur_Burnett_Benton.png',
    bio: 'Arthur Burnett Benton (1858–1920) was a founding champion of the Mission Revival and Spanish Colonial Revival styles in California. He was Frank Miller’s chief architect for the initial Mission Wing of the Mission Inn and designed the grand Riverside Municipal Auditorium with its Spanish churrigueresque detailing.'
  },
  'Julia Morgan': {
    name: 'Julia Morgan',
    wikidataId: 'Q259368',
    wikipediaTitle: 'Julia Morgan',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Julia_Morgan',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Julia_Morgan.jpg',
    bio: 'Julia Morgan (1872–1957) was a legendary American architect and the first woman admitted to the Beaux-Arts program in Paris. Famous for William Randolph Hearst’s San Simeon estate, Morgan designed the historic Riverside YWCA building (1929), now home to the Riverside Art Museum, blending Mediterranean Revival with classical restraint.'
  },
  'Franklin Pierce Burnham': {
    name: 'Franklin Pierce Burnham',
    wikidataId: 'Q5491744',
    wikipediaTitle: 'Franklin Pierce Burnham',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Franklin_Pierce_Burnham',
    bio: 'Franklin Pierce Burnham (1853–1909) was an acclaimed architect from Chicago and Southern California who designed the monumental Beaux-Arts Riverside Historic Courthouse (1903), inspired by the Petit Palais in Paris with its majestic colonnade and classical pediment.'
  },
  'Henry L. A. Jekel': {
    name: 'Henry L. A. Jekel',
    wikidataId: 'Q106517006',
    wikipediaTitle: 'Henry L. A. Jekel',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Henry_L._A._Jekel',
    bio: 'Henry L. A. Jekel (1876–1960) was a prolific master architect responsible for over 40 landmark homes in Riverside, notably along Victoria Avenue and around Mount Rubidoux, specializing in picturesque Spanish Colonial Revival, Tudor Revival, and French Normandy chateaux.'
  },
  'James Knox Taylor': {
    name: 'James Knox Taylor',
    wikidataId: 'Q6137452',
    wikipediaTitle: 'James Knox Taylor',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/James_Knox_Taylor',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/James_Knox_Taylor.jpg/330px-James_Knox_Taylor.jpg',
    bio: 'James Knox Taylor (1857–1929) served as Supervising Architect of the U.S. Treasury Department from 1897 to 1912. He designed the Spanish Renaissance Revival 1912 U.S. Post Office in Riverside, which today houses the Museum of Riverside.'
  },
  'Herman O. Ruhnau': {
    name: 'Herman O. Ruhnau',
    wikidataId: 'Q112228189',
    wikipediaTitle: 'Herman O. Ruhnau',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Herman_O._Ruhnau',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Herman_Ruhnau%2C_Architect.jpeg/330px-Herman_Ruhnau%2C_Architect.jpeg',
    bio: 'Herman O. Ruhnau (1912–2006) was a prominent mid-century and civic architect who founded Ruhnau Ruhnau Clarke. He designed Riverside’s striking modern City Hall building (1975), along with hundreds of educational and civic institutions across the region.'
  },
  'Lois Gottlieb': {
    name: 'Lois Gottlieb',
    wikidataId: 'Q18686369',
    wikipediaTitle: 'Lois Gottlieb',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Lois_Gottlieb',
    bio: 'Lois Davidson Gottlieb (1926–2018) was an American residential architect who apprenticed under Frank Lloyd Wright at Taliesin. She designed expressive mid-century modern residences in Riverside emphasizing organic integration with natural topography.'
  },
  'Clifford Balch': {
    name: 'Clifford Balch',
    wikidataId: 'Q108888258',
    bio: 'Clifford A. Balch (1880–1963) was a prominent theater and commercial architect based in Southern California, renowned for designing movie palaces and ornate entertainment architecture in the 1920s and 30s.'
  },
  'Clinton Marr': {
    name: 'Clinton Marr',
    bio: 'Clinton Marr (1920–2005) was an influential Riverside architect known for mid-century modern residences, medical facilities, and commercial buildings emphasizing crisp structural geometry and regional climate responsiveness.'
  },
  'Robert H. Spurgeon, Jr.': {
    name: 'Robert H. Spurgeon, Jr.',
    bio: 'Robert H. Spurgeon, Jr. was an esteemed regional architect recognized for exquisite Spanish Colonial Revival and Mediterranean residences characterized by handcrafted wrought iron, courtyards, and deep arches.'
  },
  'Lester S. Moore': {
    name: 'Lester S. Moore',
    bio: 'Lester S. Moore was an early 20th-century Southern California architect who designed civic and commercial landmarks across the Inland Empire during Riverside’s citrus boom era.'
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
