# Asset Lifecycle Guide

## Domain definition

An asset is represented by the `Product` model. It belongs to exactly one user and category, may reference a catalog brand, and can own documents and warranty claims.

## Lifecycle stages

1. The user selects catalog metadata.
2. The user submits purchase and warranty information.
3. The backend calculates expiry and warranty status.
4. The asset appears in lists, dashboard totals, and reminder workflows.
5. The user may update mutable details or archive the asset.
6. Deletion is soft so audit and related-domain behavior remain controlled.

## API surface

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/api/v1/products` | List owned, non-deleted assets. |
| `POST` | `/api/v1/products` | Create an asset within plan limits. |
| `GET` | `/api/v1/products/:id` | Load owned asset details. |
| `PATCH` | `/api/v1/products/:id` | Update allowed fields. |
| `DELETE` | `/api/v1/products/:id` | Soft delete an owned asset. |
| `GET` | `/api/v1/products/dashboard` | Return asset-oriented summary data. |

## Ownership invariant

Every detail, update, delete, document, and claim operation must scope the asset by both asset ID and authenticated user ID. Fetching globally and checking later increases the risk of inconsistent authorization.

Administrator asset routes are separate and explicitly role protected. Administrator access must not weaken ordinary product repository scoping.

## Plan limits

Asset creation enforces the active plan limit:

| Plan | Asset limit |
| --- | ---: |
| Basic | 5 |
| Plus | 100 |
| Pro | 500 |

The backend is authoritative. Frontend counters are advisory and can become stale across tabs or devices.

## Warranty calculation

Warranty data includes presence, duration, type, expiry date, and derived status. Calendar calculations should use calendar dates rather than elapsed-hour arithmetic to avoid daylight-saving boundary errors.

Expected status meanings:

- `NO_WARRANTY`: the asset has no applicable warranty.
- `ACTIVE`: expiry is outside the expiring-soon window.
- `EXPIRING_SOON`: expiry is near according to project policy.
- `EXPIRED`: expiry is earlier than the current evaluation date.

## Soft deletion

Deletion sets `isDeleted` rather than immediately removing the row. All user and administrator list queries must explicitly exclude deleted assets unless a recovery feature intentionally requests them.

Soft deletion should produce an activity record. Related documents and claims remain protected by ownership and lifecycle rules.

## Query behavior

Lists support bounded pagination. Search and filters must be applied before counting so `meta.total` matches the visible result set. Sort fields should come from an allowlist to prevent invalid ORM field selection.

## Client behavior

Use typed asset contracts for list and detail responses. After mutations, invalidate asset lists, dashboard summaries, warranty analytics, category analytics, and any open asset detail query.

## Error cases

- Invalid category: `NOT_FOUND` or validation failure according to the boundary.
- Plan capacity reached: `PAYMENT_REQUIRED` or the documented domain error.
- Duplicate serial number when constrained: `CONFLICT`.
- Foreign asset: `NOT_FOUND` or `FORBIDDEN` consistently across the domain.
- Invalid dates or duration: `VALIDATION_FAILED` with field details.

## Test checklist

Verify creation, defaults, computed expiry, each warranty status, plan boundaries, pagination, sorting, search, update, ownership denial, soft deletion, deleted-row omission, document counts, claim counts, and dashboard aggregation.

## Maintenance rules

When adding an asset field, update Prisma, validation, repository selection, service mapping, frontend contract, forms, detail views, OpenAPI schemas, report columns, seed fixtures, and integration assertions together.
