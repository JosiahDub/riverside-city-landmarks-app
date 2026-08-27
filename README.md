# City of Riverside Historic Landmarks Map

An interactive map application for exploring designated historic landmarks in the City of Riverside, California. Built strictly on **100% free and open-source data** from **OpenStreetMap (OSM)**, **Wikidata**, and **Wikimedia Commons**.

---

## Features

- **Interactive Map**:
  - Built with Leaflet using 100% free OpenStreetMap standard tiles (no API keys, no watermarks, completely open).
  - Includes a layer switcher to toggle between OpenStreetMap, Topographic, and Satellite imagery.
  - Custom pin markers with landmark numbers, category indicators, and interactive popups.
  - Responsive split layout (Map + Landmark List) or full-screen views.

- **Instant Zero-Latency Data Loading**:
  - Bundled with 155 City of Riverside designated cultural heritage landmarks.
  - Enriched with Wikidata labels, descriptions, and Wikipedia article links.
  - Live Overpass API sync button in the navbar to pull real-time updates directly from OpenStreetMap.

- **Tag & Value Explorer**:
  - **Architects**: Respects semicolon-delimited values (e.g. `architect=G. Stanley Wilson;Peter J. Weber`). Shows portraits, landmark counts, biographical summaries, and links to Wikipedia and Wikidata.
  - **Architectural Styles**: Maps shortened OSM tags (e.g. `queen_anne`, `mission_revival`, `beaux_arts`, `spanish_revival`, `craftsman`) to formal definitions, historical eras, key architectural characteristics, and Wikipedia articles.
  - **Historical Eras**: Categorized eras (Victorian, Citrus Boom, Golden Age of Mission & Spanish Revival, Pre-War, Mid-Century Modern).
  - **Botanical / Natural**: Highlights Riverside's designated living trees (Parent Navel Orange, Roosevelt Palm, Montezuma Bald Cypress, Redwood) and natural landmarks (Mt. Rubidoux).

- **Year Built Timeline & Range Slider**:
  - Interactive dual range filter allowing users to filter landmarks by construction date (e.g., `1890–1920`).
  - One-click historical preset buttons.

- **Geolocation & "Near Me" Mode**:
  - Locates the user using the browser Geolocation API.
  - Calculates real-time distance in miles using the Haversine formula.
  - Automatically sorts landmarks by proximity.
  - Zooms the map view to encompass the user and the nearest landmarks.

- **Rich Landmark Detail Drawer**:
  - Full-resolution Wikimedia Commons photos with a lightbox zoom viewer.
  - City of Riverside Cultural Heritage Board landmark designation badges.
  - Live Wikipedia article excerpt lookup via the Wikipedia REST API.
  - Clickable architect and architectural style badges that open biographical cards.
  - One-click links to the official City Heritage Board website, Wikidata, Wikipedia, Wikimedia Commons, and OpenStreetMap.
  - Directions button for instant turn-by-turn navigation.
  - Expandable viewer for raw OpenStreetMap tags.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet + OpenStreetMap (Standard / Topo / Satellite)
- **Icons**: Lucide React
- **Data Pipeline**: Node.js Overpass API fetcher + Wikidata REST entity enrichment

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

### 5. Update Landmark Data from OSM & Wikidata
To re-fetch the latest data directly from the Overpass API and Wikidata:
```bash
npm run update-data
```

---

## Data Provenance & Attribution

- **OpenStreetMap**: Data &copy; [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), licensed under [ODbL](https://opendatacommons.org/licenses/odbl/).
- **Wikidata**: Structured data licensed under [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/).
- **Wikipedia & Wikimedia Commons**: Media and summaries licensed under [CC BY-SA 3.0 / 4.0](https://creativecommons.org/licenses/by-sa/4.0/) or Public Domain.
- **City of Riverside Cultural Heritage Board**: [Official Website](https://riversideca.gov/cityclerk/boards-commissions/cultural-heritage-board).
