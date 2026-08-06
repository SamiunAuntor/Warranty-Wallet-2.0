# PostgreSQL Integration Testing

The integration suites exercise real Express routes, middleware, Prisma queries, transactions, ownership rules, and PostgreSQL constraints. They do not replace unit tests; they verify that independently tested layers work together through HTTP.

## Covered workflows

### Health and authentication

- API health response
- Missing identity rejection
- Unknown synchronized identity rejection
- Blocked-account rejection
- Centralized route-not-found errors

### User and preferences

- Firebase identity synchronization
- Authenticated profile reads
- Profile persistence
- Default preference creation
- Reminder and regional preference normalization
- Typed validation failures

### Assets

- Public category and brand catalogs
- Authenticated asset creation
- Brand normalization
- Purchase-value coercion
- Warranty expiry and status derivation
- Search and pagination metadata
- Owned asset updates
- Cross-user ownership rejection
- Soft deletion

### Claims

- Claim creation for an owned asset
- Existing-document evidence attachment
- Initial timeline creation
- Claim detail loading
- Narrative timeline events
- Status transitions
- Cross-user ownership rejection
- Evidence detachment without document deletion

## Safety model

Integration tests can delete records that they create. The harness refuses to start unless:

1. `TEST_DATABASE_URL` is present.
2. The URL uses a PostgreSQL protocol.
3. The database name contains the word `test`.

Use a dedicated disposable database. Never point `TEST_DATABASE_URL` at development, staging, or production data.

Generated users, categories, brands, assets, documents, claims, preferences, notifications, and activity records are connected through cascading relationships. Cleanup deletes the suite's tracked users first, then independent catalog records.

## Test authentication

Real Firebase tokens are unsuitable for deterministic integration tests. The middleware accepts `x-test-firebase-uid` only when both conditions are true:

```text
NODE_ENV=test
ENABLE_TEST_AUTH=true
```

The test server also supports `x-test-email` and `x-test-name` during the user-synchronization workflow. Outside that exact test configuration, the middleware follows the ordinary Firebase bearer-token path.

Do not enable test authentication in a deployed environment.

## Local database setup

Create a dedicated PostgreSQL database:

```sql
CREATE DATABASE warranty_wallet_test;
```

Copy the test environment template:

```bash
cd backend
cp .env.test.example .env.test
```

Export the values into the current shell. The application uses `TEST_DATABASE_URL` for the harness and `DATABASE_URL` for Prisma commands.

Bash:

```bash
set -a
source .env.test
set +a
```

PowerShell:

```powershell
$env:NODE_ENV = "test"
$env:ENABLE_TEST_AUTH = "true"
$env:TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/warranty_wallet_test"
$env:DATABASE_URL = $env:TEST_DATABASE_URL
$env:STRIPE_SECRET_KEY = "sk_test_integration_placeholder"
$env:GEMINI_API_KEY = "integration-placeholder"
```

Apply the committed schema to the isolated database:

```bash
npx prisma migrate deploy
npx prisma generate
```

Run only integration tests:

```bash
npm run test:integration
```

Run unit and integration suites together:

```bash
npm test
```

When `TEST_DATABASE_URL` is absent, integration files report an explicit skip rather than silently pretending to pass.

## CI database service

A CI workflow can start PostgreSQL as a service container and supply:

```env
NODE_ENV=test
ENABLE_TEST_AUTH=true
TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/warranty_wallet_test
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/warranty_wallet_test
STRIPE_SECRET_KEY=sk_test_integration_placeholder
GEMINI_API_KEY=integration-placeholder
```

The job should wait for PostgreSQL readiness, run `prisma migrate deploy`, generate Prisma Client, and then execute `npm test`.

## Adding a workflow suite

1. Place the file under `backend/test/integration` with suffix `.integration.test.js`.
2. Check `integrationEnabled()` before importing application modules.
3. Call `configureIntegrationEnvironment()` before importing Prisma or Express.
4. Create a database harness for tracked fixtures.
5. Start the Express app on an ephemeral loopback port.
6. Seed the smallest data graph needed for the scenario.
7. Exercise public HTTP routes instead of calling controllers directly.
8. Assert HTTP response and persisted database state.
9. Close the server, clean tracked fixtures, and disconnect Prisma.

## Isolation rules

- Generate unique Firebase UIDs, emails, slugs, serial numbers, and provider IDs.
- Never assume an empty database.
- Query for records created by the current suite.
- Do not truncate shared tables.
- Avoid fixed ports; the helper asks the operating system for an available port.
- Do not call Cloudinary, Stripe, Gemini, SMTP, or Firebase during database workflows.
- Keep provider-specific integration tests in separate opt-in suites.

## Diagnosing failures

### Harness refuses the database

