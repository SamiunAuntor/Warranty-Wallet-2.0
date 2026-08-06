# Warranty Wallet Frontend

The Warranty Wallet frontend is a Next.js App Router application for managing purchased assets, warranty documents, expiration reminders, claims, subscriptions, and administrative operations.

## Stack

- Next.js 16.2
- React 19.2
- TypeScript 5
- Tailwind CSS 4
- TanStack Query 5
- Firebase Authentication
- SweetAlert2
- Lucide React

Node.js 24.x is the supported runtime.

## Related documentation

- [Root project guide](../README.md)
- [Complete API reference](../docs/API_REFERENCE.md)
- [Copy-ready API examples](../docs/API_EXAMPLES.md)
- [API error catalog](../docs/ERROR_CATALOG.md)
- [OpenAPI 3.1 specification](../docs/openapi/openapi.yaml)
- [Architecture guide](../docs/ARCHITECTURE.md)
- [Environment configuration](../docs/ENVIRONMENT.md)
- [Testing guide](../docs/TESTING.md)

Frontend contributors should read the API reference before adding endpoint calls. Request construction and response types belong in `src/lib`, not directly inside page components.

## Features

### Public experience

- Product landing page
- Pricing overview
- Email/password registration and login
- Google sign-in
- Forgot-password and reset-password flows
- Payment success and cancellation pages

### User dashboard

- Warranty summary and recent activity
- Asset creation, editing, details, filtering, and archiving
- Document upload and document statistics
- Claim creation and claim history
- Notification center
- Billing and plan management
- Profile, regional, and reminder preferences

### Administrator workspace

- Platform overview
- User and access management
- Asset and claim oversight
- Category and brand management
- Payment monitoring
- Notification broadcasts
- Operational reports

## Directory guide

```text
src/
├── app/
│   ├── (public)/           Public pages and shared public layout
│   ├── admin/              Protected administrator routes
│   ├── dashboard/          Protected user routes
│   ├── payment/            Stripe result pages
│   ├── globals.css         Global styles and Tailwind import
│   └── layout.tsx          Root providers and metadata
├── components/
│   ├── admin/              Administrator navigation and visualizations
│   ├── assets/             Asset forms, onboarding, and detail dialogs
│   ├── auth/               Authentication helpers and guards
│   ├── claims/             Claim form UI
│   ├── dashboard/          Dashboard navigation and notifications
│   ├── providers/          Application-wide providers
│   ├── public/             Public navigation and footer
│   └── ui/                 Shared UI primitives
├── constants/              Plan presentation data
├── contexts/               Auth and preference state
├── hooks/                  URL/query synchronization
└── lib/                    API clients and browser utilities
```

## Getting started

Install dependencies:

```bash
npm install
```

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure the backend URL and Firebase web application values, then run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

These values are included in the browser bundle. Use Firebase web-app configuration here, never Firebase Admin credentials.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Turbopack development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve an existing production build |
| `npm run lint` | Run the Next.js ESLint configuration |

## Routing

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing landing page |
| `/register` | User registration |
| `/login` | User login |
| `/forgot-password` | Request a reset email |
| `/reset-password` | Complete a Firebase reset flow |
| `/payment/success` | Confirm a checkout result |
| `/payment/cancel` | Explain a cancelled checkout |

### User routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Overview and warranty metrics |
| `/dashboard/assets` | Asset inventory |
| `/dashboard/documents` | Uploaded documents |
| `/dashboard/claims` | Warranty claims |
| `/dashboard/billing` | Plans, subscription, and payments |
| `/dashboard/settings` | Profile and preferences |
| `/dashboard/support` | Support information |

### Administrator routes

The `/admin` tree contains dashboards for users, assets, claims, categories, brands, payments, notifications, and reports. `AdminGuard` prevents authenticated non-admin users from entering these routes.

## Authentication lifecycle

`AuthProvider` owns Firebase and application-user state.

1. Firebase restores the browser session.
2. The provider receives the Firebase user through `onAuthStateChanged`.
3. The frontend exchanges the user identity with `/users/sync`.
4. The API returns the local application user, including role, status, and plan.
5. Route guards direct users to the correct dashboard or login page.

