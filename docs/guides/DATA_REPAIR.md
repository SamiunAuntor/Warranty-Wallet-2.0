# Data Repair Playbook

## Purpose

Data repair is a controlled operational change, not an ordinary debugging shortcut. Use this playbook when application records disagree with provider state or violate documented invariants.

## Safety rules

- Confirm the environment before reading or writing.
- Preserve a backup or export of affected rows.
- Minimize the target set with exact identifiers.
- Prefer application services or reviewed scripts over ad hoc SQL.
- Make the repair idempotent.
- Include a dry-run mode.
- Log before and after state without secrets.
- Define rollback before execution.
- Require review for production writes.

## Investigation record

Capture incident reference, reporter, affected users, affected entities, earliest known occurrence, expected state, observed state, provider state, likely cause, and supporting queries.

## User identity mismatch

Compare Firebase UID, local user ID, local email, provider email, status, role, and last login. The Firebase UID is the primary linkage; email alone is insufficient.

Do not merge accounts by simply replacing unique identifiers. Inventory products, documents, claims, payments, subscription, notifications, preferences, and activities first.

## Subscription mismatch

Compare Stripe customer, subscription, price, period, cancellation state, recent invoices, local subscription, latest payment, and local user plan.

Provider records determine financial truth. Repair local access to match a verified provider state, then replay or record missing application side effects idempotently.

## Duplicate catalog entries

Choose the surviving category or brand, count references, migrate product foreign keys transactionally, verify counts, deactivate the duplicate, and retain an audit note.

Do not delete referenced catalog rows.

## Orphaned storage objects

Compare database provider IDs with storage inventory. A provider object without a row may be removable after retention checks. A row without an object requires user-facing handling and investigation.

Never derive deletion targets from an untrusted URL when a stored provider identifier exists.

## Notification duplicates

Group by user, type, entity, and event key. Preserve the earliest valid event unless product requirements specify otherwise. Fix the producer's idempotency before deleting duplicates.

## Warranty correction

Recalculate duration, expiry date, and status using the same calendar utility as application code. Preserve user-entered purchase evidence and record why the derived values changed.

## Soft-deleted assets

Confirm whether deletion was user or administrator initiated through activity history. Recovery must review documents, claims, reminder scheduling, and plan-limit effects before clearing `isDeleted`.

## Repair script structure

1. Parse explicit identifiers and environment.
2. Refuse broad or production execution without confirmation policy.
3. Read candidate rows.
4. Print a redacted dry-run diff.
5. Recheck preconditions inside a transaction.
6. Apply the smallest change.
7. Write audit evidence.
8. Verify invariants.
9. Print a summary and rollback reference.

## Verification

- Row counts match expectations.
- Unique constraints remain satisfied.
- Relations resolve.
- Provider and local state agree.
- User-facing API returns expected data.
- Dashboard and reports reflect the repair.
- Scheduled jobs do not recreate the issue.
- Audit evidence identifies the repair.

## Rollback

Rollback should restore captured values through another reviewed operation. Avoid destructive rollback that removes legitimate activity occurring after the original repair.

## Follow-up

Add a regression test, strengthen validation or idempotency, improve monitoring, document the invariant, and remove temporary repair tooling when it is no longer safe or necessary.
