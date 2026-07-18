# Warranty Wallet Backend

Backend API for Warranty Wallet, a warranty and purchase-document management platform. The service lets users sync Firebase-authenticated accounts, manage products and warranty data, upload invoice/warranty documents, extract invoice details with Gemini, receive warranty notifications, upgrade to Premium through Stripe, and export operational reports.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [Authentication](#authentication)
- [API Overview](#api-overview)
- [Request and Response Conventions](#request-and-response-conventions)
- [File Uploads](#file-uploads)
- [Reports](#reports)
- [Scheduled Jobs](#scheduled-jobs)
- [Data Model Summary](#data-model-summary)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)

## Tech Stack

- Node.js with CommonJS modules
- Express 5
- PostgreSQL
- Prisma ORM
- Firebase Admin SDK for token verification
- Cloudinary for document and image storage
- Multer for memory-based file uploads
- Stripe Checkout and webhooks for Premium subscriptions
- Gemini via `@google/genai` for invoice extraction
- Nodemailer for transactional email
- Zod for request validation
- ExcelJS and PDFKit for report export
- node-cron for scheduled warranty checks

## Features

- Firebase user synchronization and protected profile endpoints
- Role-based access for users and admins
- Product lifecycle management with warranty status tracking
- Category management for products
- Document upload, replacement, deletion, and statistics
- AI-powered invoice extraction from uploaded files
- Notifications and activity logs
- User dashboards and admin analytics
- Stripe Checkout-based Premium upgrade flow
- Stripe webhook handling
- Excel and PDF report exports
- Daily warranty reminder cron job

## Project Structure

```text
backend/
  prisma/
    schema.prisma              # Prisma schema and database models
    migrations/                # Database migration history
  src/
    app.js                     # Express app and route mounting
    server.js                  # Server bootstrap and cron startup
    config/                    # Environment, Prisma, Firebase, Cloudinary, Stripe, mail, Gemini
    constants/                 # Shared HTTP/message constants
    jobs/                      # Cron job registration and warranty job
    middlewares/               # Auth, role, validation, upload, error handling
    modules/
      activity/                # User activity logs
      admin/                   # Admin dashboard/users/products/payments controls
      ai/                      # Gemini invoice extraction
      category/                # Product categories
      dashboard/               # User/admin analytics
      document/                # Product document management
      notification/            # Notifications and broadcasts
      payment/                 # Stripe checkout, webhooks, subscriptions
      product/                 # Warranty product management
      report/                  # Excel/PDF report exports
      user/                    # User sync and profile
    routes/                    # Main API router and raw webhook route
    services/                  # Email and upload services
    shared/report/             # Excel and PDF generators
    templates/                 # HTML email templates
    utils/                     # API response/error helpers and query utilities
  uploads/                     # Local upload-related directory, if needed by the app
  package.json
  prisma.config.ts
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database
- Firebase project with Admin SDK credentials
- Cloudinary account
- Stripe account
- SMTP account for email sending
- Gemini API key

## Environment Variables

Create a `.env` file in the `backend/` directory.

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-encoded-service-account-json

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-signing-secret

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=your-smtp-email
SMTP_PASSWORD=your-smtp-password

GEMINI_API_KEY=your-gemini-api-key
```

Important notes:

- `FIREBASE_SERVICE_ACCOUNT_BASE64` is the Base64 encoding of the complete Firebase Admin service-account JSON file. It must only be stored on the backend.
- `CLIENT_URL` is used by Stripe success and cancel redirects.
- Keep `.env` out of version control.

## Installation

From the backend directory:

```bash
cd backend
npm install
```

## Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Apply migrations to your database:

```bash
npx prisma migrate dev
```

Open Prisma Studio when you need to inspect or edit local data:

```bash
npx prisma studio
```

## Running the Server

Development mode with nodemon:

```bash
npm run dev
```

Production/start mode:

```bash
npm start
```

By default the server listens on `PORT` from `.env`, or `5000` if `PORT` is not set.

Base API URL:

```text
http://localhost:5000/api/v1
```

Webhook base URL:

```text
http://localhost:5000/api/v1/webhooks
```

## Authentication

Protected routes require a Firebase ID token in the `Authorization` header:

```http
Authorization: Bearer <firebase_id_token>
```

The auth middleware:

- verifies the token with Firebase Admin SDK
- looks up the local user by `firebaseUid`
- rejects missing users
- rejects users whose account status is not `ACTIVE`
- attaches the database user to `req.user`

Admin-only routes additionally require `req.user.role` to be `ADMIN`.

## API Overview

All endpoints below are mounted under `/api/v1` unless noted otherwise.

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/users/sync` | Public | Create or sync a user from Firebase data |
| `GET` | `/users/profile` | User | Get the authenticated user's profile |
| `PATCH` | `/users/profile` | User | Update profile fields |

Example `POST /users/sync` body:

```json
{
  "firebaseUid": "firebase-user-id",
  "name": "Ariyan",
  "email": "ariyan@example.com",
  "photo": "https://example.com/photo.png"
}
```

Example `PATCH /users/profile` body:

```json
{
  "name": "Ariyan Rahman",
  "phone": "+8801000000000",
  "photo": "https://example.com/photo.png"
}
```

### Categories

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/categories` | Public | List active categories |
| `POST` | `/categories` | Admin | Create a category |
| `PATCH` | `/categories/:id` | Admin | Update a category |
| `DELETE` | `/categories/:id` | Admin | Delete a category |

Example category body:

```json
{
  "name": "Electronics",
  "icon": "https://example.com/icon.png"
}
```

### Products

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/products/dashboard` | User | Get product dashboard statistics |
| `GET` | `/products` | User | List the authenticated user's products |
| `GET` | `/products/:id` | User | Get one product |
| `POST` | `/products` | User | Create a product |
| `PATCH` | `/products/:id` | User | Update a product |
| `DELETE` | `/products/:id` | User | Delete a product |

Example product body:

```json
{
  "name": "MacBook Pro",
  "brand": "Apple",
  "model": "M3 Pro 14-inch",
  "serialNumber": "ABC123456",
  "categoryId": "cuid_category_id",
  "purchasePrice": 2499.99,
  "purchaseDate": "2026-07-01",
  "warrantyDuration": 12,
  "warrantyType": "MANUFACTURER",
  "sellerName": "Apple Store",
  "sellerPhone": "+1-555-0100",
  "sellerAddress": "New York, USA",
  "productImage": "https://example.com/product.jpg",
  "notes": "Includes AppleCare receipt"
}
```

Supported warranty types:

- `MANUFACTURER`
- `EXTENDED`

Supported warranty statuses:

- `ACTIVE`
- `EXPIRING_SOON`
- `EXPIRED`

### Documents

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/products/:productId/documents` | User | Upload up to 5 documents for a product |
| `GET` | `/products/:productId/documents` | User | List product documents |
| `GET` | `/documents/statistics` | User | Get document statistics |
| `GET` | `/documents/:id` | User | Get one document |
| `PATCH` | `/documents/:id` | User | Replace an uploaded document |
| `DELETE` | `/documents/:id` | User | Delete a document |

Upload documents with `multipart/form-data`.

For `POST /products/:productId/documents`:

- field name: `files`
- max files: `5`
- required body field: `type`

For `PATCH /documents/:id`:

- field name: `file`

Supported document types:

- `INVOICE`
- `WARRANTY_CARD`
- `PRODUCT_IMAGE`
- `RECEIPT`
- `OTHER`

### AI

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/ai/extract-invoice` | User | Extract invoice details from an uploaded invoice file |

Upload with `multipart/form-data`:

- field name: `file`

The AI service asks Gemini to return JSON with:

```json
{
  "productName": "",
  "brand": "",
  "purchaseDate": "",
  "purchasePrice": 0,
  "sellerName": "",
  "invoiceNumber": "",
  "warrantyDuration": null
}
```

### Notifications

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/notifications` | User | List notifications |
| `GET` | `/notifications/unread-count` | User | Get unread notification count |
| `PATCH` | `/notifications/read-all` | User | Mark all notifications as read |
| `PATCH` | `/notifications/:id/read` | User | Mark one notification as read |
| `DELETE` | `/notifications/:id` | User | Delete one notification |
| `POST` | `/notifications/broadcast` | Admin | Broadcast a notification |

### Activities

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/activities` | User | List activity logs |
| `GET` | `/activities/recent` | User | Get recent activities |
| `GET` | `/activities/:id` | User | Get one activity log |

### Payments

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/payments/create-checkout` | User | Create a Stripe Checkout session for Premium |
| `GET` | `/payments` | User | Get payment history |
| `GET` | `/payments/subscription` | User | Get current subscription |

The checkout endpoint returns a Stripe Checkout URL. After payment succeeds, the Stripe webhook upgrades the user to `PREMIUM` and creates or updates the subscription for one year.

### Stripe Webhooks

Webhook routes are mounted before `express.json()` so Stripe can verify the raw request body.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/webhooks/stripe` | Stripe | Handle Stripe checkout events |

Configure this endpoint in the Stripe Dashboard or Stripe CLI.

### Dashboard

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/dashboard` | User | Get user dashboard data |
| `GET` | `/dashboard/warranty` | User | Get warranty analytics |
| `GET` | `/dashboard/categories` | User | Get category analytics |
| `GET` | `/dashboard/admin` | Admin | Get admin dashboard data |
| `GET` | `/dashboard/admin/revenue` | Admin | Get revenue analytics |
| `GET` | `/dashboard/admin/product-growth` | Admin | Get product growth analytics |

### Admin

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | Admin | Get admin overview |
| `GET` | `/admin/users` | Admin | List users |
| `GET` | `/admin/users/:id` | Admin | Get one user |
| `PATCH` | `/admin/users/:id/block` | Admin | Block a user |
| `PATCH` | `/admin/users/:id/unblock` | Admin | Unblock a user |
| `DELETE` | `/admin/users/:id` | Admin | Delete a user |
| `GET` | `/admin/products` | Admin | List products |
| `GET` | `/admin/products/:id` | Admin | Get one product |
| `DELETE` | `/admin/products/:id` | Admin | Delete a product |
| `GET` | `/admin/payments` | Admin | List payments |
| `GET` | `/admin/payments/:id` | Admin | Get one payment |
| `GET` | `/admin/categories` | Admin | List categories with admin context |
| `POST` | `/admin/notifications` | Admin | Broadcast a notification |

Common admin list query parameters:

- `page`
- `limit`
- `search`
- `sortBy`
- `sortOrder`
- filter fields such as `role`, `plan`, `status`, `categoryId`, `userId`, or `paymentMethod`

### Reports

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/reports/products` | User | Export products report |
| `GET` | `/reports/warranty` | User | Export warranty report |
| `GET` | `/reports/payments` | User | Export payment report |
| `GET` | `/reports/admin/users` | Admin | Export users report |
| `GET` | `/reports/admin/revenue` | Admin | Export revenue report |
| `GET` | `/reports/admin/categories` | Admin | Export category report |

Report query parameters:

- `format`: required, either `EXCEL` or `PDF`
- `status`: optional, one of `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`
- `from`: optional date string
- `to`: optional date string

Example:

```text
GET /api/v1/reports/products?format=EXCEL&status=ACTIVE&from=2026-01-01&to=2026-12-31
```

## Request and Response Conventions

### Content Types

- JSON endpoints use `application/json`.
- Upload endpoints use `multipart/form-data`.
- Stripe webhook uses raw `application/json`.

### Success/Error Shape

The project includes shared helpers:

- `utils/ApiResponse.js`
- `utils/ApiError.js`
- `middlewares/error.middleware.js`

Controllers generally return structured JSON responses with a success flag, message, and data payload. Errors are passed through async handlers and centralized error middleware.

### Pagination

List-style endpoints commonly support:

- `page`
- `limit`
- `search`
- `sortBy`
- `sortOrder`

Paginated responses include metadata such as:

```json
{
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5
}
```

## File Uploads

Uploads are handled in memory with Multer and then sent to the configured storage service.

Allowed MIME types:

- `image/jpeg`
- `image/png`
- `image/webp`
- `application/pdf`

Limits:

- max file size: `5 MB`
- max files per multi-upload: `5`

Relevant files:

- `src/middlewares/upload.middleware.js`
- `src/modules/document/document.constant.js`
- `src/services/upload.service.js`
- `src/config/cloudinary.js`

## Reports

Reports can be generated as Excel workbooks or PDF documents.

Excel generation:

- `src/shared/report/excel.generator.js`
- uses `exceljs`

PDF generation:

- `src/shared/report/pdf.generator.js`
- uses `pdfkit`

Report orchestration:

- `src/modules/report/report.service.js`
- `src/modules/report/report.controller.js`
- `src/modules/report/report.route.js`

## Scheduled Jobs

Cron jobs start when the server starts.

Current schedule:

```text
0 0 * * *  # every day at midnight
```

The warranty job:

- finds products expiring within the next 30 days
- changes their status to `EXPIRING_SOON`
- creates warranty reminder notifications
- writes an activity log entry

Relevant files:

- `src/jobs/index.js`
- `src/jobs/cron.js`
- `src/jobs/warranty.job.js`

## Data Model Summary

Main Prisma models:

- `User`: Firebase-linked application user with role, status, and plan
- `Category`: product category
- `Product`: purchased item and warranty metadata
- `Document`: uploaded invoice, warranty card, receipt, product image, or other document
- `Notification`: user notification
- `Subscription`: Premium subscription state
- `Payment`: Stripe payment record
- `ActivityLog`: auditable user/admin activity
- `WebhookEvent`: Stripe webhook event tracking

Important enums:

- `UserRole`: `USER`, `ADMIN`
- `UserStatus`: `ACTIVE`, `BLOCKED`, `DELETED`
- `UserPlan`: `FREE`, `PREMIUM`
- `WarrantyStatus`: `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`
- `WarrantyType`: `MANUFACTURER`, `EXTENDED`
- `PaymentStatus`: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`
- `SubscriptionStatus`: `ACTIVE`, `EXPIRED`, `CANCELLED`

## Development Notes

### Route Mounting

Routes are registered in `src/routes/index.js` and mounted under `/api/v1` from `src/app.js`.

The Stripe webhook route is mounted separately under `/api/v1/webhooks` before JSON parsing. Keep it that way so raw-body webhook verification can work correctly.

### Module Pattern

Most modules follow this structure:

```text
module/
  module.route.js
  module.controller.js
  module.service.js
  module.repository.js
  module.validation.js
  module.constant.js
  index.js
```

Typical responsibility split:

- route: endpoint and middleware registration
- controller: request/response layer
- service: business logic
- repository: database access
- validation: Zod schemas
- constant: module-specific constants/messages

### Adding a New Module

1. Create a directory under `src/modules/<module-name>/`.
2. Add route, controller, service, repository, validation, and constants as needed.
3. Export module pieces through `index.js` if useful.
4. Mount the route in `src/routes/index.js`.
5. Add Prisma models/migrations if the feature needs database changes.
6. Add any required environment variables to `src/config/env.js` and this README.

### Prisma Workflow

After editing `prisma/schema.prisma`:

```bash
npx prisma format
npx prisma migrate dev --name descriptive_migration_name
npx prisma generate
```

## Troubleshooting

### Firebase service-account errors

Make sure `FIREBASE_SERVICE_ACCOUNT_BASE64` contains the Base64 encoding of the complete JSON file, without quotes or line breaks:

```env
FIREBASE_SERVICE_ACCOUNT_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Ii...snip
```

### Prisma cannot connect to the database

Check:

- `DATABASE_URL`
- PostgreSQL is running
- database name exists
- credentials are correct
- network/firewall access if using a remote database

### Stripe checkout works but Premium is not activated

Check:

- webhook endpoint is configured as `/api/v1/webhooks/stripe`
- the backend is reachable by Stripe
- webhook events are arriving
- `STRIPE_SECRET_KEY` is valid
- the payment record exists for the Stripe session

### File upload fails

Check:

- field name is `file` for single upload routes
- field name is `files` for multi-upload document route
- MIME type is allowed
- file size is under `5 MB`
- Cloudinary credentials are valid

### Gemini returns invalid JSON

The AI service expects Gemini to return raw JSON only. If this error appears, inspect the model response and adjust the prompt or add response cleanup logic before `JSON.parse`.

## Scripts

```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```

## License

This backend currently uses the package license declared in `package.json`: `ISC`.
