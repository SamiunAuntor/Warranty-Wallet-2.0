# Contributing

## Development workflow

1. Synchronize the default branch.
2. Create a focused feature or fix branch.
3. Install dependencies from committed lockfiles.
4. Configure local environment files.
5. Make one coherent change at a time.
6. Add or update tests and documentation.
7. Run relevant checks.
8. Open a pull request with verification evidence.

## Branch names

Use short descriptive names:

- `feat/claim-evidence`
- `fix/warranty-timezone`
- `docs/api-reference`
- `refactor/payment-service`

## Commit messages

Use a clear type, optional scope, and imperative summary:

```text
feat(claims): add evidence timeline filters
fix(auth): map expired Firebase sessions
test(documents): cover replacement rollback
docs(frontend): explain Firebase configuration
refactor(products): extract warranty calculator
```

Commits should describe their actual contents. Avoid mixing generated dependencies, unrelated formatting, documentation, and behavior changes in the same commit.

## Code organization

Backend domain changes normally touch a module under `backend/src/modules`. Keep HTTP concerns in controllers, business rules in services, and Prisma queries in repositories.

Frontend endpoint details belong in `frontend/src/lib`. Reusable visual behavior belongs in components or hooks rather than duplicated page code.

## Coding expectations

- Prefer existing utilities and patterns.
- Validate all external input.
- Enforce authorization on the server.
- Use asynchronous error handling consistently.
- Avoid provider SDK calls directly from controllers.
- Keep query sorting fields allow-listed.
- Use fixed-decimal database values for money.
- Preserve accessible labels and keyboard behavior.
- Do not expose secrets or raw internal errors.

## Tests

Behavior changes require tests at the narrowest useful layer. A service rule should usually have a service test. Query ownership should have a repository test. Parsing and validation should have pure or middleware tests.

Run backend tests:

```bash
cd backend
npm test
```

Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Documentation

Update documentation when a change affects:

- Setup or prerequisites
- Environment variables
- API routes or request shapes
- Roles and authorization
- Data models or enum values
- Scheduled tasks
- Deployment configuration
- Provider integration behavior

Examples must use fake credentials and non-sensitive sample data.

## Pull requests

A useful pull request includes:

- Problem and intended outcome
- Main implementation decisions
- Screens or endpoints affected
- Database migration impact
- New environment variables
- Tests and manual verification performed
- Known limitations or follow-up work

Keep pull requests small enough to review. Separate broad mechanical formatting from behavior changes.

## Database changes

Use Prisma migrations for schema changes:

```bash
cd backend
npx prisma format
npx prisma migrate dev --name descriptive_change
npx prisma generate
```

Review generated SQL before committing. Consider existing production data, defaults, nullability, indexes, and rollback strategy.

## Dependency changes

Explain why a new dependency is needed. Commit the updated package manifest and lockfile together. Never commit `node_modules`.

## Review checklist

- Scope is coherent and commit messages are accurate.
- User and admin authorization are enforced server-side.
- Failure paths do not leave partial provider or database state.
- Tests cover the changed behavior.
- UI includes loading, empty, success, and error states.
- Environment and deployment changes are documented.
- No secrets, local artifacts, or personal data are included.
