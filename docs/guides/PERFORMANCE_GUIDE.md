# Performance Guide

## Measurement first

Optimize measured bottlenecks. Record route, percentile latency, request volume, result size, database time, provider time, memory, and deployment conditions before changing behavior.

## Database queries

Ownership and status filters should use indexed columns. Existing indexes cover common user, status, expiry, creation, and relation lookups.

Review query plans when adding compound filters. An index that helps one condition may not help a combined search and sort.

## Pagination

All potentially large lists require bounded page sizes. Count queries provide useful UI metadata but can become expensive; measure before introducing alternative pagination.

Cursor pagination may be appropriate for high-volume activity or notifications. Use a stable order and unique tie-breaker.

## Composite dashboards

Independent aggregates run concurrently to reduce total latency. Confirm the database connection pool can sustain that concurrency under load.

Avoid unbounded relation includes. Select only fields needed by the dashboard.

## Search

Case-insensitive substring search is convenient but may scan large tables. At scale, consider PostgreSQL trigram indexes or a dedicated search design after measuring real patterns.

Keep user ownership and active-state filters in every search plan.

## Uploads

Enforce size and count limits before expensive provider work. Avoid retaining multiple full-size buffers longer than necessary.

For large files, streaming storage may reduce memory, but signature validation and provider behavior must remain correct.

## Reports

PDF and workbook generation can be memory intensive. Bound report ranges, avoid unnecessary relations, and consider background generation for large datasets.

Streaming begins a response commitment; load and validate required data first.

## External providers

Set timeouts and bounded retries. Retry only transient failures. Record provider duration separately from application and database duration.

Do not allow one slow optional provider, such as AI extraction or email, to block access to already persisted user data.

## Frontend requests

Use stable query keys, deduplicate fetches through the query library, and invalidate only related caches. Avoid refetch loops caused by unstable objects or effects.

Lazy-load heavy administrative views when appropriate, but preserve clear loading and error states.

## Payload size

Select response fields intentionally. Paginate relations rather than embedding entire histories. Binary data belongs in storage responses, not JSON base64 fields.

Compression helps text responses but does not replace payload discipline.

## Connection management

Reuse the configured Prisma client. Match PostgreSQL connection limits to serverless or process concurrency. Investigate pool timeouts separately from query execution time.

## Caching

Cache only when invalidation and ownership keys are understood. Never share user-specific results through an incomplete cache key.

Catalog and plan definitions are better cache candidates than dashboards or notification counts.

## Performance regression tests

Functional tests do not prove production capacity. Add representative load tests for hot routes and record baselines. Keep load tests out of ordinary unit runs.

## Review checklist

- Query is bounded.
- Ownership is indexed.
- Sort is allowlisted and supported.
- Relations are selected narrowly.
- Provider calls have timeouts.
- Retry policy is bounded.
- Payload size is reasonable.
- Cache key includes authorization scope.
- Metrics can distinguish database and provider time.
