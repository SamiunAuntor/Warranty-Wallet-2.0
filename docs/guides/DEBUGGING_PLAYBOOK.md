# Debugging Playbook

## Start with the symptom

Record the exact action, route, status, error code, timestamp, account role, environment, and recent change. Reproduce with the smallest safe input before changing code.

## Request path

Trace failures in order:

1. Browser event and form state.
2. Domain API client.
3. Shared typed transport.
4. Network request and response.
5. CORS and rate limiting.
6. Authentication and role middleware.
7. Validation middleware.
8. Controller.
9. Service invariants.
10. Repository and Prisma.
11. External provider.

Do not jump directly to the database when the request never passed validation.

## Frontend diagnosis

- Confirm the correct API base URL.
- Inspect request method, path, headers, and body.
- Confirm a fresh bearer token is present.
- Check whether FormData retained its browser-generated boundary.
- Inspect `ApiClientError` status, code, and details.
- Verify query keys and invalidation.
- Distinguish loading, empty, and error states.
- Run TypeScript before assuming a runtime problem.

## Authentication diagnosis

Separate missing token, invalid provider session, unknown local user, blocked status, and insufficient role. Each has a different recovery action.

Never paste a real token into issues or shared logs.

## Validation diagnosis

Read `details` paths and compare them with route params, query strings, and JSON. Remember that query values arrive as strings before coercion.

For uploads, inspect file count, reported MIME type, byte signature, file size, and field name.

## Database diagnosis

- Confirm environment and database name.
- Check Prisma error code.
- Inspect unique constraints and foreign keys.
- Compare list filters with count filters.
- Check soft-delete predicates.
- Check ownership predicates.
- Review transaction boundaries.
- Look for connection pool exhaustion and locks.

Use read-only queries first.

## Provider diagnosis

For Stripe, compare mode, session ownership, payment state, and webhook signature. For Firebase, compare service account, project, token audience, and UID. For Cloudinary, compare resource type, public ID, folder, and quota. For Gemini, compare model, key, supported input, quota, and response parsing. For SMTP, compare sender policy, credentials, acceptance, and bounce information.

## Binary response diagnosis

Check status before opening the file. Verify content type, disposition, size, and magic bytes. A JSON error saved with `.pdf` is not a PDF-generation problem.

## Intermittent failures

Look for shared fixtures, fixed ports, current-time boundaries, provider retries, race conditions, missing awaits, and cache state. Replace sleeps with observable completion conditions.

## Fix verification

Add a regression test that fails before the fix. Run the focused test, related suite, full backend tests, TypeScript, lint, build where relevant, and a complete user workflow.

## Handoff record

Document root cause, evidence, changed invariant, test coverage, operational impact, deployment requirement, rollback, and remaining uncertainty.
