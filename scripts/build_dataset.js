import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const overpassPath = path.resolve(__dirname, '../overpass_landmarks.json');
const outputPath = path.resolve(__dirname, '../src/data/landmarks.json');

// Convert Wikimedia Commons filename or Special:FilePath to direct CDN url
export function getCommonsImageUrl(commonsVal, width = 800) {
  if (!commonsVal) return null;
  if (commonsVal.startsWith('http://') || commonsVal.startsWith('https://')) {
    if (commonsVal.includes('Special:FilePath/')) {
      const filename = commonsVal.split('Special:FilePath/')[1].split('?')[0];
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=${width}`;
    }
    return commonsVal;
  }
  let filename = commonsVal;
  if (filename.startsWith('File:')) {
    filename = filename.replace('File:', '');
  }
  filename = encodeURIComponent(filename.trim().replace(/ /g, '_'));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=${width}`;
}

async function fetchWikidataEntities(qids) {
  // Filter only valid QIDs
  const validQids = Array.from(new Set(qids.filter(id => /^Q\d+$/.test(id))));
  const chunks = [];
  const chunkSize = 30;
  for (let i = 0; i < validQids.length; i += chunkSize) {
    chunks.push(validQids.slice(i, i + chunkSize));
  }

  const entities = {};
  for (const chunk of chunks) {
    const ids = chunk.join('|');
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=labels|descriptions|sitelinks|claims&languages=en&sitefilter=enwiki&format=json`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'RiversideLandmarksMap/1.0 (historic-landmarks@example.com)' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.entities) {
          Object.assign(entities, json.entities);
        }
      }
    } catch (e) {
      console.warn('Error fetching Wikidata chunk:', e.message);
    }
  }
  return entities;
}

const STYLE_QID_MAP = {
  'Q3645460': 'spanish_revival',
  'Q7937337': 'spanish_revival',
  'Q2700522': 'mission_revival',
  'Q186363': 'gothic_revival',
  'Q7270218': 'queen_anne',
  'Q7270243': 'queen_anne',
  'Q54111': 'neoclassical',
  'Q463382': 'craftsman',
  'Q463806': 'craftsman',
  'Q529819': 'american_foursquare',
  'Q3399545': 'mediterranean_revival',
  'Q5021201': 'california_bungalow',
  'Q136693': 'romanesque',
  'Q744373': 'romanesque',
  'Q9159144': 'renaissance',
  'Q1058444': 'renaissance',
  'Q7851317': 'tudor_revival',
  'Q953258': 'tudor_revival',
  'Q565165': 'victorian',
  'Q565970': 'victorian',
  'Q74156': 'art_deco',
  'Q34636': 'art_deco',
  'Q5148367': 'colonial_revival',
  'Q1110996': 'colonial_revival',
  'Q7258468': 'pueblo_revival',
  'Q1622345': 'pueblo_revival',
  'Q2130555': 'monterey_colonial',
  'Q2256729': 'prairie_school',
  'Q6840667': 'midcentury_modern',
  'Q3312702': 'midcentury_modern',
  'Q245188': 'streamline_moderne',
  'Q1479471': 'streamline_moderne',
  'Q1642273': 'ranch',
  'Q200789': 'beaux_arts',
  'Q1089947': 'churrigueresque',
  'Q2470987': 'italianate',
  'Q3333333': 'french_normandy'
};

export async function processLandmarks() {
  console.log('Querying live Overpass API for latest OpenStreetMap landmarks...');
  let elements = [];
  try {
    const query = '[out:json][timeout:120]; nwr["ref:US-CA:city_of_riverside_cultural_heritage_board"]; out center tags;';
    const params = new URLSearchParams();
    params.append('data', query);

    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];

    let success = false;
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: params,
          headers: {
            'Accept': '*/*',
            'User-Agent': 'curl/8.7.1'
          }
        });
        if (res.ok) {
          const rawOverpass = await res.json();
          elements = rawOverpass.elements || [];
          fs.writeFileSync(overpassPath, JSON.stringify(rawOverpass, null, 2));
          console.log(`Successfully fetched ${elements.length} fresh elements live from ${endpoint}.`);
          success = true;
          break;
        }
      } catch (e) {
        console.warn(`Endpoint ${endpoint} failed, trying next...`);
      }
    }

    if (!success) {
      throw new Error('All Overpass API endpoints failed');
    }
  } catch (err) {
    console.warn(`Live Overpass fetch error: ${err.message}. Checking local cache...`);
    if (fs.existsSync(overpassPath)) {
      const rawOverpass = JSON.parse(fs.readFileSync(overpassPath, 'utf8'));
      elements = rawOverpass.elements || [];
      console.log(`Loaded ${elements.length} elements from local cache.`);
    } else {
      console.error('No local cache found and live fetch failed.');
      return;
    }
  }

  // Extract all wikidata IDs, splitting on semicolons
  const rawQids = [];
  elements.forEach(e => {
    if (e.tags?.wikidata) {
      e.tags.wikidata.split(';').forEach(q => rawQids.push(q.trim()));
    }
    if (e.tags?.['architect:wikidata']) {
      e.tags['architect:wikidata'].split(';').forEach(q => rawQids.push(q.trim()));
    }
  });

  console.log(`Fetching Wikidata details for entities...`);
  const wikidataEntities = await fetchWikidataEntities(rawQids);

  // Also collect secondary QIDs from claims (P84 architects, P149 styles, P466/P3320 occupants)
  const secondaryQids = new Set();
  Object.values(wikidataEntities).forEach(ent => {
    // Architects (P84)
    ent.claims?.P84?.forEach(stmt => {
      const qid = stmt.mainsnak?.datavalue?.value?.id;
      if (qid && !wikidataEntities[qid]) secondaryQids.add(qid);
    });
    // Styles (P149)
    ent.claims?.P149?.forEach(stmt => {
      const qid = stmt.mainsnak?.datavalue?.value?.id;
      if (qid && !wikidataEntities[qid] && !STYLE_QID_MAP[qid]) secondaryQids.add(qid);
    });
    // Occupants (P466) & Residents (P3320)
    ent.claims?.P466?.forEach(stmt => {
      const qid = stmt.mainsnak?.datavalue?.value?.id;
      if (qid && !wikidataEntities[qid]) secondaryQids.add(qid);
    });
    ent.claims?.P3320?.forEach(stmt => {
      const qid = stmt.mainsnak?.datavalue?.value?.id;
      if (qid && !wikidataEntities[qid]) secondaryQids.add(qid);
    });
  });
  if (secondaryQids.size > 0) {
    const extraEntities = await fetchWikidataEntities(Array.from(secondaryQids));
    Object.assign(wikidataEntities, extraEntities);
  }

  const landmarks = elements.map(el => {
    const tags = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    const ref = tags['ref:US-CA:city_of_riverside_cultural_heritage_board'] || '';
    
    // Extract first valid QID
    const itemQids = (tags.wikidata || '').split(';').map(s => s.trim()).filter(id => /^Q\d+$/.test(id));
    const qid = itemQids[0] || null;
    const wdEntity = qid ? wikidataEntities[qid] : null;

    // Determine name
    let name = tags.name || tags['name:en'] || wdEntity?.labels?.en?.value;
    if (!name) {
      if (tags['addr:housenumber'] && tags['addr:street']) {
        name = `${tags['addr:housenumber']} ${tags['addr:street']}`;
      } else {
        name = `Landmark #${ref || el.id}`;
      }
    }

    // Determine description
    let description = tags.description || wdEntity?.descriptions?.en?.value || '';

    // Determine year / start date
    let rawDate = tags.start_date || '';
    let year = null;
    if (rawDate) {
      const match = rawDate.match(/(\d{4})/);
      if (match) year = parseInt(match[1], 10);
    }
    // Fallback inception from Wikidata claims (P571)
    if (!year && wdEntity?.claims?.P571?.[0]?.mainsnak?.datavalue?.value?.time) {
      const timeStr = wdEntity.claims.P571[0].mainsnak.datavalue.value.time;
      const match = timeStr.match(/[+-](\d{4})/);
      if (match) {
        year = parseInt(match[1], 10);
        if (!rawDate) rawDate = String(year);
      }
    }

    // Architects (split by semicolon, and check Wikidata P84)
    const architectSet = new Set();
    if (tags.architect) {
      tags.architect.split(';').forEach(a => {
        const trimmed = a.trim();
        // Normalize typos like "G. Stanley WIlson" -> "G. Stanley Wilson"
        if (trimmed.toLowerCase() === 'g. stanley wilson') {
          architectSet.add('G. Stanley Wilson');
        } else if (trimmed) {
          architectSet.add(trimmed);
        }
      });
    }
    // If Wikidata has architects (P84)
    if (wdEntity?.claims?.P84) {
      wdEntity.claims.P84.forEach(stmt => {
        const aQid = stmt.mainsnak?.datavalue?.value?.id;
        if (aQid && wikidataEntities[aQid]?.labels?.en?.value) {
          architectSet.add(wikidataEntities[aQid].labels.en.value);
        }
      });
    }
    const architects = Array.from(architectSet);

    // Architecture styles (from OSM tags + Wikidata P149)
    const styleSet = new Set();
    if (tags['building:architecture']) {
      tags['building:architecture']
        .split(';')
        .map(s => s.trim().toLowerCase().replace(/[\s-]/g, '_'))
        .filter(Boolean)
        .forEach(s => styleSet.add(s));
    }
    if (wdEntity?.claims?.P149) {
      wdEntity.claims.P149.forEach(stmt => {
        const sQid = stmt.mainsnak?.datavalue?.value?.id;
        if (sQid) {
          const mappedKey = STYLE_QID_MAP[sQid];
          if (mappedKey) {
            styleSet.add(mappedKey);
          } else if (wikidataEntities[sQid]?.labels?.en?.value) {
            const raw = wikidataEntities[sQid].labels.en.value
              .toLowerCase()
              .replace(/ architecture$/, '')
              .replace(/ style$/, '')
              .trim()
              .replace(/[\s-]/g, '_');
            styleSet.add(raw);
          }
        }
      });
    }
    const architectureStyles = Array.from(styleSet);

    // Notable residents (from OSM tags + Wikidata P466 occupant / P3320 resident)
    const residentSet = new Set();
    const rawOsmResidents = tags.notable_resident || tags.resident || tags.notable_residents;
    if (rawOsmResidents) {
      rawOsmResidents.split(';').forEach(r => {
        const tr = r.trim();
        if (tr) residentSet.add(tr);
      });
    }
    if (wdEntity?.claims?.P466) {
      wdEntity.claims.P466.forEach(stmt => {
        const rQid = stmt.mainsnak?.datavalue?.value?.id;
        if (rQid && wikidataEntities[rQid]?.labels?.en?.value) {
          residentSet.add(wikidataEntities[rQid].labels.en.value);
        }
      });
    }
    if (wdEntity?.claims?.P3320) {
      wdEntity.claims.P3320.forEach(stmt => {
        const rQid = stmt.mainsnak?.datavalue?.value?.id;
        if (rQid && wikidataEntities[rQid]?.labels?.en?.value) {
          residentSet.add(wikidataEntities[rQid].labels.en.value);
        }
      });
    }
    const notableResidents = Array.from(residentSet);

    // Address
    const addressParts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:unit'] ? `Unit ${tags['addr:unit']}` : null,
      tags['addr:city'] || 'Riverside',
      tags['addr:state'] || 'CA',
      tags['addr:postcode']
    ].filter(Boolean);
    const address = addressParts.length > 2 ? addressParts.join(' ') : (tags['addr:street'] || null);

    // Wikipedia
    let wikipediaUrl = null;
    let wikipediaTitle = null;
    if (tags.wikipedia) {
      const cleanWp = tags.wikipedia.replace(/^en:/, '');
      wikipediaTitle = cleanWp;
      wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanWp.replace(/ /g, '_'))}`;
    } else if (wdEntity?.sitelinks?.enwiki?.title) {
      wikipediaTitle = wdEntity.sitelinks.enwiki.title;
      wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipediaTitle.replace(/ /g, '_'))}`;
    }

    // Image: OSM wikimedia_commons or image, or Wikidata P18
    let commonsImage = tags.wikimedia_commons || tags.image || null;
    if (!commonsImage && wdEntity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value) {
      commonsImage = `File:${wdEntity.claims.P18[0].mainsnak.datavalue.value}`;
    }
    const imageUrl = getCommonsImageUrl(commonsImage, 800);
    const thumbnail = getCommonsImageUrl(commonsImage, 400);
    return {
      id: `osm-${el.type}-${el.id}`,
      osmType: el.type,
      osmId: el.id,
      ref: ref,
      refNumber: parseInt(ref, 10) || 9999,
      name,
      lat,
      lon,
      description,
      startDate: rawDate || null,
      year: year || null,
      architects,
      architectureStyles,
      notableResidents,
      address,
      wikidata: qid,
      wikidataUrl: qid ? `https://www.wikidata.org/wiki/${qid}` : null,
      wikipedia: wikipediaTitle,
      wikipediaUrl,
      commonsImage,
      imageUrl,
      thumbnail,
      heritageWebsite: tags['heritage:website'] || 'https://riversideca.gov/cityclerk/boards-commissions/cultural-heritage-board',
      osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      natural: tags.natural || null,
      building: tags.building || null,
      historic: tags.historic || null,
      amenity: tags.amenity || null,
      allTags: tags
    };
  });

  // Sort by landmark ref number
  landmarks.sort((a, b) => a.refNumber - b.refNumber);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(landmarks, null, 2));
  console.log(`Successfully generated ${landmarks.length} landmarks to ${outputPath}`);
}

processLandmarks();
