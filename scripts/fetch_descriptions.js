import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landmarksPath = path.resolve(__dirname, '../src/data/landmarks.json');

// Helper to load env variables from .env.local or .env if not already present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (err) {
        console.warn(`[Google Sheet Sync] Warning reading ${file}:`, err.message);
      }
    }
  }
}

// Simple RFC 4180 compliant CSV parser
export function parseCSV(text) {
  const normalized = text.replace(/\r\r\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let row = [];
  let inQuotes = false;
  let current = '';

  for (let i = 0; i < normalized.length; i++) {
    const c = normalized[i];
    const next = normalized[i + 1];

    if (c === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if (c === '\n' && !inQuotes) {
      row.push(current);
      current = '';
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
    } else {
      current += c;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

export async function fetchGoogleSheetDescriptions() {
  loadEnv();

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    console.log('[Google Sheet Sync] Notice: GOOGLE_SHEET_ID environment variable is not set.');
    console.log('[Google Sheet Sync] Skipping Google Sheet sync and retaining existing descriptions.');
    return false;
  }

  const gid = '1114428680';
  const urls = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=landmarks`
  ];

  let csvText = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LandmarksApp/1.0; +https://riversidelandmarks.com)'
        }
      });
      if (res.ok) {
        const text = await res.text();
        // Check if the response is an HTML login page rather than a CSV
        if (
          !text.trim().startsWith('<!DOCTYPE html') &&
          !text.trim().startsWith('<html') &&
          !text.includes('accounts.google.com/ServiceLogin')
        ) {
          csvText = text;
          break;
        }
      }
    } catch (err) {
      // Continue to next URL fallback
    }
  }

  if (!csvText) {
    console.warn('\n[Google Sheet Sync] WARNING: Unable to fetch descriptions CSV from Google Sheet.');
    console.warn('[Google Sheet Sync] If the sheet is private, Google returns a login redirect.');
    console.warn('[Google Sheet Sync] To make it accessible at build time:');
    console.warn('[Google Sheet Sync]   1. Open the Google Sheet');
    console.warn('[Google Sheet Sync]   2. Click "Share" (top right)');
    console.warn('[Google Sheet Sync]   3. Set General access to "Anyone with the link" (Viewer)\n');
    console.warn('[Google Sheet Sync] Proceeding with existing descriptions in landmarks.json.\n');
    return false;
  }

  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    console.warn('[Google Sheet Sync] Warning: CSV has fewer than 2 rows. Skipping update.');
    return false;
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  let numberColIdx = header.findIndex((h) => /^(number|ref|refnumber|id|landmark\s*#?|#)$/i.test(h));
  if (numberColIdx === -1 && rows.length > 1 && /^\d+$/.test(rows[1][0]?.trim())) {
    numberColIdx = 0;
  }

  let descColIdx = header.findIndex((h) => /^(description|summary|desc|historical\s*summary)$/i.test(h));
  if (descColIdx === -1 && header.length > 2) {
    descColIdx = 2;
  }

  if (numberColIdx === -1 || descColIdx === -1) {
    console.warn(`[Google Sheet Sync] Warning: Could not detect Number/Description columns (Number: ${numberColIdx}, Description: ${descColIdx}).`);
    return false;
  }

  const descriptionsByRef = {};
  for (const row of rows.slice(1)) {
    const rawNum = row[numberColIdx]?.trim();
    const desc = row[descColIdx];
    if (rawNum && typeof desc === 'string') {
      const num = parseInt(rawNum, 10);
      if (!isNaN(num)) {
        // Do not edit the text at all
        descriptionsByRef[num] = desc;
      }
    }
  }

  const totalLoaded = Object.keys(descriptionsByRef).length;
  if (totalLoaded === 0) {
    console.warn('[Google Sheet Sync] Warning: No landmark descriptions found in parsed CSV.');
    return false;
  }

  if (!fs.existsSync(landmarksPath)) {
    console.warn(`[Google Sheet Sync] Warning: ${landmarksPath} does not exist.`);
    return false;
  }

  const landmarks = JSON.parse(fs.readFileSync(landmarksPath, 'utf8'));
  let updatedCount = 0;

  for (const landmark of landmarks) {
    const ref = parseInt(landmark.refNumber || landmark.ref, 10);
    if (!isNaN(ref) && Object.prototype.hasOwnProperty.call(descriptionsByRef, ref)) {
      landmark.description = descriptionsByRef[ref];
      updatedCount++;
    }
  }

  fs.writeFileSync(landmarksPath, JSON.stringify(landmarks, null, 2) + '\n', 'utf8');
  console.log(`[Google Sheet Sync] Successfully pulled ${updatedCount} descriptions from Google Sheet (tab: landmarks) into landmarks.json.`);
  return true;
}

// If invoked directly from command line
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchGoogleSheetDescriptions()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Google Sheet Sync] Error:', err);
      process.exit(0); // Exit cleanly so build is not blocked if offline
    });
}
