# Tiruga Data Model & Verification Guidelines

## 1. Overview
All data within Tiruga comes from local configurations and curated gazetteers. By default, records are seeded with:
- `verified: 0` (Flagged as **Sample data** in the UI)
- `last_checked: "2026-10-25"` (Recorded audit date)
- `source: "Sample data: ..."` (Clear attribution)

## 2. Seed Files Structure
- `/shared/data/seedData.ts`:
  - `SEED_REGIONS`: 5 tourist circuits (Hampi-Badami, Bengaluru-Mysuru, Coorg-Chikkamagaluru, Coast, North Karnataka).
  - `SEED_RULES_CONFIG`: Shakti scheme eligibility, scoring weights, stops-per-day targets, 12-month regional climatology tables, and emergency helplines.
- `/shared/data/seedPlaces.ts`:
  - `SEED_PLACES`: 50+ places with latitude, longitude, entry fee (null for "Check locally"), indoor alternative flags, accessibility ratings, and dress codes.
  - `SEED_ALTERNATIVES`: Quiet alternative pairs with trade-off explanations.
  - `SEED_STAYS`: Accommodations categorized as `registered` (KSTDC / official homestays) or `unverified`.
  - `SEED_FOOD_SPOTS`: Authentic dishes and price estimates.
  - `SEED_TRANSPORT_LEGS`: KSRTC state bus services with `shakti_eligible` flags.

## 3. How to Mark Records Verified
When official transport boards, the Archaeological Survey of India (ASI), or local tourism authorities confirm ticket fees or schedules:
1. Update `last_checked` to current ISO date (e.g. `2026-10-25`).
2. Set `verified: 1`.
3. Set `source` to the official department (e.g. `KSRTC Central Office Bulletin #412`).
4. Re-run `npm run dev` or clear IndexedDB to re-seed.
