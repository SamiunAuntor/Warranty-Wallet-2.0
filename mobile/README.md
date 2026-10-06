# Warranty Wallet Mobile

The React Native (Expo SDK 57) client for Warranty Wallet. It uses the same Express API and Firebase project as the web app; there is no separate backend.

## Run it locally

1. Start the backend (`cd backend && npm run dev`). It listens on port 5000.
2. Copy `.env.example` to `.env` and fill in the Firebase values from `frontend/.env.local`.
3. Install and start:

   ```bash
   npm install
   npm start
   ```

4. Open the app in Expo Go or a development build.

### Reaching the API from a phone

Leave `EXPO_PUBLIC_API_URL` empty in development. The app then calls port 5000 on the same computer that serves the Expo bundle, so a physical phone on the same Wi‑Fi works without editing anything. Set the variable only to point at another server, such as the deployed API. The Android emulator falls back to `10.0.2.2`.

If the app opens to "Can't reach Warranty Wallet", check that the backend is running and that your firewall allows port 5000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm test` | Unit tests for the API client, validation, and formatting |
| `npm run typecheck` | TypeScript check |
| `npm run doctor` | Expo dependency and config checks |

## How the app is organised

- `app/` — routes (Expo Router). `(auth)` holds sign-in screens; `(app)` holds every signed-in screen in a single stack. Home, Assets, Claims, Alerts, and Account show the bottom tab bar (`components/navigation/TabBar.tsx`); detail and form screens push on top, so Back always returns to the previous screen.
- `lib/` — API clients (one file per backend module), shared types, validation, and formatting. `lib/api.ts` attaches the Firebase token, retries once with a refreshed token, and turns validation errors into readable messages.
- `hooks/` — TanStack Query hooks per feature. Changes invalidate related data (`hooks/query-keys.ts`), so the dashboard, lists, and detail screens stay in step.
- `components/ui/` — the design system. Colours and type follow the web app (`lib/theme.ts`, Inter font).

## Payments

Checkout opens Stripe in an in-app browser session. The app sends a `returnUrl` deep link (`warrantywallet://payment-return`, or `exp://…` in Expo Go) to `POST /payments/create-checkout`. Stripe returns to `GET /api/v1/payments/mobile-return`, which redirects to that link, closing the browser so the app can confirm the payment. The Stripe webhook still activates the plan if the app is closed mid-checkout.

## Google sign-in

Expo Go cannot complete Google sign-in. Create OAuth client IDs for Android (package `com.warrantywallet.app`), iOS (bundle `com.warrantywallet.app`), and web, add them to `.env`, and use a development build (`eas build --profile development`). The button is hidden on platforms without a client ID.

## Password reset

"Forgot password" sends Firebase's reset email. The default link opens a Firebase page in the browser; after resetting, the user signs in from the app. If the Firebase email template's action URL is pointed at `warrantywallet://reset-password`, the app's own reset screen handles the link instead.

## Builds

- `eas build --profile preview` — an installable APK pointing at the deployed API.
- `eas build --profile production` — store builds.

Register the Android package and iOS bundle identifier above in the Firebase console before releasing.
