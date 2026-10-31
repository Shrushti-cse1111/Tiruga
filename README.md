# 🏛️ Tiruga (ತಿರು ಗ) — Karnataka AI Travel Companion

> **Tiruga** (Kannada for *"Wander / Roam"*) is an intelligent, culture-first travel companion crafted specifically for exploring Karnataka's rich heritage, coastal horizons, and Western Ghats sanctuaries. Built with a React + Vite PWA frontend, Capacitor for native Android deployment, and a security-hardened Node.js/Express backend powering Google Gemini 2.5 Flash.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.0-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Express-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## 🌟 Key Features

### 1. 🤖 AI-Powered Itinerary Planner
- **Custom Curated Schedules**: Generates multi-day, day-by-day itineraries tailored to destination, budget constraints, travel styles (Balanced, Heritage, Adventure, Relaxed), and companion groups (Solo, Couple, Family, Friends).
- **Gemini 2.5 Flash Engine**: Server-side structured prompt generation with strict JSON schema validation.
- **Budget Optimizer ("Make Cheaper")**: Analyzes planned activities and pinpoints cost-saving alternatives without compromising cultural depth.
- **Interactive AI Modification**: Real-time itinerary tweaking (*"Add more temples"*, *"Make Day 2 relaxed"*, *"Include authentic food stops"*).

### 2. 🗺️ Interactive Route Map & Navigation
- **Leaflet Integration (`leaflet@1.9.4`)**: Zero external map SDK bloat, strict adherence to OpenStreetMap tile standards with visible attribution.
- **Numbered Day-Colored Markers**: Distinct color tokens (`--day-1` to `--day-5`) for instant visual clarity across multi-day tours.
- **Road Route Proxy**: Backend OSRM routing proxy (`POST /api/route`) delivering realistic road geometries with 5s timeout, 24-hour caching, rate limiting, and graceful fallback to dashed geodesic lines.
- **Animated Route Player**: Simulated transit animations across Car (35 km/h), Bus (30 km/h), Bike (25 km/h), and Walking (4.5 km/h) modes. Full `prefers-reduced-motion` compliance with Prev/Next manual step controls.
- **Privacy-First Live Geolocation**: Explainer modal before requesting browser GPS coordinates; displays active user position with accuracy radius circle.
- **Offline Route Sketch (`RouteSketch.tsx`)**: Pure SVG-based route visualization that renders smoothly when offline or when tile requests fail.

### 3. ☔ Plan B & Weather Contingency
- **Real-Time Weather Adaptation**: Instantly transforms plans during sudden downpours, extreme heatwaves, or unexpected monument closures.
- **Automatic Indoor Swaps**: Replaces exposed outdoor ruins with heritage museums, local art galleries, or traditional indoor food experiences.

### 4. 🗣️ Kannada Companion (ಕನ್ನಡ ಮಿತ್ರ)
- **Audio Pronunciation & Situational Phrases**: Essential travel phrases covering auto haggling, food orders, directions, and emergency assistance.
- **Phonetic Transliteration**: English phonetic spellings alongside authentic Kannada scripts (`Noto Sans Kannada`).
- **Interactive Etiquette Guide**: Temple dress codes, footwear traditions, and regional customs.

### 5. 🚌 Karnataka Transport & Shakti Scheme
- **State Transport Options**: Transit legs across KSRTC, NWKRTC, KKRTC buses, trains, and cabs.
- **Shakti Scheme Indicators**: Highlights women-friendly free travel routes on eligible state transport services.

### 6. 📄 Clean PDF / Print Export
- **Print-Optimized Format**: Tailored for A4 and US Letter sizes with CSS page-break protections.
- **Configurable Sections**: Toggle inclusion of Itinerary, Cost Breakdown, Travel Options, Route Map Sketch, Emergency Contacts, and Cultural Notes.

### 7. 📴 Offline-First Storage
- **IndexedDB Persistence**: Saves complete trips, attraction directories, and Kannada phrases locally on the device for access in zero-connectivity regions.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| **State & Data Fetching**| TanStack Query v5, React Context API, Lucide Icons |
| **Mapping & Routing** | Leaflet 1.9.4, Custom OSRM Node Proxy, Custom SVG Route Sketch |
| **Mobile Runtime** | Capacitor 8 (Android Platform, Java 17 toolchain, Gradle 8.13) |
| **Backend & APIs** | Node.js, Express, @google/genai (Gemini 2.5 Flash) |
| **Database & Security** | Firebase Auth, Cloud Firestore (multi-tab cache & strict rules), Helmet CSP |

---

## 🌐 Languages Used

### 1. 💻 Programming & Markup Languages
As recognized in the repository breakdown:

| Language | Proportion | Primary Role in Tiruga |
| :--- | :---: | :--- |
| **TypeScript** | **~98.8%** | Entire core codebase: React frontend components, type-safe API clients, route mathematics, AI schema validators, Express server routes, and test suites. |
| **Java** | **Native** | Native Android platform bridge (`android/app/src/main/java/com/tiruga/app/MainActivity.java`), Capacitor runtime lifecycle hooks, and Android plugins. |
| **JavaScript** | **Scripts** | Capacitor CLI scripts, verification scripts, and runtime polyfills. |
| **HTML5 & CSS3** | **Styling** | Semantic DOM elements, Tailwind CSS v4 styling tokens, print media stylesheets (`print.css`), and Leaflet map marker layouts. |
| **Groovy / Gradle** | **Build** | Android build orchestration (`build.gradle`, `settings.gradle`, `app/build.gradle`). |
| **XML** | **Resources** | Android application manifest, vector drawables, mipmap icon sets, and layout definitions. |
| **JSON** | **Data** | Local tourist gazetteers, attraction coordinates, translation dictionaries, and Firebase security configurations. |

