# 🛡️ Prepared For Anything

A personalized disaster preparedness platform built with React + TypeScript + Firebase.

## Features

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
    Landing.tsx       Marketing landing page
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
