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
