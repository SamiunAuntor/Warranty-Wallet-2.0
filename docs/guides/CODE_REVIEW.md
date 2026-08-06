# Code Review Checklist

## Review objective

Code review verifies behavior, safety, maintainability, and evidence. It is not limited to style or whether the code compiles.

## Understand the change

- Read the stated problem and acceptance criteria.
- Identify affected users and roles.
- Trace the complete request and data path.
- Identify provider and operational boundaries.
- Compare implementation scope with the requested scope.

## Backend review

- Route method and path are correct.
- Middleware order is authentication, role, upload, validation, then controller as required.
- Validation rejects dangerous or unknown fields.
- Service owns business rules.
- Repository applies ownership and soft-delete filters.
- Sort fields are allowlisted.
- Pagination is bounded.
- Transactions cover coupled writes.
- Provider failures are mapped safely.
- Stable errors support frontend behavior.

## Authentication and authorization

- Identity comes from verified middleware.
- Request bodies cannot select user, role, plan, or status.
- Owner and foreign-owner scenarios differ correctly.
- Administrator routes require server-side role checks.
- Test-only bypasses require multiple explicit test conditions.

## Database review

- Unique and foreign-key invariants are understood.
- Nullability and defaults support existing data.
- Indexes support new filters.
- Cascades match deletion policy.
- Soft-deleted rows are excluded where required.
- Decimal and date handling preserve meaning.
- Cleanup and rollback are possible.

## Frontend review

- Components use domain clients instead of duplicate fetch logic.
- Shared contract types match the API.
- Tokens pass through the established boundary.
- FormData does not receive a manual boundary.
- Loading, empty, error, and success states exist.
- Error codes drive appropriate recovery.
- Mutations invalidate dependent queries.
- Accessibility and keyboard behavior remain usable.

## Security review

- No secrets or tokens are logged or exposed.
- Upload content is signature validated.
- CORS changes are intentional.
- User content is escaped in HTML and reports.
- Spreadsheet formula injection is considered.
- Rate limits cover abuse-prone routes.
- Error details do not expose internals.

## Provider review

- Stripe actions are idempotent and test mode is separated.
- Firebase state changes order correctly with local updates.
- Cloudinary replacement cannot destroy the existing file first.
- Gemini output is validated as untrusted.
- Email failure policy is explicit.

## Test review

- Regression behavior is demonstrated.
- Success and negative paths exist.
- Ownership and role denial are tested.
- Database state is asserted after mutations.
- Tests use synthetic data.
- External providers are isolated.
- Cleanup handles partial setup.
- CI will actually select the new test file.

## Documentation review

- OpenAPI matches implementation.
- Environment changes are documented.
- Domain guide reflects new invariants.
- Operational and rollback behavior is clear.
- Examples contain no real credentials or identities.

## Commit review

Commits should be coherent, buildable where practical, and named for the behavior changed. Generated artifacts must be identified honestly and reproducible.

## Approval record

Before approval, record blocking issues, accepted tradeoffs, tests observed, areas not verified, deployment risks, and required follow-up. Approval should mean the reviewer understands the change, not merely that no obvious syntax error remains.
