# Workouts

Personal training log PWA. Static-hosted, client-side-only. Deploys to GitHub Pages.

Live at: https://nramadas.github.io/workouts/

## Features

- Six-day lift program logged indefinitely (Mon–Sat), no week cap, no dates shown
- Live session logging with "beat the logbook" callouts and rest timer
- Progress charts per exercise, PR board, volume-per-muscle rollup
- Evening mobility protocol (read-only reference)
- Offline-first via service worker; iOS "Add to Home Screen" installable
- JSON export/import, Zod-validated

## Local dev

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

Deploys automatically on push to `main` via `.github/workflows/deploy.yml`. In
repo settings, set **Pages** → Source = **GitHub Actions**.

## Installing on iOS

1. Open `https://nramadas.github.io/workouts/` in Safari.
2. Share → **Add to Home Screen**.
3. Launch from the home screen icon — runs standalone, no URL bar.

## Data

- All logs live in IndexedDB (`workouts` database).
- No account, no cloud sync. Export regularly if you care about history.
- Units are lbs only.
- Timestamps are stored for ordering but never displayed — the app's temporal
  surface is day-of-week + session number.

## Source

- `src/data/workouts.json` is built from `workout_plan.xlsx`. To refresh, re-run
  the parse script (see `scripts/` or rebuild via Python).
- `src/data/mobility.json` is built from `mobility-protocol.html`.

## Repo layout

```
src/
  components/   shared UI (Nav, Card, RestTimer)
  data/         seed JSON — workouts + mobility
  db/           Dexie schema, export/import
  lib/          types, seed hydration, day-of-week helpers
  views/        Dashboard, Workout, Progress, Mobility, Settings
public/
  icons/        PWA icons + apple-touch-icon
```
