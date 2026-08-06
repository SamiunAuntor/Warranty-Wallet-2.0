# Warranty Claim Lifecycle Guide

## Purpose

Claims organize a user's warranty-service process around an owned asset. A claim contains a stable claim number, issue description, status, service details, timeline events, and selected evidence documents.

## States

| Status | Meaning |
| --- | --- |
| `SUBMITTED` | The claim has been recorded and awaits processing. |
| `IN_PROGRESS` | A provider or administrator is working on it. |
| `RESOLVED` | The issue reached a completed resolution. |
| `REJECTED` | The claim was declined. |
| `CANCELLED` | The user or administrator ended the claim. |

State changes should append timeline history. Resolution time is populated when entering the resolved state.

## Routes

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/api/v1/claims` | List the current user's claims. |
| `POST` | `/api/v1/claims` | Create a claim for an owned asset. |
| `GET` | `/api/v1/claims/:id` | Load details, timeline, and evidence. |
| `PATCH` | `/api/v1/claims/:id` | Update fields or status. |
| `DELETE` | `/api/v1/claims/:id` | Close or delete according to service policy. |
| `POST` | `/api/v1/claims/:id/timeline` | Append a descriptive event. |
| `POST` | `/api/v1/claims/:id/documents` | Attach owned evidence. |
| `DELETE` | `/api/v1/claims/:id/documents/:documentId` | Detach evidence. |

## Creation invariants

- The asset belongs to the authenticated user.
- Every attached document belongs to that user and asset.
- Duplicate document identifiers produce one evidence link.
- Title and issue description satisfy length constraints.
- The generated claim number is unique.
- Initial status and timeline agree.

## Evidence model

Evidence links are many-to-many records with evidence type, claim stage, optional note, and attachment time. The original document remains owned by its asset.

Supported evidence types distinguish supporting documents, condition photos, damage photos, correspondence, and other material. Clients should display the evidence type, not infer it from MIME type.

## Timeline rules

Timeline entries are append-only historical events. Status changes create events automatically; users may add descriptive events without changing state. Avoid rewriting old events because they form an audit narrative.

## User and administrator behavior

User routes are ownership scoped. Administrator routes provide global search and status management under explicit role authorization. Administrator updates should create both a claim timeline event and an administrator activity record.

## Query behavior

Lists support bounded pagination, status filtering, asset filtering, and text search. Count and data queries must share identical filters. Claim details should order timeline events consistently.

## Error cases

- Foreign asset or claim: deny without exposing private details.
- Foreign evidence document: deny attachment.
- Evidence from another asset: reject even when owned by the same user.
- Missing claim or evidence: `NOT_FOUND`.
- Invalid status or empty patch: `VALIDATION_FAILED`.
- Duplicate evidence link: return idempotent success or a documented conflict.

## Client cache behavior

After creating or updating a claim, invalidate claim lists, claim details, relevant asset details, dashboard open-claim counts, and administrator claim views where applicable.

## Test checklist

Cover creation, claim-number uniqueness, duplicate evidence normalization, ownership, search, pagination, each status, resolved timestamp, manual timeline events, attach, detach, evidence metadata, administrator updates, and activity logging.

## Maintenance rules

New statuses require changes to Prisma enums, validation, service transitions, display labels, filters, OpenAPI schemas, report output, seed data, and both user and administrator integration tests.
