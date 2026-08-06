# Claim Lifecycle

Claims organize warranty service for an owned asset. Each claim has a unique number, status, timeline, and optional document evidence.

Statuses are `SUBMITTED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, and `CANCELLED`. Status changes append timeline history; resolution sets the resolved timestamp.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET/POST` | `/api/v1/claims` | List or create claims. |
| `GET/PATCH/DELETE` | `/api/v1/claims/:id` | Read, update, or close a claim. |
| `POST` | `/api/v1/claims/:id/timeline` | Append an event. |
| `POST/DELETE` | `/api/v1/claims/:id/documents` | Attach or detach evidence. |

Creation verifies asset ownership. Evidence must belong to the same user and asset, and duplicate document IDs produce one link. Timeline events are append-only audit history.

User routes are ownership scoped. Administrator routes support global search and status changes, with both claim timeline and administrator activity records.

Lists use bounded pagination with consistent search, status, asset, and count filters. Client mutations invalidate lists, details, asset details, and dashboard claim counts.

Test claim-number uniqueness, creation, ownership, search, pagination, each status, resolved time, timeline events, evidence attach/detach, administrator updates, and audit activity.
