# Warranty Wallet Mobile

React Native client for Warranty Wallet. The app uses the existing Express API and Firebase project; it does not create a second backend.

## Local setup

1. Copy `.env.example` to `.env` and fill in the Firebase values used by `frontend/.env.local`.
2. Set `EXPO_PUBLIC_API_URL` to the reachable backend URL. A physical device cannot use `localhost` for a computer-hosted API.
3. Run `npm.cmd install` and then `npm.cmd run start`.

The mobile application is intentionally isolated under `mobile/` so the existing Next.js web application remains unchanged.

## Device and release notes

- Use the computer's LAN IP in `EXPO_PUBLIC_API_URL` when testing on a physical device.
- Fill the three Google client IDs in `.env` to enable Google sign-in on Android, iOS, and web.
- Use `eas build --profile preview` for an internal device build and `eas build --profile production` for store builds.
- Configure the same Firebase Android package and iOS bundle identifiers from `app.json` in the Firebase console before release.
