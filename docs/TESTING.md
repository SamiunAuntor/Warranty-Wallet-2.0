# Testing Guide

## Current approach

The backend uses Node.js's built-in test runner. Tests are stored in `backend/test` and use strict assertions with module-level stubs for database and provider boundaries.

Run all suites with:

```bash
cd backend
npm test
```

Run one suite while developing:

```bash
node --test test/claim.test.js
```

## Test categories

### Pure unit tests

Use pure unit tests for date calculations, storage paths, query normalization, error mapping, templates, and other deterministic helpers. These are fast and should cover boundary values.

### Service tests

Service tests stub repositories and provider clients. They should verify business rules such as ownership, asset limits, checkout transitions, claim evidence rules, and notification behavior.

### Repository tests

Repository tests can replace Prisma methods with recording stubs to assert that ownership predicates, selections, sorting, and pagination are correct.

### Middleware tests

Middleware tests use small request, response, and `next` doubles. Assert both successful normalization and rejection behavior.

## Existing coverage areas

- Firebase, Prisma, and Stripe error mapping
- Zod request normalization
- Product repository selections
- Basic, Plus, and Pro asset limits
- Stripe checkout and subscription transitions
- Document ownership, file verification, and count limits
- Cloudinary storage-folder selection
- Claim ownership, evidence, and status updates
- Gemini model configuration and unavailable-model errors
- Calendar-based warranty reminder behavior
- HTML escaping in reminder email content

## Test structure

Prefer an arrange-act-assert shape:

```js
test("describes observable behavior", async (t) => {
  // Arrange dependencies and input.
  // Act through the public function.
  // Assert the result and important interactions.
});
```

Use `t.mock.method` when temporarily replacing a method. Node restores registered mocks after the test, which prevents state leaking between cases.

## What to assert

Assert behavior that matters to callers:

- Returned domain value
- HTTP status and response shape
- Repository filter contains authenticated ownership
- Provider is not called after validation fails
- Previous storage object is removed only after replacement succeeds
- Duplicate webhook delivery does not duplicate state
- Dates are interpreted consistently across timezones
- User-supplied HTML is escaped in templates

Avoid assertions tied only to internal line-by-line implementation when the public behavior is sufficient.

## External providers

Automated tests must not charge cards, send email, upload files, call Gemini, or depend on a real Firebase project. Mock at the narrowest provider boundary and include realistic success and failure shapes.

Provider tests should cover:

- Successful response mapping
- Authentication or configuration failure
- Timeout/unavailable service
- Malformed provider response
- Retry or duplicate delivery where applicable

## Database testing

Most unit tests mock Prisma. Integration tests that use a real database should use a dedicated test database, apply migrations before the suite, and clean only records created by that suite.

Never point automated tests at production. Guard integration test startup by checking the database name or an explicit test environment flag.

## Frontend testing roadmap

The frontend currently relies on lint, build, and browser verification. Recommended additions are:

1. Vitest for API clients, parsers, and hooks.
2. React Testing Library for forms, guards, and loading/error states.
3. Playwright for registration, asset creation, document upload, and claim workflows.
4. Accessibility checks for public, dashboard, and admin layouts.

Start with pure utilities so the test environment remains simple, then add provider wrappers for Firebase and network calls.

## Manual smoke test

Before release:

1. Open the public landing page.
2. Register and sign in.
3. Create an asset with and without warranty coverage.
4. Upload a receipt and condition image.
5. Review AI-extracted values before saving.
6. Create and update a claim.
7. Change reminder preferences.
8. Verify plan limits and checkout redirect in test mode.
9. Sign in as an administrator and inspect all admin lists.
10. Export one PDF and one Excel report.

## Pull request evidence

Record the commands run and their result. If a check cannot run because credentials or infrastructure are unavailable, state that explicitly and describe the substitute verification performed.