### 2. 🗣️ Spoken & Natural Languages (i18n Localization)
Tiruga is designed from the ground up to empower both domestic and international travelers visiting Karnataka:

- **Kannada (ಕನ್ನಡ)**: First-class native support throughout the entire application. Features custom Kannada typography (`Noto Sans Kannada`), full UI strings translation, situational phrases with voice audio pronunciations, cultural etiquette guidance, and bilingual itinerary exports.
- **English**: Primary international interface language, timeline schedules, technical logs, and developer documentation.
- **Marathi (मराठी)**: Regional locale support for travelers exploring northern Karnataka borders (Belagavi, Bidar, and Vijayapura circuits).

---

## 📁 Repository Structure

```text
Tiruga/
├── android/                   # Native Android Studio Capacitor project
│   ├── app/                   # Android Application module (Java, manifest, res)
│   ├── gradle/                # Gradle wrapper (8.13)
│   └── build.gradle           # Root Gradle configuration
├── data/                      # Local gazetteers & curated datasets
│   ├── attractions.json       # 68 catalog attractions with lat/lng coordinates
│   ├── destinations.json      # 15 Karnataka destinations with center points
│   ├── demoTrip.json          # Curated offline fallback trip
│   ├── phrases.json           # Categorized Kannada phrase library
│   └── coords.review.csv      # Audit report for geographic distance spread
├── docs/                      # Technical documentation
│   ├── ARCHITECTURE.md        # End-to-end data flow & diagrams
│   ├── DATA.md                # Data provenance & verification guidelines
│   └── SECURITY.md            # Zero-secret architecture, CSP & proxy rules
├── server/                    # Node.js / Express backend
│   ├── ai/                    # Gemini 2.5 Flash prompts & schema validation
│   ├── middleware/            # Rate limiting, timing-safe auth & Helmet CSP
│   └── routes/                # Route proxy (/api/route), AI, seed & health
├── src/
│   ├── components/            # Reusable UI & Map components
│   │   ├── common/            # Buttons, Cards, Modals, BottomNav
│   │   ├── map/RouteSketch.tsx# Standalone offline SVG route renderer
│   │   └── pdf/               # Print & PDF options sheet
│   ├── features/              # Feature screens (Lazy-loaded)
│   │   ├── map/               # Full-screen interactive Leaflet route map
│   │   ├── plan/              # Trip plan overview, day tabs & AI modifiers
│   │   ├── planb/             # Weather & crowd contingency adaptation
│   │   ├── kannada/           # Kannada companion & audio pronunciation
│   │   ├── travel/            # Buses, trains & Shakti scheme legs
│   │   ├── nearby/            # SVG nearby attraction radar
│   │   ├── offline/           # Offline storage viewer
│   │   └── print/             # Print-optimized trip document
│   ├── lib/                   # Core business logic & SDK clients
│   │   ├── api.ts             # Client API gateway with timeouts
│   │   ├── mapConfig.ts       # Tile settings & Karnataka bounding box
│   │   ├── route.ts           # Pure route calculations (haversine, bearing, interpolation)
│   │   └── offlineStore.ts    # IndexedDB offline transaction store
│   └── tests/                 # Unit tests (Route math, screen verification)
├── capacitor.config.json      # Capacitor app configuration (com.tiruga.app)
└── vite.config.ts             # Vite build & plugin configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.19+ or v22.12+ (Recommended)
- **Java Development Kit**: JDK 17 (Required for Android build)
- **Android Studio**: Ladybug / Meerkat or later (For Android builds)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Shrushti-cse1111/Tiruga.git
cd Tiruga
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the required environment variables:
```env
# Gemini API Key (Backend only, never exposed to client)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port
PORT=3000

# Optional: Seed Secret
SEED_SECRET=your_secure_seed_secret
```

### 3. Running Locally
Start both the Vite development server and Express backend:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📱 Running in Android Studio

Tiruga is configured as a native Android project using Capacitor:

1. **Build Web Production Bundle**:
   ```bash
   npm run build
   ```

2. **Sync Web Assets to Android**:
   ```bash
   npx cap copy android
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
   *Or open the `android/` directory directly in Android Studio.*

4. **Run or Build APK from Terminal**:
   ```bash
   cd android
   .\gradlew.bat assembleDebug
   ```
   The debug APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🧪 Testing & Verification

- **Route Helper Pure Unit Tests**:
  ```bash
  npm run test:route
  ```
  *Tests great-circle haversine distances, compass bearings, duration estimates, polyline interpolation, and skipped-stop handling.*

- **Attraction Coordinates Verification**:
  ```bash
  npm run data:check-coords
  ```
  *Validates all 68 attractions against Karnataka geographical bounds (lat 11.5–18.5, lng 74.0–78.6) and generates `data/coords.review.csv`.*

- **Type Checking**:
  ```bash
  npx tsc --noEmit
  ```

---

## 🔒 Security & Privacy

1. **Zero Secret Leakage**: The client bundle contains zero API keys or service account credentials. All Gemini calls and routing services pass through the backend proxy.
2. **Strict Route Validation**: The route proxy rejects requests containing coordinates outside Karnataka or payloads with fewer than 2 or more than 12 points.
3. **No Geolocation Logging**: Coordinates are never logged alongside user identifiers (`uid`).
4. **Hardened Content Security Policy**: Image sources are restricted to OpenStreetMap tile servers (`*.tile.openstreetmap.org`).

---

## 📄 License
This project is licensed under the MIT License.
