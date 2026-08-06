# Warranty Wallet 2.0

Warranty Wallet is a full-stack warranty and purchase-document management platform. It gives people one place to record valuable purchases, preserve receipts and warranty evidence, receive expiration reminders, and prepare claims when a product needs service.

The repository contains a Next.js web application and an Express API. Authentication is handled by Firebase, application data is stored in PostgreSQL through Prisma, documents are stored in Cloudinary, invoice details can be extracted with Gemini, and paid plans use Stripe Checkout.

## Core capabilities

- Create and manage a digital inventory of purchased assets.
- Track manufacturer and extended warranty periods.
- Upload invoices, receipts, warranty cards, and condition photos.
- Extract structured purchase data from documents with Gemini.
- Receive configurable warranty reminders.
- Maintain claim records, supporting evidence, and status history.
- View user and administrator dashboards.
- Subscribe to Plus or Pro plans through Stripe.
- Export operational reports in PDF and Excel formats.
- Manage users, categories, brands, assets, payments, and broadcasts as an administrator.

## Repository layout

```text
Warranty-Wallet-2.0/
├── frontend/                Next.js web application
│   ├── public/              Static images and icons
│   ├── src/app/             App Router pages and layouts
│   ├── src/components/      Shared UI and feature components
│   ├── src/contexts/        Authentication and preference state
│   ├── src/hooks/           Reusable React hooks
│   └── src/lib/             API clients and browser utilities
├── backend/                 Express API
│   ├── prisma/              Prisma schema and migrations
│   ├── src/config/          External service configuration
│   ├── src/jobs/            Scheduled warranty reminders
│   ├── src/middlewares/     Authentication, validation, and errors
│   ├── src/modules/         Domain modules
│   ├── src/routes/          API, webhook, and cron routes
│   ├── src/services/        Upload and email services
│   └── test/                Node test-runner suites
└── VERCEL_DEPLOYMENT.md     Production deployment guide
```

## Technology stack

### Frontend

- Next.js 16 with the App Router and Turbopack
- React 19 and TypeScript
- Tailwind CSS 4
- TanStack Query
- Firebase Authentication
- SweetAlert2 and Lucide icons

### Backend

- Node.js 24 and Express 5
- PostgreSQL and Prisma 7
- Firebase Admin SDK
- Cloudinary and Multer
- Stripe Checkout and webhooks
- Google Gemini
- Nodemailer and node-cron
- ExcelJS and PDFKit
- Zod validation

## Prerequisites

- Node.js 24.x
- npm 11 or a compatible npm release
- PostgreSQL database
- Firebase project with web and Admin SDK credentials
- Cloudinary account
- Stripe account
- Gemini API key
- SMTP service for transactional email

The public landing page can render without the backend services. Authentication, dashboards, uploads, payments, and AI extraction require their corresponding credentials.

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/SamiunAuntor/Warranty-Wallet-2.0.git
cd Warranty-Wallet-2.0
```

### 2. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill every required value in `backend/.env`. At minimum, a working API requires a PostgreSQL connection and valid Firebase Admin credentials. Individual integrations also need their own keys.

Generate the Prisma client and apply database migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

The API listens on `http://localhost:5000` by default. Its health endpoint is available at `http://localhost:5000/api/v1/health`.

### 3. Configure the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Add the public Firebase web configuration to `frontend/.env.local`, then start the application:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment overview

The frontend expects:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

The backend expects configuration for:

- Runtime and allowed frontend origins
- PostgreSQL
- Firebase Admin
- Cloudinary
- Stripe
- SMTP
- Gemini

Never commit `.env`, `.env.local`, service-account JSON, private keys, webhook secrets, or database credentials.

## Development commands

### Frontend

```bash
cd frontend
npm run dev       # start the development server
npm run build     # create a production build
npm run start     # serve the production build
npm run lint      # run ESLint
```

### Backend

```bash
cd backend
npm run dev       # generate Prisma Client and start with nodemon
npm start         # start with Node.js
npm test          # run all Node test suites
```

## Application flow

1. A visitor registers or signs in through Firebase Authentication.
2. The frontend sends the Firebase identity to the API for local user synchronization.
3. The API verifies protected requests and loads the matching application user.
4. The user records an asset manually or starts from an uploaded purchase document.
5. The API validates ownership, plan limits, files, and domain data before persistence.
6. Scheduled jobs evaluate warranties and create reminder notifications.
7. Claims associate an asset with evidence and a chronological status history.
8. Stripe webhooks update paid plans after verified checkout events.

## API conventions

The API is mounted under `/api/v1`. Protected routes expect a Firebase ID token:

```http
Authorization: Bearer <firebase-id-token>
```

JSON endpoints use `application/json`. Upload endpoints use `multipart/form-data`. Stripe webhooks use the raw request body so signatures can be verified before JSON parsing.

List endpoints generally accept `page`, `limit`, `search`, `sortBy`, and `sortOrder`. Responses use shared success and error helpers to maintain a consistent shape.

## Testing

Backend tests use the built-in Node.js test runner. The suites cover validation, repositories, product limits, document rules, claim behavior, payments, warranty reminders, AI failures, and external-service error mapping.

```bash
cd backend
npm test
```

Tests isolate modules and mock external boundaries where appropriate. They should not require real payment, email, AI, or file-storage operations.

## Deployment

Both applications contain Vercel configuration. Deploy the backend first, configure its secrets, and verify `/api/v1/health`. Then deploy the frontend with `NEXT_PUBLIC_API_URL` pointing to the production API.

Production warranty reminders are triggered through the protected cron endpoint rather than an in-process scheduler. Stripe must be configured to deliver signed events to the backend webhook route.

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for the complete deployment checklist.

## Security notes

- Firebase ID tokens are verified on protected API routes.
- User-owned resources are filtered by the authenticated database user.
- Administrator routes require the `ADMIN` role.
- Uploaded content is checked by MIME type, signature, count, and size.
- Stripe events are verified using the raw request body and webhook secret.
- API responses are processed through centralized error handling.
- Helmet, CORS, compression, and rate limiting are enabled globally.

## Contribution workflow

1. Create a focused branch.
2. Keep each commit limited to one coherent change.
3. Add or update tests for behavior changes.
4. Run backend tests and frontend lint/build checks.
5. Document new environment variables and endpoints.
6. Open a pull request describing behavior, verification, and deployment impact.

Avoid committing generated dependency directories, build output, local uploads, secrets, editor state, or temporary reports.

## License

The backend currently declares the ISC license. Add a root `LICENSE` file before distributing the complete project under a formal open-source license.
