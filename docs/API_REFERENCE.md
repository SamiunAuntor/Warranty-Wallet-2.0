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
| POST | `/users/profile/avatar` | User | Upload or replace the profile avatar |
| GET | `/users/preferences` | User | Read reminder and regional preferences |
| PATCH | `/users/preferences` | User | Update reminder and regional preferences |

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
| GET | `/documents` | User | List all owned documents with filters |
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
| POST | `/claims/:id/timeline` | User | Add a claim timeline event |
| POST | `/claims/:id/documents` | User | Attach existing evidence to a claim |
| DELETE | `/claims/:id/documents/:documentId` | User | Detach evidence from a claim |

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
| POST | `/payments/confirm-checkout` | User | Verify and reconcile a completed Checkout session |
| GET | `/payments` | User | List payment history |
| GET | `/payments/subscription` | User | Read subscription state |
| POST | `/payments/change-plan` | User | Upgrade immediately or schedule a downgrade |
| POST | `/payments/cancel-subscription` | User | Cancel renewal at the end of the period |
| POST | `/payments/resume-subscription` | User | Reverse a scheduled cancellation |
| POST | `/webhooks/stripe` | Stripe | Process signed Stripe events |

The webhook endpoint is mounted before `express.json()` and must continue receiving the raw body.

## Dashboard and reports

Dashboard endpoints return user warranty, category, and summary analytics. Administrator variants return platform, revenue, and product-growth metrics.

Report endpoints support `format=EXCEL` or `format=PDF` and optional date/status filters. Binary responses include an appropriate content type and download filename.

## Administrator endpoints

All routes in this table require a verified user with role `ADMIN`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/dashboard` | Read platform totals and operational summaries |
| GET | `/admin/users` | Search, filter, sort, and paginate users |
| GET | `/admin/users/:id` | Read one user with administrator context |
| PATCH | `/admin/users/:id/block` | Block an active user |
| PATCH | `/admin/users/:id/unblock` | Restore a blocked user |
| DELETE | `/admin/users/:id` | Delete a user according to service policy |
| GET | `/admin/products` | Search and paginate platform assets |
| GET | `/admin/products/:id` | Read an asset with owner context |
| DELETE | `/admin/products/:id` | Remove an asset as an administrator |
| GET | `/admin/payments` | Search and filter platform payments |
| GET | `/admin/payments/:id` | Read one payment record |
| GET | `/admin/categories` | List categories with administrative statistics |
| GET | `/admin/brands` | List brands with administrative statistics |
| GET | `/admin/claims` | Search and filter platform claims |
| PATCH | `/admin/claims/:id/status` | Update a claim status as an administrator |
| POST | `/admin/notifications` | Broadcast a platform notification |

## Report endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/reports/products` | User | Export owned asset data |
| GET | `/reports/warranty` | User | Export owned warranty data |
| GET | `/reports/payments` | User | Export owned payment history |
| GET | `/reports/admin/users` | Admin | Export platform user data |
| GET | `/reports/admin/revenue` | Admin | Export platform revenue data |
| GET | `/reports/admin/categories` | Admin | Export category performance data |

Report query parameters include `format`, optional `status`, and optional `from` and `to` dates. `format` accepts `EXCEL` or `PDF`.

## Cron endpoint

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/cron/warranty` | Operational endpoint | Run the production warranty-reminder job |

The current route does not enforce an application-user token. Deployments should restrict it with a scheduler secret or platform-level protection before production use.

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

## Response envelope

A successful JSON response uses the shared `ApiResponse` shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request completed successfully.",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

`meta` is omitted for non-paginated responses. `data` may be an object, array, primitive value, or `null` depending on the endpoint.

Errors use a false success flag and a safe message:

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication is required."
}
```

## Status-code guidance

| Status | Meaning |
| --- | --- |
| 200 | Successful read or update |
| 201 | Resource created |
| 400 | Invalid request or business-rule rejection |
| 401 | Missing, invalid, or expired authentication |
| 403 | Authenticated user lacks access |
| 404 | Resource does not exist within the permitted scope |
| 409 | Uniqueness or state conflict |
| 413 | Upload exceeds configured limits |
| 429 | Rate limit exceeded |
| 500 | Unexpected server failure |
| 502 | Upstream provider returned an unusable response |
| 503 | Database or provider is temporarily unavailable |
