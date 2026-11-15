# Mwenje

Crowdsourced power-outage app for Zimbabwe. *Know before the lights go.*

Built with Expo (SDK 58), Expo Router and React Native. Every screen matches the Mwenje design canvas. There is **no backend yet**: all data comes from `src/store/mock.ts` and is saved on the device with AsyncStorage.

## Run it

```bash
npm install
npx expo start          # press i (iOS), a (Android) or w (web)
```

This uses only modules that Expo Go bundles (svg, fonts, haptics, async-storage), so you can scan the QR code with Expo Go on your phone.

## Screens (`src/app`)

| Route | Screen | What works |
|---|---|---|
| `/onboarding` | Welcome | 3 tips (tap the dots or the text), Get started → Home. Shown only on first launch |
| `/home` | Home | Live outage timer and ring, usual-back estimate, stats, next likely cut, area picker, unread-alerts dot |
| `/report` | Report (modal) | "It went off" / "It's back" toggle, big tap button → updates the suburb, adds an alert, haptic feedback |
| `/map` | Live map | Suburb pins (ON / report count), tap to select, search, filter (all / off / on), open the suburb as your area |
| `/forecast` | Forecast | 7-day strip, chance-of-power curve (tap or drag to scrub), "Coming up" list, See all |
| `/alerts` | Alerts | 30-min heads-up switch, Today / Earlier feed, unread dots, tap to read, Mark all read |
| `/area` | Area picker (modal) | Search and switch suburb |

## Where the backend plugs in

- `src/store/index.tsx`: the reducer actions (`report`, `setArea`, `toggleHeadsUp`, `markRead`…) become API calls.
- `src/store/mock.ts`: `seedAreas`, `seedAlerts` and `forecastFor` become `GET /areas`, `GET /alerts` and `GET /areas/:id/forecast`.
- Push notifications for the heads-up: add `expo-notifications` once there's a server to send them.

## Brand

Tokens are in `src/theme/index.ts`, the logo is in `src/components/Logo.tsx`, and the app icons are in `assets/`.
