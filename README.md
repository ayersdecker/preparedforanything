# 🛡️ Prepared For Anything

A personalized disaster preparedness platform built with React + TypeScript + Firebase.

## Features

- **Public area explorer**: Browse state hazards, typical seasons, and preparation tips without signing in.
- **Disaster map**: Filter regional hazards across all US states and DC, or view official NWS alert polygons.
- **Optional location**: Search US cities, select a state, or explicitly grant browser location access.
- 📍 **Location-Based Risk Assessment** — Know the disasters that threaten your specific area
- 📦 **Custom Emergency Kit Builder** — 72-hour kit tailored to your household size and needs
- 🗺️ **Evacuation Planning** — Plan routes and meeting points before disaster strikes
- 📄 **Printable Checklists** — Download PDF checklists for offline use

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **Auth**: Firebase Authentication (Email/Password + Google)
- **Database**: Firebase Firestore
- **Forms**: React Hook Form + Zod
- **PDF**: jsPDF
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Map**: Leaflet + React Leaflet with OpenStreetMap tiles
- **Browser tests**: Playwright (desktop and mobile Chromium)

## Visitor Experience

The home page is a public preparedness explorer. `?tab=area` opens the area overview;
`?tab=map` opens the disaster map. Account creation is a separate next step for
personal checklists and household planning; this change does not extend authentication.

- Coverage is currently the 50 US states and DC. City selection changes the map center,
  but preparedness guidance remains state-level, not an address-specific assessment.
- Regional priorities and typical peak months come from the existing educational state
  guide. They are qualitative, not official risk scores, forecasts, or incident reports.
- City searches use Open-Meteo geocoding. Opt-in browser coordinates are sent to
  BigDataCloud for reverse geocoding. Only the state code is saved in local storage;
  the location's clear button removes it. Precise coordinates are not persisted by this app.
- Active weather alerts come directly from `api.weather.gov`, refresh every five minutes
  while a state is selected, and can also be refreshed manually. Alerts are statewide;
  not all apply to the chosen city. Only source-provided geometry is drawn on the map.
  County-based alerts without polygons remain in the alert list. NWS is not an all-disaster
  reporting feed and this app does not accept community incident reports.
- API failures are shown as unavailable, never as an all-clear. State guidance still works
  without geocoding or alert services. Map tiles, city search, and alerts require internet.
- Browser geolocation requires HTTPS or localhost and explicit visitor permission.

### Browser Checks

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

The tests start a local Vite server on port 5181 and cover desktop/mobile location
selection, persistence and removal, geolocation consent/fallback, city lookup,
alert failures/recovery, and hazard/alert map layers. External API responses are
controlled in tests; OpenStreetMap tiles are loaded normally. Screenshots and
failure traces are written to the ignored test-results directory.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Firebase project (optional — app works in demo mode without Firebase)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/preparedforanything.git
cd preparedforanything

# Install dependencies
npm install

# Copy env example and fill in your Firebase credentials
cp .env.example .env
# Edit .env with your Firebase project config

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note**: The app works in **demo mode** without Firebase credentials. Users can explore the risk assessment, kit builder, and other features without authentication.

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** with Email/Password and Google providers
3. Create a **Firestore** database (start in test mode for development)
4. Copy your project config to `.env`

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

1. Go to your GitHub repository Settings → Pages
2. Set source to "GitHub Actions"
3. Add your Firebase credentials as repository secrets (Settings → Secrets)
4. Push to the `main` branch — the workflow will build and deploy automatically

## Project Structure

```
src/
  components/
    layout/       Header, Footer
    auth/         AuthGuard (protected route wrapper)
    ui/           Button, Card, Input (reusable components)
  contexts/
    AuthContext.tsx   Firebase auth + Firestore user profile
  lib/
    firebase.ts       Firebase initialization
    riskData.ts       Disaster risk database for all 50 US states
  pages/
    Landing.tsx       Public location, hazard, and disaster map explorer
    Login.tsx         Authentication
    Signup.tsx        Registration
    Dashboard.tsx     Main user dashboard
    ProfileSetup.tsx  Multi-step profile wizard
    RiskAssessment.tsx Location-based risk analysis
    KitBuilder.tsx    72-hour emergency kit builder with PDF export
    NotFound.tsx      404 page
  types/
    index.ts          TypeScript type definitions
```

## Disclaimer

The information provided by Prepared For Anything is for general informational and educational purposes only. It is not a substitute for professional emergency management advice. Always follow guidance from local authorities and emergency management officials during a disaster.

## Affiliate Disclosure

Some links on this platform may be affiliate links. We may earn a commission if you purchase through these links at no additional cost to you.

## License

MIT
