# Local Development Workflow

## Prerequisites

Use the Node.js version declared by each package, PostgreSQL, npm, and Git. Provider features require test credentials; most unit tests use placeholders and do not require network access.

## Repository layout

- `frontend` contains Next.js pages, components, contexts, and typed API clients.
- `backend` contains Express routes, modules, Prisma, middleware, jobs, and tests.
- `docs` contains project, API, workflow, and operational documentation.

## Initial setup

1. Clone the repository.
2. Install backend dependencies with `npm ci`.
3. Install frontend dependencies with `npm ci`.
4. Copy environment examples to local ignored files.
5. Configure a development PostgreSQL database.
6. Generate Prisma Client.
7. Synchronize or migrate the local schema according to repository policy.
8. Start backend and frontend in separate terminals.

## Environment discipline

Use separate development and integration databases. Never point `TEST_DATABASE_URL` at development or production. The integration harness additionally refuses database names without `test`.

Keep Firebase, Stripe, Cloudinary, Gemini, and SMTP credentials out of Git. Use provider test modes wherever available.

## Daily startup

- Pull reviewed changes.
- Re-run `npm ci` when lockfiles changed.
- Regenerate Prisma Client when schema changed.
- Review new environment variables.
- Start backend and confirm health.
- Start frontend and confirm API connectivity.

## Backend checks

Run focused Node test files during development and `npm test` before handoff. Unit tests require placeholder configuration for eager modules. Database integration suites require the explicit isolated URL.

## Frontend checks

Run TypeScript compilation, ESLint, and the production build when changing configuration or routing. Compile consumers after shared contract changes.

## Adding an endpoint

1. Define validation.
2. Implement repository access.
3. Implement service invariants.
4. Add controller envelope behavior.
5. Register route middleware in the correct order.
6. Add stable error codes where needed.
7. Update OpenAPI.
8. Add unit and integration tests.
9. Add or update a typed frontend client.
10. Update domain documentation.

## Adding a database field

Review nullability, default, existing-row compatibility, indexes, relations, serialization, validation, API contracts, frontend display, reports, seeds, and cleanup.

## Debugging ports

Confirm frontend and backend ports, API URL, and allowed origin. Integration tests use ephemeral ports and should not conflict with development servers.

## Git hygiene

Keep commits focused and messages descriptive. Do not commit `.env`, provider credentials, build output, dependency directories, editor state, test databases, or user files.

Review `git diff --check`, tests, compilation, and `git status` before committing.

## Provider-free development

Core list and database workflows should remain usable when optional AI or email providers are unavailable. Use mocks for unit tests and explicit sandbox suites for live provider verification.

## Troubleshooting order

Check environment validation, health endpoint, browser network response, stable error code, backend log, database connectivity, and then provider status. Change one variable at a time.

## Handoff checklist

Document what changed, why, tests run, tests not run, environment changes, schema impact, security considerations, operational impact, and suggested next step.
