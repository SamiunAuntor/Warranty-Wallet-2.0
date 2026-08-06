# Dashboard and Analytics Guide

## Purpose

Dashboards project transactional data into summaries for users and administrators. They are read models, not alternate sources of truth.

## User dashboard

The user dashboard combines:

- total, active, expiring, and expired assets;
- total purchase value;
- document count, recent documents, and extraction work;
- open claim count;
- warranty health score and timeline;
- notification totals and recent items;
- recent activity;
- category distribution;
- current plan and paid-plan indicator.

Every repository query must scope by the authenticated user.

## User analytics routes

| Route | Result |
| --- | --- |
| `GET /api/v1/dashboard` | Composite dashboard read model. |
| `GET /api/v1/dashboard/warranty` | Upcoming warranty timeline. |
| `GET /api/v1/dashboard/categories` | Owned-asset category distribution. |

## Warranty health

The current score weights active assets fully, expiring-soon assets partially, and expired assets at zero. A user with no assets receives a neutral healthy score rather than a division-by-zero result.

If the formula changes, document it and add fixed fixture tests. Users may interpret this value as advice, so unexplained changes reduce trust.

## Administrator dashboard

Administrator analytics include platform user totals, paid-user totals, asset totals, successful-payment totals, revenue, recent payments, revenue history, and product growth.

Administrator routes require server-side role checks even when the admin layout also has a client guard.

## Time-series behavior

Repository group-by results currently preserve database timestamps. Consumers should not assume exactly twelve buckets unless the service explicitly normalizes missing months.

Date boundaries use a half-open range: start of the selected year inclusive and start of the following year exclusive.

## Money values

Prisma decimal values may serialize as strings or decimal-compatible objects. Frontend contracts therefore tolerate string or number where appropriate. Avoid floating-point summation for authoritative billing calculations.

## Cache behavior

Dashboard queries become stale after asset, document, claim, notification, payment, subscription, or preference mutations. Frontend mutation handlers should invalidate the relevant dashboard keys.

## Performance

Composite dashboards run multiple independent aggregates concurrently. Add indexes for ownership, status, expiry, and creation timestamps before increasing query complexity.

For high volume, consider materialized read models only after measuring. Any cache must preserve ownership boundaries in its key.

## Empty states

APIs should return zero counts and empty arrays rather than missing properties. Stable shapes simplify typed clients and loading-state transitions.

## Test checklist

Cover empty users, mixed warranty statuses, deleted assets, purchase totals, recent limits, open claims, unread notifications, category counts, plan flags, administrator denial, administrator totals, and selected-year boundaries.

## Troubleshooting

When a count is wrong, compare the dashboard repository filter with the corresponding list endpoint. Common causes are missing `isDeleted: false`, different status sets, timezone boundaries, or ownership omissions.

## Maintenance rules

New dashboard fields require repository queries, service mapping, frontend types, loading skeleton review, empty-state behavior, OpenAPI changes, and integration fixtures that demonstrate non-zero and zero results.
