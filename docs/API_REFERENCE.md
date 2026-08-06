# API Reference

## Base URL

Local development uses:

```text
http://localhost:5000/api/v1
```

Production clients should set the complete base URL through `NEXT_PUBLIC_API_URL`.

## Authentication

Protected endpoints require a Firebase ID token:

```http
Authorization: Bearer <firebase-id-token>
```

Administrator endpoints additionally require the synchronized user to have the `ADMIN` role.

## Health

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Runtime health and timestamp |

## Users

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/users/sync` | Public identity sync | Create or refresh an application user |
| GET | `/users/profile` | User | Read the current profile |
| PATCH | `/users/profile` | User | Update supported profile fields |

## Categories and brands

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/categories` | Public | List active categories |
| POST | `/categories` | Admin | Create a category |
| PATCH | `/categories/:id` | Admin | Update a category |
| DELETE | `/categories/:id` | Admin | Deactivate or delete a category |
| GET | `/brands` | Public | List active brands |
| POST | `/brands` | Admin | Create a brand |
| PATCH | `/brands/:id` | Admin | Update a brand |
| DELETE | `/brands/:id` | Admin | Deactivate or delete a brand |

## Assets

The source code uses `Product` as the persistence name and presents the domain as assets in the UI.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/products` | User | List owned assets |
| GET | `/products/dashboard` | User | Read asset summary statistics |
| GET | `/products/:id` | User | Read one owned asset |
| POST | `/products` | User | Create an asset |
| PATCH | `/products/:id` | User | Update an asset |
| DELETE | `/products/:id` | User | Remove or archive an asset |

Asset input includes name, category, brand, model, serial number, purchase price, purchase date, warranty selection, seller details, product image, and notes. The service calculates warranty dates and enforces the current plan's asset limit.

## Documents

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/products/:productId/documents` | User | Upload asset documents |
| GET | `/products/:productId/documents` | User | List asset documents |
| GET | `/documents/statistics` | User | Read document totals |
| GET | `/documents/:id` | User | Read one document |
| PATCH | `/documents/:id` | User | Replace a document |
| DELETE | `/documents/:id` | User | Delete a document |

Uploads use `multipart/form-data`. The API accepts JPEG, PNG, WebP, and PDF files up to 5 MB. Document ownership is checked against the authenticated user and selected asset.

## AI extraction

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/ai/extract-invoice` | User | Extract structured invoice fields |

The single upload field is named `file`. Successful extraction can include product name, brand, purchase date, price, seller, invoice number, and warranty duration. Users must review extracted values before saving an asset.

## Claims

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/claims` | User | List owned claims |
| GET | `/claims/:id` | User | Read one claim and timeline |
| POST | `/claims` | User | Create a claim |
| PATCH | `/claims/:id` | User | Update claim details or status |
| DELETE | `/claims/:id` | User | Remove a claim when permitted |

Claim evidence must belong to the same user and asset. Status values are `SUBMITTED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, and `CANCELLED`.

## Notifications and activity

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/notifications` | User | List notifications |
| GET | `/notifications/unread-count` | User | Read unread total |
| PATCH | `/notifications/read-all` | User | Mark all as read |
| PATCH | `/notifications/:id/read` | User | Mark one as read |
| DELETE | `/notifications/:id` | User | Delete one notification |
| POST | `/notifications/broadcast` | Admin | Broadcast a notification |
| GET | `/activities` | User | List activity records |
| GET | `/activities/recent` | User | Read recent activity |
| GET | `/activities/:id` | User | Read one activity record |

## Payments

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/payments/plans` | Public | Read plan prices and limits |
| POST | `/payments/create-checkout` | User | Start Plus or Pro checkout |
| GET | `/payments` | User | List payment history |
| GET | `/payments/subscription` | User | Read subscription state |
| POST | `/webhooks/stripe` | Stripe | Process signed Stripe events |

The webhook endpoint is mounted before `express.json()` and must continue receiving the raw body.

## Dashboard and reports

Dashboard endpoints return user warranty, category, and summary analytics. Administrator variants return platform, revenue, and product-growth metrics.

Report endpoints support `format=EXCEL` or `format=PDF` and optional date/status filters. Binary responses include an appropriate content type and download filename.

## List query parameters

Common parameters are:

- `page`: positive integer, default determined by the endpoint.
- `limit`: bounded page size.
- `search`: normalized free-text search.
- `sortBy`: allow-listed field.
- `sortOrder`: `asc` or `desc`.
- Domain filters such as `status`, `plan`, `role`, `categoryId`, or `userId`.

## Errors

Errors pass through centralized middleware. Expected validation, authentication, authorization, provider, and database failures are converted into concise responses. Raw SQL, credentials, provider payloads, and stack traces must not be exposed in production.
