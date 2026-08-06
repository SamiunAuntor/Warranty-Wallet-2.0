# Architecture

## System context

Warranty Wallet is a browser-based application backed by an HTTP API and several managed services. The web application owns presentation and browser authentication. The API owns authorization, domain rules, persistence, integrations, and scheduled work.

```text
Browser
  │
  ├── Firebase Authentication
  │
  └── Next.js frontend
        │ Authorization: Bearer <Firebase token>
        ▼
      Express API
        ├── PostgreSQL through Prisma
        ├── Firebase Admin token verification
        ├── Cloudinary document storage
        ├── Gemini invoice extraction
        ├── Stripe Checkout and webhooks
        └── SMTP transactional email
```

## Frontend boundaries

The frontend uses the Next.js App Router. Route groups separate public pages from protected user and administrator workspaces. Layouts provide shared navigation while guards enforce the expected application role after Firebase restores a session.

`AuthProvider` combines two identities:

- `firebaseUser` is the identity issued by Firebase.
- `appUser` is the database record returned by the backend.

The distinction is important because role, status, plan, and application preferences live in PostgreSQL rather than Firebase.

Feature API clients under `frontend/src/lib` define request and response types. Page components call these clients and retain UI-only state such as dialogs, selected rows, and filters.

## Backend layers

Most backend domains use four layers:

```text
route -> controller -> service -> repository -> Prisma
```

- Routes define paths, middleware, and request validation.
- Controllers translate HTTP input and output.
- Services implement business rules and integration orchestration.
- Repositories contain database queries.
- Validation modules contain Zod schemas.
- Constant modules centralize domain messages and allowed values.

This separation makes service rules testable without opening sockets or connecting to external providers.

## Request lifecycle

1. Helmet and CORS apply response and origin policy.
2. Compression and request logging wrap the request.
3. Rate limiting protects `/api` routes.
4. Stripe webhook routes receive raw bodies before JSON parsing.
5. JSON or URL-encoded parsers process ordinary API requests.
6. Authentication verifies Firebase tokens for protected routes.
7. Role middleware enforces administrator access where required.
8. Zod validation replaces request values with normalized data.
9. Controllers invoke services and send a shared response format.
10. Central error middleware maps known failures and hides internals.

## Persistence model

`User` is the ownership root. Assets, documents, notifications, payments, claims, preferences, and activity records are associated with a user. Products also reference a category and optionally a normalized brand.

Soft lifecycle concepts are represented explicitly:

- User status distinguishes active, blocked, and deleted accounts.
- Product lifecycle distinguishes added and archived assets.
- Product warranty status distinguishes no warranty, active, expiring, and expired.
- Subscription status records incomplete, active, past-due, expired, and cancelled states.

## External integration boundaries

Each provider is initialized in `backend/src/config`. Provider-specific behavior remains behind services so controllers do not depend directly on SDK details.

- Firebase Admin verifies identity only on the server.
- Cloudinary receives validated in-memory uploads.
- Gemini receives supported invoice media and returns structured fields.
- Stripe Checkout initiates customer action; signed webhooks confirm durable payment state.
- SMTP sends welcome, payment, and warranty reminder messages.

## Scheduled work

In development, `node-cron` starts with the API server. In production, Vercel Cron calls a protected HTTP endpoint. Both paths invoke the same warranty job so business behavior does not depend on the scheduler.

The reminder workflow evaluates user preferences and warranty dates, updates product status, creates idempotent notifications, records activity, and sends email when enabled.

## Design principles

- The backend is the authority for authorization and plan limits.
- Provider callbacks are verified before state changes.
- User-owned queries include the authenticated user identifier.
- Domain services remain independent from Express response objects.
- External side effects occur after validation and ownership checks.
- List endpoints use consistent pagination, filtering, search, and sorting utilities.
- Reports reuse repositories rather than duplicating domain queries.

## Extension points

New domains should follow the existing module layout and be mounted in `src/routes/index.js`. New frontend features should add a typed API client before coupling endpoint details to a page. New provider integrations should be introduced through configuration and a service boundary, with tests that mock the provider.
