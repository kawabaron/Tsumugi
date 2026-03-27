# Tsumugi

Tsumugi is a React Native / Expo MVP for shared baby-care logging with a day timeline, quick logging, analytics, settings customization, and Siri shortcut scaffolding.

## What is included

- Expo Router app structure with auth flow and three main tabs
- Day-based timeline with swipe navigation
- Quick logging for milk, pee, poop, sleep start, sleep end, and memo
- Edit / delete flow with logical delete support
- 7-day analytics summaries and charts
- Settings for theme color, density, visible record types, quick action order, and one-tap behavior
- Invite-code based family grouping in a mock persisted repository
- Deep-link based Siri shortcut handling plus iOS App Intents samples

## Current data layer

The app currently runs against a persisted mock repository at `lib/mock/repository.ts`.

This keeps the full MVP flow usable without external credentials while preserving a cloud-ready shape:

- `familyGroupId` and `childId` are stored on every record
- settings, members, child profile, and records are separated by entity
- all mutations flow through shared repository methods
- Siri shortcuts reuse the same record creation path as manual input

`lib/firebase/config.ts` and `.env.example` are included so a Firebase adapter can be wired next without reshaping the UI layer.

## Getting started

1. Install Node.js 18+.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` if you plan to wire Firebase later.
4. Start the app with `npm run start`.
5. Open on iOS / Android via Expo.

## Project structure

- `app/`: routes and screens
- `components/`: reusable UI pieces
- `constants/`: palette and design tokens
- `hooks/`: TanStack Query hooks and Siri listener
- `lib/mock/`: persisted mock repository
- `lib/firebase/`: Firebase env scaffold
- `store/`: Zustand app state
- `types/`: domain models
- `ios/TsumugiIntents/`: sample App Intents for Siri Shortcuts

## Notes

- The repository was empty before this implementation, so the app was bootstrapped from scratch.
- The current environment did not have Node / npm available, so install and runtime verification could not be executed here.
