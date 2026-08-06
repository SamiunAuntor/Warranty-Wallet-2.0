# Test Design Playbook

## Test layers

Warranty Wallet uses focused unit tests, database-backed HTTP integration tests, compilation and lint checks, and optional provider or browser verification.

Choose the lowest layer that can prove the behavior without mocking away the risk under investigation.

## Unit tests

Use unit tests for deterministic utilities, validation transformations, repository query construction, service branching, provider request construction, and error mapping.

Mock only direct collaborators. Assert observable outputs and meaningful calls rather than implementation trivia.

## HTTP integration tests

Use integration tests for routing, middleware order, authentication projection, role checks, validation, response envelopes, repository behavior, transactions, ownership, and persistence.

Send requests through an ephemeral loopback server. Do not call controllers directly in an integration suite.

## Database safety

- Require `TEST_DATABASE_URL`.
- Require a PostgreSQL URL.
- Require the database name to contain `test`.
- Never truncate a shared database.
- Use unique fixture values.
- Track created root records.
- Rely on cascading cleanup only where the schema guarantees it.
- Close servers and disconnect Prisma.

## Fixture design

Factories should create the smallest valid record and accept overrides for the field under test. Use stable dates when current time is irrelevant.

Keep ownership graphs obvious. Name fixture variables by role: `owner`, `otherUser`, `admin`, `asset`, `claim`, and `payment`.

## Workflow structure

A strong integration workflow contains setup, successful operation, response assertion, persistence assertion, ownership denial, validation failure, and cleanup.

Order tests only when they intentionally model a lifecycle. Otherwise isolate state to prevent hidden dependencies.

## Response assertions

Assert HTTP status, success flag, stable code, important data fields, pagination metadata, and binary headers where applicable.

Avoid snapshotting volatile timestamps or entire ORM objects. Assert the contract fields that matter.

## Persistence assertions

After mutations, query Prisma to confirm the committed result, related rows, soft-delete flags, timeline events, and audit records.

A successful HTTP response alone does not prove transactional correctness.

## Authorization matrix

For protected resources, test missing identity, unknown local identity, blocked identity, ordinary user, owner, different owner, and administrator when applicable.

## Provider isolation

Unit tests mock Stripe, Firebase, Gemini, Cloudinary, and SMTP. Database integration tests must not contact them. Provider sandbox tests are separately named, opt-in, and use synthetic data.

## Time behavior

Inject or fix time for warranty boundaries, subscription periods, reminder windows, and report ranges. Include calendar and timezone edges where relevant.

## Failure messages

Assert stable error codes and structured details. Match human messages only when wording itself is a product requirement.

## Flakiness prevention

- Avoid fixed ports.
- Avoid arbitrary sleeps.
- Await cleanup.
- Use unique identifiers.
- Do not depend on test execution order across files.
- Bound external calls with timeouts.
- Keep current-time assertions tolerant or injected.

## Review checklist

- Test name describes behavior.
- Failure points to the violated requirement.
- Fixture scope is minimal.
- No production credential is required.
- Negative path exists.
- Ownership is explicit.
- Database change is asserted.
- Cleanup handles partial setup.
- Test runs in CI.
- Documentation reflects new coverage.