Rename or create a database whose name clearly contains `test`. This is an intentional safety requirement.

### Prisma reports missing tables

Set `DATABASE_URL` to the same isolated database and run:

```bash
npx prisma migrate deploy
```

### Authentication unexpectedly reaches Firebase

Confirm `NODE_ENV=test`, `ENABLE_TEST_AUTH=true`, and the request includes `x-test-firebase-uid`.

### Cleanup reports foreign-key conflicts

Ensure new test records belong to a tracked fixture user or extend the harness to remove independent records in dependency order.

### Parallel suites conflict

Use the harness's `unique()` helper for every unique database field. Avoid globally named categories, brands, emails, and serial numbers.

## What these tests do not cover

- Real Firebase signature verification
- Real Cloudinary upload and deletion
- Live Gemini extraction
- Live SMTP delivery
- Stripe network calls or signed webhook delivery
- Browser rendering

Those boundaries require provider sandboxes or contract tests and should remain opt-in so ordinary CI is deterministic.

## Workflow coverage matrix

| Suite | Primary routes | Persistence assertions | Authorization assertions |
| --- | --- | --- | --- |
| Health and authentication | `/health`, protected routes, unknown routes | Local-user lookup | Missing, unknown, and blocked identities |
| User and preferences | `/users/sync`, `/users/me`, `/users/preferences` | Profile and preference updates | Current-user isolation |
| Assets | `/products` and `/products/:id` | Create, update, list, and soft delete | Cross-user access denial |
| Claims | `/claims`, status, timeline, documents | Claim lifecycle and evidence links | Asset and claim ownership |
| Notifications | list, unread count, read, read-all, delete | Read state and deletion | Cross-user notification denial |
| Activity | list, recent, and details | Feed pagination | Cross-user activity denial |
| Billing read model | plans, history, subscription | Payment and subscription projection | Current-user payment isolation |
| Dashboard | summary and analytics | Aggregates from seeded records | Admin analytics role checks |
| Catalog administration | categories and brands | Create, update, conflict, deactivate | Administrator-only mutations |
| Admin users | list, details, block, unblock | User status transitions | Ordinary-user denial and self-protection |
| Admin assets | global list, details, delete | Soft deletion and audit activity | Ordinary-user denial |
| Admin payments | global list and details | Status/search projections | Ordinary-user denial |
| Admin claims | global list and status update | Timeline and audit activity | Ordinary-user denial |
| Report exports | user and administrator PDF/Excel routes | Binary document generation | Administrator report role checks |
| HTTP security | health, errors, and CORS preflights | None | Origin policy and defensive headers |

## Expected error assertions

Integration tests assert machine-readable `code` values, not only human-facing messages. Messages may be edited for clarity or localization, while codes form a stable contract between backend and frontend.

| Situation | Expected status | Expected code |
| --- | ---: | --- |
| Missing identity | 401 | `UNAUTHORIZED` |
| Unknown local account | 401 | `USER_NOT_FOUND` |
| Blocked account | 403 | `ACCOUNT_SUSPENDED` |
| Insufficient role | 403 | `FORBIDDEN` |
| Missing owned resource | 404 | `NOT_FOUND` |
| Duplicate catalog name | 409 | `CONFLICT` |
| Invalid body, params, or query | 400 | `VALIDATION_FAILED` |

## CI behavior

The repository workflow separates checks into three jobs:

1. Frontend compilation and linting run without a database.
2. Backend unit tests run with placeholder configuration and no network services.
3. Backend integration tests receive an isolated PostgreSQL service database.

The integration job synchronizes the Prisma schema into its disposable service database before running the suites. When the repository adopts committed migrations, replace `prisma db push` with `prisma migrate deploy`. Provider credentials remain placeholders because these suites stop at project-owned boundaries.

## External identity boundary

Administrator account mutations normally update Firebase before changing the local user record. Integration tests must not make that provider call because they use synthetic Firebase identifiers and should remain deterministic offline.

The admin service therefore bypasses Firebase only when both conditions are true:

- `NODE_ENV` is exactly `test`.
- `ENABLE_TEST_AUTH` is exactly `true`.

Production and development retain the provider synchronization behavior. Requiring both flags prevents a single accidental environment setting from disabling identity-provider updates.

## Binary report assertions

Report tests validate the complete HTTP response rather than merely checking that a service returned an object:

- PDF responses use `application/pdf` and begin with the `%PDF` signature.
- Excel responses use the Open XML spreadsheet media type and begin with the ZIP `PK` signature.
- `Content-Disposition` supplies the expected download extension.
- Missing or unsupported formats fail through the shared validation contract.
- Administrator exports enforce the administrator role before generating data.

These checks catch broken controller piping, incorrect headers, empty output, and authorization regressions without comparing unstable binary snapshots.
