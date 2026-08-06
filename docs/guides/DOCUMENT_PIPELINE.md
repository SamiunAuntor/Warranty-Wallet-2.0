# Document Pipeline Guide

## Purpose

Documents preserve receipts, invoices, warranty cards, condition photos, and other evidence associated with an asset. The domain coordinates multipart parsing, signature validation, storage, metadata persistence, OCR state, ownership, and claim evidence links.

## Request sequence

1. Authentication resolves the local user.
2. Multipart middleware accepts files within count and size limits.
3. Signature validation compares declared MIME type with file bytes.
4. Validation confirms route and body fields.
5. The service verifies asset ownership.
6. Storage uploads each accepted object.
7. Prisma persists document metadata.
8. Activity logging records successful uploads.
9. Optional extraction processes supported purchase records.

Validation and ownership checks should occur before provider writes whenever practical.

## Routes

| Method | Route | Responsibility |
| --- | --- | --- |
| `POST` | `/products/:productId/documents` | Upload one or more asset documents. |
| `GET` | `/products/:productId/documents` | List documents for one owned asset. |
| `GET` | `/documents` | Search and paginate all owned documents. |
| `GET` | `/documents/statistics` | Return owned-document aggregates. |
| `GET` | `/documents/:id` | Read one owned document. |
| `PATCH` | `/documents/:id` | Replace document content. |
| `DELETE` | `/documents/:id` | Remove an unlocked document. |

## Content validation

File extensions and browser MIME types are untrusted. Supported content must have matching magic bytes at the expected offset. A PDF marker later in arbitrary content is not sufficient. WebP requires both the RIFF container marker and WEBP identifier.

Reject unsupported formats, missing buffers, mismatched signatures, oversized files, and excess file counts with stable error codes.

## Storage layout

Provider folders distinguish structured purchase records from condition evidence. Stable folder conventions improve lifecycle cleanup, access reviews, and provider-side debugging.

Persist both the public URL and provider object identifier. Deletion must use the provider identifier rather than reconstructing it from a URL.

## Replacement safety

Never delete the existing object before the replacement has passed validation and uploaded successfully. Persist new metadata before attempting old-object cleanup. If cleanup fails, record an operational warning for later reconciliation.

## Claim locks

Documents attached to claims may be restricted from replacement or deletion. The service must query claim associations before mutating storage so evidence cannot silently disappear from an active claim.

## OCR metadata

Extraction state includes processed status, confidence, raw provider output, vendor name, and invoice number. Provider output is untrusted and should not overwrite user-confirmed values without explicit policy.

## Ownership rules

Document access requires document ownership and consistent asset ownership. A user must not access a document by guessing either a document ID or a product-document route combination.

## Failure recovery

- Upload succeeds but database write fails: delete the newly uploaded provider object.
- Database replacement succeeds but old cleanup fails: keep the new record and queue cleanup.
- Provider is unavailable: return a mapped provider error without exposing credentials.
- OCR fails: keep the uploaded document and represent extraction failure separately.

## Test checklist

Cover valid PDF/image signatures, spoofed MIME types, WebP markers, size and count limits, ownership, pagination, replacement ordering, provider cleanup failure, claim locks, structured folders, OCR defaults, and deletion activity.

## Maintenance rules

New formats require synchronized changes to upload configuration, signature detection, storage resource type, API documentation, frontend accept attributes, report behavior, and tests with real minimal byte fixtures.
