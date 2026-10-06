# Prepared For Anything

A public preparedness guide for exploring regional hazards, official weather alerts,
and practical ways to get ready. The site has no accounts or dashboard.

## Visitor experience

- Explore hazards and seasonal guidance for all 50 US states and DC.
- View regional hazard markers and official National Weather Service alerts.
- Choose a state, search a US city, or optionally use browser location.
- Compare a printable, three-day kit checklist for a state hazard or common emergency
  across household sizes of one to four people. Checklist checks stay in the current tab.
- Browse official federal and state starting points, county/regional services, and
  city/county lookup links in the resource directory. Local agencies and shelter status
  vary; confirm current instructions with the responsible authority.
- The selected state is the only visitor preference saved by this site. It is stored in
  a first-party cookie for one year and can be removed with **Forget my location**.
- A city/county name typed into the resources page is not saved; opening a local .gov
  search sends the entered place as a query to Google.
- Location search uses Open-Meteo geocoding. Opt-in coordinates are sent to
  BigDataCloud for reverse geocoding; precise coordinates are not stored by the site.
- Weather alerts come from `api.weather.gov` and refresh every five minutes while a
  state is selected. API failures are shown as unavailable, never as an all-clear.
- Guidance is educational, state-level information, not an official risk score,
  forecast, or incident report.

## Advertising

Two responsive Google AdSense placements are included and show placeholders until
configured. Copy `.env.example` to `.env` and set:

```text
VITE_ADSENSE_CLIENT_ID=ca-pub-...
VITE_ADSENSE_TOP_SLOT_ID=...
VITE_ADSENSE_CONTENT_SLOT_ID=...
```

The publisher ID must be a Google AdSense `ca-pub-...` ID; each slot ID is the
numeric ad-unit ID from AdSense. These values are public site configuration, not
secrets. AdSense is not loaded while the IDs are empty. Before serving ads, complete
Google's site verification and configure any consent-management platform required
for the regions where the site is available. Ad providers may set their own cookies;
the site's first-party visitor cookie stores only the selected state.

## Tech stack

- React 19, TypeScript, Vite, and Tailwind CSS
- React Router
- Leaflet and React Leaflet with OpenStreetMap/Esri tiles
- Playwright browser tests (desktop and mobile Chromium)

## Getting started

Requirements: Node.js 18+ and npm 9+.

```bash
npm install
cp .env.example .env
npm run dev
```

Ad configuration is optional while developing. Without publisher and slot IDs, the
page renders labeled ad-space placeholders and does not load the AdSense script.

## Browser checks

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

The tests start a local Vite server on port 5181. They cover cookie persistence, kit
generation, jurisdiction filtering, location selection, alert failures, and map layers.
External API responses are controlled in tests; map tiles are loaded normally.
Screenshots and failure traces are written to the ignored `test-results` directory.

## Build and deploy

```bash
npm run build
```

The GitHub Actions workflow deploys to GitHub Pages. Set the repository's Pages source
to **GitHub Actions**. Add AdSense configuration as repository variables before enabling
advertising in production.

## Disclaimer

Prepared For Anything provides general informational and educational content, not
professional emergency management advice. Follow local authorities' instructions during
an emergency. In an immediate emergency, call 911.

## License

MIT
