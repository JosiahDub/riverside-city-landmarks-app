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
