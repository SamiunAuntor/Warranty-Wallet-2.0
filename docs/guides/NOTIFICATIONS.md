# Notification Workflow Guide

## Purpose

Notifications communicate warranty reminders, payment events, subscription changes, and system announcements. Each notification belongs to one user and has a read state, type, optional entity reference, and optional event key.

## API surface

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/api/v1/notifications` | List current-user notifications. |
| `GET` | `/api/v1/notifications/unread-count` | Return the unread counter. |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark one owned item as read. |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all owned items as read. |
| `DELETE` | `/api/v1/notifications/:id` | Delete one owned item. |
| `POST` | `/api/v1/notifications/broadcast` | Create an administrator broadcast. |

## Types

- `REMINDER` represents warranty timing events.
- `PAYMENT` represents payment outcomes.
- `SUBSCRIPTION` represents plan lifecycle events.
- `SYSTEM` represents administrative or operational announcements.

Clients should render a type-specific icon or label but remain tolerant of future values.

## Ownership

Every query and mutation scopes by authenticated user ID. A guessed notification ID must not allow reading, mutation, or deletion of another user's item.

Administrator broadcast creates separate user-owned rows. It does not create a globally readable shared record.

## Idempotency

The unique combination of user, type, entity, and event key prevents duplicate event-driven notifications. Scheduled jobs and webhook handlers should provide deterministic event keys.

Marking an already-read notification should succeed without changing unrelated fields. Mark-all operations should remain safe when no unread rows exist.

## Pagination

Notification lists are newest first and bounded by pagination limits. Metadata must describe the current user's filtered collection, not the global table.

## Frontend behavior

The notification center fetches the list and unread count through the typed API client. Reading one item should update both caches. Reading all should set the visible counter to zero after server confirmation.

Do not depend only on optimistic state; invalidate or reconcile after mutations so multiple tabs converge.

## Broadcast behavior

Broadcast input requires a title, message, and allowed type. Validate length before inserting. Large user populations may require batching or a job queue rather than one oversized transaction.

## Failure cases

- Missing authentication: `UNAUTHORIZED`.
- Foreign notification: do not expose its content.
- Malformed ID: `VALIDATION_FAILED`.
- Missing notification: `NOT_FOUND`.
- Ordinary-user broadcast: `FORBIDDEN`.
- Duplicate event: handle idempotently where the source may retry.

## Test checklist

Verify user isolation, newest-first order, pagination, unread count, mark one, mark all, repeated reads, deletion, foreign-ID denial, broadcast role enforcement, broadcast fan-out, and duplicate event keys.

## Operational notes

If counters disagree with lists, compare query ownership and `isRead` filters first. When repairing duplicates, preserve the earliest meaningful event and document the cleanup.

## Maintenance rules

New notification types require Prisma enum changes, templates, client display mapping, OpenAPI updates, filtering review, seed data, and event-specific idempotency tests.