If synchronization fails, the frontend signs out the Firebase session to avoid keeping a partially authenticated state.

## API client pattern

Feature clients live in `src/lib/*-api.ts`. Protected calls accept a Firebase ID token and add it to the `Authorization` header. Shared error handling converts unsuccessful API responses into readable JavaScript errors.

Keep page components focused on view state. Put request construction, response types, and endpoint-specific parsing in the corresponding API client.

### Request checklist

- Build URLs from `NEXT_PUBLIC_API_URL`.
- Obtain a fresh Firebase ID token for protected operations.
- Use JSON for ordinary requests and `FormData` for uploads.
- Do not set a multipart boundary manually; the browser adds it.
- Treat non-2xx responses as errors even if a JSON body is returned.
- Preserve form input when a request fails.
- Avoid automatic retries for payments, uploads, and destructive mutations.
- Never log bearer tokens or uploaded document contents.

### Response handling

JSON endpoints return a shared success envelope containing `success`, `statusCode`, `message`, `data`, and optional `meta`. Binary report endpoints return a file response instead.

Authentication failures should return the user to a safe signed-out state. Authorization failures should not be retried. Temporary provider and database failures may be retried with a delay when the operation is read-only or explicitly idempotent.

## Server and client components

Pages and layouts are server components unless they need browser state, effects, event handlers, or Firebase. Files that use those capabilities begin with `"use client"`.

Avoid turning large route trees into client components. Prefer a small client component inside a server-rendered page when only one interaction needs browser state.

## Query and URL state

Administrative lists and dashboard views preserve filters, sorting, and pagination in URL query parameters. The shared query synchronization hook keeps browser navigation meaningful and makes filtered views linkable.

When adding a new filter:

1. Define its default value.
2. Parse and normalize the URL value.
3. Pass it to the API client.
4. Reset pagination when the filter changes.
5. Preserve unrelated query keys.

## Styling conventions

- Tailwind utility classes are the primary styling mechanism.
- Global color and font variables live in `src/app/globals.css`.
- Shared controls belong in `src/components/ui`.
- Repeated icons should be added to the central `Icon` component.
- Interactive elements should retain visible focus, hover, and disabled states.
- Layouts should be checked at mobile, tablet, and desktop breakpoints.

## Error handling

- API failures should display a concise toast or inline message.
- Authentication errors are normalized in `src/lib/auth-errors.ts`.
- Loading states should use the shared loading UI.
- Mutations should prevent duplicate submissions while pending.
- Errors must not expose tokens, raw provider responses, or private configuration.

## Adding a page

1. Choose the correct public, dashboard, or admin route group.
2. Reuse the corresponding layout and guard.
3. Add typed API functions under `src/lib` when data is required.
4. Use shared components before introducing page-specific duplicates.
5. Include loading, empty, error, and success states.
6. Verify navigation and responsive layout.

## Quality checks

Before opening a pull request:

```bash
npm run lint
npm run build
```

Also exercise the affected route in a browser. For authenticated changes, verify both a valid user and a signed-out session. For admin changes, verify that a normal user is rejected.

## Deployment

The frontend is configured for Vercel. Add all `NEXT_PUBLIC_*` values to the Vercel project before deployment. `NEXT_PUBLIC_API_URL` must reference the deployed API and should include `/api/v1`.

After deployment, verify:

- Landing page assets load.
- Firebase sign-in domains include the deployed hostname.
- The API allows the deployed origin through CORS.
- Authentication redirects remain on the production domain.
- Stripe result pages can reach the backend.

## Troubleshooting

### Firebase is not configured

Create `frontend/.env.local`, fill the required public Firebase values, and restart the dev server. Environment changes are not picked up reliably without a restart.

### API requests fail with CORS

Confirm the frontend origin appears in the backend `CLIENT_URL` list and that `NEXT_PUBLIC_API_URL` points to the intended API.

### Turbopack selects the wrong root

The project sets `turbopack.root` in `next.config.ts`. Keep this setting when the repository is located below another directory containing a lockfile.

### Google font download fails

Next.js falls back to the configured system font during local network failures. Production builds should have access to the font provider or should switch to a bundled local font.
