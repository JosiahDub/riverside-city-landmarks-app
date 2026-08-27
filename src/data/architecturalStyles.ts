export interface ArchitectureStyleInfo {
  key: string;
  name: string;
  wikipediaUrl: string;
  wikipediaTitle: string;
  wikidataId?: string;
  description: string;
  era: string;
  characteristics: string[];
}

export const ARCHITECTURE_STYLES: Record<string, ArchitectureStyleInfo> = {
  queen_anne: {
    key: 'queen_anne',
    name: 'Queen Anne',
    wikipediaTitle: 'Queen Anne style architecture in the United States',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Queen_Anne_style_architecture_in_the_United_States',
    wikidataId: 'Q7270243',
    description: 'Distinguished by asymmetrical facades, wrap-around porches, corner turrets or towers, steeply pitched irregular rooflines, and ornate decorative woodwork.',
    era: '1880–1910',
    characteristics: ['Wrap-around porches', 'Corner towers & turrets', 'Asymmetrical massing', 'Textured shingles & spindlework']
  },
  mission_revival: {
    key: 'mission_revival',
    name: 'Mission Revival',
    wikipediaTitle: 'Mission Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Mission_Revival_architecture',
    wikidataId: 'Q1276077',
    description: 'Inspired by 18th and early 19th-century Spanish Franciscan missions in California, showcasing scalloped curvilinear parapets, low-pitched red tile roofs, arcades, and smooth stucco.',
    era: '1890–1920',
    characteristics: ['Curvilinear mission parapets', 'Red clay barrel tile roofs', 'Arched cloister-like walkways', 'Smooth stucco walls']
  },
  spanish_revival: {
    key: 'spanish_revival',
    name: 'Spanish Colonial Revival',
    wikipediaTitle: 'Spanish Colonial Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Spanish_Colonial_Revival_architecture',
    wikidataId: 'Q1753898',
    description: 'Celebrated across California, incorporating Mediterranean and Spanish Baroque elements with low-pitched red tile roofs, courtyards, decorative wrought iron, and colorful ceramic tiles.',
    era: '1915–1940',
    characteristics: ['Courtyards & fountain plazas', 'Wrought-iron grilles & balconies', 'Carved wooden doors & vigas', 'Ceramic decorative tiles']
  },
  craftsman: {
    key: 'craftsman',
    name: 'American Craftsman',
    wikipediaTitle: 'American Craftsman',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/American_Craftsman',
    wikidataId: 'Q463806',
    description: 'Stemming from the Arts and Crafts movement, emphasizing organic materials, honesty of construction, low-pitched gable roofs, wide eaves with exposed rafters, and river-rock masonry.',
    era: '1905–1930',
    characteristics: ['Wide overhanging eaves', 'Exposed rafter tails & brackets', 'River-rock stone foundations', 'Handcrafted woodwork']
  },
  beaux_arts: {
    key: 'beaux_arts',
    name: 'Beaux-Arts',
    wikipediaTitle: 'Beaux-Arts architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Beaux-Arts_architecture',
    wikidataId: 'Q200789',
    description: 'Grand classical design characterized by formal symmetry, monumental columns, rusticated stonework, elaborate statuary, cartouches, and palatial proportions.',
    era: '1885–1925',
    characteristics: ['Monumental classical columns', 'Grand symmetrical facades', 'Richly decorated friezes & pediments', 'Rusticated masonry bases']
  },
  italian_renaissance: {
    key: 'italian_renaissance',
    name: 'Italian Renaissance Revival',
    wikipediaTitle: 'Renaissance Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Renaissance_Revival_architecture',
    wikidataId: 'Q1058444',
    description: 'Derived from 15th and 16th-century Italian palazzi, presenting formal symmetrical facades, low-pitched hip roofs with wide bracketed eaves, and arched arcades.',
    era: '1890–1935',
    characteristics: ['Bracketed overhanging eaves', 'Round-arched first-floor windows', 'Classical pilasters & balustrades', 'Formal rectangular massing']
  },
  colonial_revival: {
    key: 'colonial_revival',
    name: 'Colonial Revival',
    wikipediaTitle: 'Colonial Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Colonial_Revival_architecture',
    wikidataId: 'Q1110996',
    description: 'Inspired by early American colonial architecture, emphasizing symmetrical facades, centered accent front doors with pediments and fanlights, and multi-pane double-hung windows.',
    era: '1880–1955',
    characteristics: ['Symmetrical window placement', 'Portico or pedimented doorway', 'Shutters & fanlights', 'Gable or gambrel roof']
  },
  tudor_revival: {
    key: 'tudor_revival',
    name: 'Tudor Revival',
    wikipediaTitle: 'Tudor Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Tudor_Revival_architecture',
    wikidataId: 'Q953258',
    description: 'Evoking medieval English manor cottages with steeply pitched front-facing gables, decorative half-timbering, tall narrow multi-pane casement windows, and massive masonry chimneys.',
    era: '1890–1940',
    characteristics: ['Decorative half-timbering', 'Steeply pitched gables', 'Prominent brick/stone chimneys', 'Tall narrow casement windows']
  },
  victorian: {
    key: 'victorian',
    name: 'Victorian',
    wikipediaTitle: 'Victorian architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Victorian_architecture',
    wikidataId: 'Q565970',
    description: 'A broad category of late 19th-century architectural styles marked by decorative complexity, ornate fretwork, steep roofs, decorative brackets, and historicist revivals.',
    era: '1837–1901',
    characteristics: ['Intricate scrollwork & fretwork', 'Steep gables & bay windows', 'Tall proportions', 'Patterned shingle siding']
  },
  midcentury_modern: {
    key: 'midcentury_modern',
    name: 'Mid-Century Modern',
    wikipediaTitle: 'Mid-century modern',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Mid-century_modern',
    wikidataId: 'Q3312702',
    description: 'Post-WWII modernist design characterized by flat or low-pitch roofs, expansive walls of glass, open structural plans, and an emphasis on bringing the outdoors inside.',
    era: '1945–1969',
    characteristics: ['Expansive glass walls', 'Flat or butterfly roof planes', 'Integrated indoor-outdoor living', 'Geometric minimalist forms']
  },
  ranch: {
    key: 'ranch',
    name: 'Ranch',
    wikipediaTitle: 'Ranch-style house',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Ranch-style_house',
    wikidataId: 'Q1642273',
    description: 'An iconic American domestic architectural style with a sprawling single-story footprint, low-pitched gable roofs, wide eaves, and deep connection to private backyard patios.',
    era: '1935–1975',
    characteristics: ['Single-story horizontal footprint', 'Low-pitched roof with wide eaves', 'Large picture windows', 'Open interior layout']
  },
  romanesque: {
    key: 'romanesque',
    name: 'Romanesque Revival',
    wikipediaTitle: 'Romanesque Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Romanesque_Revival_architecture',
    wikidataId: 'Q744373',
    description: 'Late 19th-century revival characterized by heavy masonry walls, dramatic semi-circular round arches over doorways and windows, belt courses, and rough-faced stone masonry.',
    era: '1880–1905',
    characteristics: ['Heavy masonry & stonework', 'Round semi-circular arches', 'Sturdy masonry piers', 'Squat columns with carved capitals']
  },
  renaissance: {
    key: 'renaissance',
    name: 'Renaissance Revival',
    wikipediaTitle: 'Renaissance Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Renaissance_Revival_architecture',
    wikidataId: 'Q1058444',
    description: 'Inspired by Italian High Renaissance palazzi, marked by formal symmetry, rusticated ground floors, pronounced horizontal stringcourses, and decorative cornice friezes.',
    era: '1890–1930',
    characteristics: ['Symmetrical facade articulation', 'Rusticated masonry ground levels', 'Prominent decorative cornices', 'Round arched windows & pediments']
  },
  gothic_revival: {
    key: 'gothic_revival',
    name: 'Gothic Revival',
    wikipediaTitle: 'Gothic Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Gothic_Revival_architecture',
    wikidataId: 'Q186363',
    description: 'Popularized in 19th-century church and residential design, characterized by pointed arches, steep gables, lancet windows, decorative vergeboards, and vertical board-and-batten siding.',
    era: '1840–1890',
    characteristics: ['Pointed lancet arches', 'Steeply pitched gable roofs', 'Ornate vergeboards & gingerbread trim', 'Board-and-batten vertical siding']
  },
  neoclassical: {
    key: 'neoclassical',
    name: 'Neoclassical',
    wikipediaTitle: 'Neoclassical architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Neoclassical_architecture',
    wikidataId: 'Q54111',
    description: 'Revival of classical Greek and Roman architecture featuring full-height porticos with monumental columns, triangular pediments, and strict formal symmetry.',
    era: '1895–1950',
    characteristics: ['Full-height columned portico', 'Triangular pediment', 'Strict formal symmetry', 'Classical entablatures & balustrades']
  },
  art_deco: {
    key: 'art_deco',
    name: 'Art Deco',
    wikipediaTitle: 'Art Deco',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Art_Deco',
    wikidataId: 'Q34636',
    description: 'Visual arts and architecture style of the 1920s and 30s characterized by sleek geometric forms, zigzags, chevrons, vertical reeding, stepped towers, and stylized decorative bas-reliefs.',
    era: '1925–1940',
    characteristics: ['Geometric & chevron motifs', 'Stepped setbacks & towers', 'Stylized relief carvings', 'Smooth wall finishes with metallic accents']
  },
  streamline_moderne: {
    key: 'streamline_moderne',
    name: 'Streamline Moderne',
    wikipediaTitle: 'Streamline Moderne',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Streamline_Moderne',
    wikidataId: 'Q1479471',
    description: 'Late Art Deco style inspired by aerodynamic industrial design, featuring rounded corners, flat roofs, horizontal speed lines, glass block walls, and nautical porthole windows.',
    era: '1930–1945',
    characteristics: ['Curved aerodynamic corners', 'Horizontal speed lines & banding', 'Glass block windows', 'Flat roofs with coping']
  },
  churrigueresque: {
    key: 'churrigueresque',
    name: 'Churrigueresque',
    wikipediaTitle: 'Churrigueresque',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Churrigueresque',
    wikidataId: 'Q1089947',
    description: 'Elaborately ornate Spanish Baroque architectural style featuring rich sculptural embellishments, carved pilasters, spirals, and dense portal ornamentation.',
    era: '1915–1935',
    characteristics: ['Intricate sculptural ornamentation', 'Elaborate entrance portals', 'Spiraling columns & estipites', 'Dense decorative cresting']
  },
  italianate: {
    key: 'italianate',
    name: 'Italianate',
    wikipediaTitle: 'Italianate architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Italianate_architecture',
    wikidataId: 'Q2470987',
    description: '19th-century Romantic architecture style inspired by Italian farmhouses, featuring low-pitched roofs, wide overhanging eaves with large decorative brackets, and tall narrow arched windows.',
    era: '1850–1890',
    characteristics: ['Prominent decorative eave brackets', 'Tall narrow round-arched windows', 'Low-pitched hip roofs with cupolas', 'Quoins & bay windows']
  },
  french_normandy: {
    key: 'french_normandy',
    name: 'French Normandy',
    wikipediaTitle: 'Norman Revival architecture',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Norman_Revival_architecture',
    wikidataId: 'Q3333333',
    description: 'Picturesque residential revival style inspired by rural French cottages and Norman manors, distinguished by a prominent circular round tower with a conical roof housing the main entryway.',
    era: '1920–1940',
    characteristics: ['Round circular entry tower with conical roof', 'Steeply pitched hip roof', 'Brick, stone, and stucco cladding', 'Dormer windows breaking the roofline']
  }
};

export function getStyleInfo(styleKey: string): ArchitectureStyleInfo {
  const normalized = styleKey.toLowerCase().trim().replace(/[\s-]/g, '_');
  if (ARCHITECTURE_STYLES[normalized]) {
    return ARCHITECTURE_STYLES[normalized];
  }
  // Format unknown style gracefully
  const formattedName = styleKey
    .split(/[_\s-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    key: normalized,
    name: formattedName,
    wikipediaTitle: formattedName,
    wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(formattedName.replace(/ /g, '_'))}`,
    description: `Historic architectural style: ${formattedName}.`,
    era: 'Historic',
    characteristics: []
  };
}
