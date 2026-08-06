# Administration Guide

## Scope

Administrative APIs provide platform-wide visibility and controlled mutations for users, assets, claims, payments, catalog entries, and notifications. They are a separate authorization surface and require explicit role middleware.

## Access model

An authenticated account must exist locally, have active status, and have `role: ADMIN`. Client-side admin guards are navigation aids only.

Administrative service methods should still enforce sensitive invariants even after route middleware. Defense in depth prevents accidental exposure when a method is reused.

## Dashboard and lists

Administrator lists use bounded pagination, text search, filter allowlists, and sort allowlists. Data and count queries must share the same filter.

| Resource | Search examples | Filters |
| --- | --- | --- |
| Users | name, email | role, plan, status |
| Assets | name, brand | warranty status, category, owner |
| Payments | customer, email, session | payment status |
| Claims | title, claim number, asset, owner | claim status |
| Categories | name, description | active state |
| Brands | name, description, website | active state |

## User controls

Block and unblock operations synchronize Firebase disabled state with the local account status. Blocking also revokes refresh tokens. The local update should occur only after the provider operation succeeds.

Administrators cannot block or delete administrator accounts through ordinary management endpoints. A separate, audited break-glass process is required for privileged-account recovery.

Deletion currently represents a local deleted status and provider disablement rather than destructive removal of history.

## Integration boundary

Database tests bypass Firebase only when both test flags are active. This bypass preserves role, status, pagination, persistence, and activity assertions while preventing calls with synthetic provider identifiers.

## Asset controls

Administrator asset deletion is a soft delete. The action records an administrator-owned activity with the affected asset ID. Subsequent global lists exclude the deleted asset.

## Claim controls

Administrators may search all claims and advance status. A status change creates claim timeline history and administrator activity. Resolution timestamps must remain consistent with resolved state.

## Payment visibility

Payment administration is read-only in the current API. Manual payment mutation would risk divergence from Stripe and should not be added without reconciliation rules and detailed audit evidence.

## Broadcasts

System broadcasts create user-owned notification rows. Validate message length and type. For large populations, move fan-out to a durable background job with progress and retry tracking.

## Error behavior

- Ordinary account: `FORBIDDEN`.
- Missing resource: `NOT_FOUND`.
- Invalid query: `VALIDATION_FAILED`.
- Protected administrator target: domain validation error.
- Provider identity failure: mapped internal/provider error without credentials.

## Audit expectations

Block, unblock, delete, asset deletion, claim updates, and broadcast operations should record actor, target, action, and time. Avoid putting sensitive customer data in descriptions.

## Test checklist

Cover ordinary-user denial, search, filters, pagination, sort allowlists, details, unknown IDs, protected admin targets, provider failure ordering, local state transitions, soft deletion, claim timeline, broadcast fan-out, and activity records.

## Operational checklist

Before manual administration, confirm the target environment and user identity. After action, verify provider state, local state, and activity evidence. Do not repair production records through ad hoc SQL without approval and a rollback plan.

## Maintenance rules

Every new admin route requires route-level role middleware, service invariants, audit policy, OpenAPI documentation, typed frontend contracts, negative authorization tests, and an operational recovery note.
