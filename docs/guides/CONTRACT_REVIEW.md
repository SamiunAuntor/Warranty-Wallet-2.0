# API Contract Review Playbook

## Purpose

Use this playbook whenever an endpoint, envelope, status, enum, query, or domain field changes. It prevents backend behavior, OpenAPI, frontend types, and tests from drifting apart.

## Identify the change

Classify the change as additive, behavioral, restrictive, or breaking. Additive nullable fields are usually safer than renames, removals, type changes, or new required input.

Document affected consumers: public frontend pages, dashboard pages, admin pages, scheduled jobs, webhooks, tests, reports, and external clients.

## Request review

- Method and route remain intentional.
- Authentication requirement is explicit.
- Role requirement is explicit.
- Path parameters use consistent names and validation.
- Query defaults and maximums are documented.
- Search behavior and case sensitivity are defined.
- Sort fields are allowlisted.
- Request body rejects unknown dangerous fields.
- Multipart fields and file limits are documented.
- Date, timezone, money, and enum formats are unambiguous.

## Response review

- HTTP status matches the operation.
- Success response uses the standard envelope.
- Data shape is stable for empty and non-empty results.
- Paginated responses include complete metadata.
- Dates serialize as ISO strings.
- Decimal precision is preserved.
- Nullable fields are marked nullable.
- Sensitive fields are omitted.
- Binary routes document content type and disposition.

## Error review

- Validation failures return `VALIDATION_FAILED` and details.
- Authentication failures use stable authentication codes.
- Authorization failures do not leak protected content.
- Missing resources use a consistent domain policy.
- Conflicts identify retry or correction behavior.
- Provider failures hide secrets and raw payloads.
- Unknown failures use `INTERNAL_ERROR`.
- Frontend fallbacks cover status codes without explicit payloads.

## Ownership review

Trace every repository query from authenticated user to database filter. Include nested resources such as asset documents and claim evidence.

Confirm administrator routes are distinct and role protected. Verify shared service methods do not accidentally bypass route-level assumptions.

## OpenAPI review

- Path exists in the root document.
- Operation ID is unique.
- Tags are appropriate.
- Parameters reference canonical components where possible.
- Request schema matches validation.
- Response schema matches controller output.
- Error responses reference shared components.
- Examples use fictional data.
- Security requirements match middleware.
- The specification validates successfully.

## Frontend review

- Shared contracts contain new fields or enums.
- Domain client uses the shared typed transport.
- Existing public return shape remains compatible or consumers change together.
- Query construction encodes values safely.
- Mutation cache invalidation covers dependent views.
- Error-code behavior is represented in UI.
- Loading, empty, success, and failure states remain reachable.

## Test review

- Unit tests cover service branches.
- Integration tests cover actual HTTP shape.
- Negative authentication and ownership cases exist.
- Validation details are asserted where important.
- Pagination metadata uses filtered counts.
- Database state is verified after mutations.
- Provider boundaries are mocked or explicitly opt-in.
- Regression fixtures capture the reported bug.

## Compatibility decision

For a breaking change, choose versioning, a compatibility window, coordinated deployment, or explicit consumer migration. Do not rely on frontend and backend deploying simultaneously unless the platform guarantees it.

## Completion evidence

Link implementation, OpenAPI diff, frontend contract diff, unit test, integration test, and any migration. Record intentional deviations and a removal date for temporary compatibility code.
