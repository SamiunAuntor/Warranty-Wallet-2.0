# Frontend API Contracts

`api-contracts.ts` defines shared envelopes, domain types, pagination, and errors. `api-client.ts` centralizes URL construction, bearer headers, JSON parsing, fallback codes, and typed failures. Components should use domain clients instead of calling `fetch` directly.

Use `apiRequest<T>` for response data and `apiRequestEnvelope<T, M>` when metadata is required. `ApiClientError` preserves status, stable code, message, and validation details.

The shared client adds JSON content type only for compatible bodies. Pass `FormData` directly so the browser supplies its multipart boundary.

Domain functions accept tokens rather than importing Firebase state. Dates are ISO strings; decimal values may be strings or numbers to preserve database precision.

## Cache invalidation

- Asset changes invalidate assets, dashboard, warranty, and categories.
- Claim changes invalidate claims, asset detail, and open-claim counts.
- Notification changes invalidate list and unread count.
- Billing changes invalidate payments, subscription, and plan-capacity UI.
- Preference changes invalidate profile and formatted dashboard data.

Build queries with `URLSearchParams`, omit undefined values, and use server pagination metadata. UI recovery should branch on error codes rather than message text.

When migrating a client, remove its local URL and envelope, preserve its public return shape, use the paginated helper where needed, compile consumers, and test failures.

Backend contract changes require shared types, domain clients, OpenAPI, integration assertions, and a compatibility decision for deployed older frontends.
