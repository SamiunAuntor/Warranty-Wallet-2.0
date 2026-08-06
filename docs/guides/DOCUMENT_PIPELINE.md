# Document Pipeline

Documents preserve receipts, warranty records, and claim evidence. The request path is authentication, multipart parsing, byte-signature validation, ownership validation, storage upload, database persistence, and activity logging.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST/GET` | `/products/:productId/documents` | Upload or list asset documents. |
| `GET` | `/documents` | Search owned documents. |
| `GET` | `/documents/statistics` | Return aggregates. |
| `GET/PATCH/DELETE` | `/documents/:id` | Read, replace, or remove a document. |

Extensions and browser MIME types are untrusted. Validate magic bytes at expected offsets; WebP requires both RIFF and WEBP markers. Enforce file size, count, and supported-type limits.

Persist storage URL and provider ID. Replacement uploads and persists the new object before cleaning up the old one. If persistence fails after upload, remove the new provider object.

Documents attached to claims may be locked from replacement or deletion. Every operation verifies document and asset ownership.

Extraction output is untrusted metadata. Keep confidence and raw output separate from user-confirmed values.

Test signatures, spoofing, limits, ownership, pagination, replacement ordering, cleanup failure, claim locks, storage folders, OCR defaults, and activity logging.

New formats require coordinated upload, signature, storage, frontend accept-list, API documentation, and fixture changes.
