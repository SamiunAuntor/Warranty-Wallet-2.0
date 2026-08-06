# Asset Lifecycle

An asset is a user-owned `Product` connected to a category, optional normalized brand, documents, and claims.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET/POST` | `/api/v1/products` | List or create owned assets. |
| `GET/PATCH/DELETE` | `/api/v1/products/:id` | Read, update, or soft-delete one asset. |
| `GET` | `/api/v1/products/dashboard` | Return asset summary data. |

Every detail and mutation query must scope by authenticated user ID. Administrator routes are separate and role protected.

## Limits and warranty

Basic, Plus, and Pro allow 5, 100, and 500 assets. The backend enforces limits even when the UI displays remaining capacity.

Warranty status is `NO_WARRANTY`, `ACTIVE`, `EXPIRING_SOON`, or `EXPIRED`. Use calendar-date calculations to avoid daylight-saving errors. Lists and dashboards exclude `isDeleted` assets.

## Query contract

Lists use bounded pagination. Search, filters, and count queries must match, and sort fields come from an allowlist. After mutations, invalidate asset lists, dashboard, warranty, category, and detail queries.

## Verification

Test creation, plan boundaries, expiry calculation, each status, pagination, sorting, search, ownership denial, updates, soft deletion, deleted-row omission, and document/claim counts.

New fields require Prisma, validation, serializers, frontend contracts, forms, OpenAPI, reports, fixtures, and tests to change together.
