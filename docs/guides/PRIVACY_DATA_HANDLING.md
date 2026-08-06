# Privacy and Data Handling Guide

## Data categories

Warranty Wallet processes identity data, contact details, asset identifiers, serial numbers, purchase information, uploaded receipts, warranty evidence, claim narratives, payment metadata, notifications, activity context, and provider identifiers.

Classify new fields before implementation. Collection should have a product purpose, access policy, retention policy, and deletion behavior.

## Data minimization

Collect only what the workflow requires. Do not store raw authentication tokens, complete payment card data, unnecessary document copies, unrestricted provider responses, or entire HTTP requests.

Optional fields should remain optional throughout validation, database, API contract, and UI.

## Access control

User-owned records require authenticated ownership filters. Administrative access requires explicit role checks and audit evidence for mutations.

Storage-provider URLs do not replace application authorization. Treat publicly reachable asset URLs as sensitive design decisions.

## Logging

Safe logs use internal IDs, status codes, operation names, durations, and redacted provider identifiers. Avoid tokens, passwords, service-account material, document bytes, claim narratives, addresses, and full provider payloads.

Error mapping should remove raw database queries and provider internals before responding.

## Uploaded documents

Receipts and warranty documents may contain addresses, account fragments, signatures, and purchase history. Validate content, restrict access, define provider retention, and delete storage objects when application policy requires deletion.

AI extraction sends content to a separate processor. Document this boundary and provider retention before enabling it for real users.

## Payment data

Stripe handles card details. The application stores payment and subscription identifiers, amount, currency, plan, status, and timestamps needed for reconciliation.

Never add raw card numbers or security codes to application tables or logs.

## Retention

Define retention separately for active user data, deleted accounts, documents, claims, activity, notifications, payments, webhook events, and logs. Financial or dispute records may require different retention from product content.

Soft deletion is not complete erasure. User-facing deletion promises must match technical behavior.

## Account deletion

Before implementing hard deletion, map cascading relations, provider objects, Firebase identity, Stripe customer state, legal retention, backups, audit records, and scheduled jobs.

Use a documented workflow with confirmation, status transition, asynchronous cleanup where needed, and completion evidence.

## Data export

User reports should include only owned data. Administrator reports require role authorization. Export filenames and content must not leak another user's information through caching.

## Development and testing

Use fictional accounts and synthetic files. Do not copy production databases or user documents into local development. Integration fixtures use unique synthetic values and isolated test databases.

## Incident response

For suspected exposure, preserve evidence, rotate credentials, revoke sessions, determine affected data and users, stop continued access, and follow organizational reporting requirements.

## Review checklist

- Purpose is documented.
- Collection is minimal.
- Ownership is enforced.
- Admin access is justified.
- Logs are redacted.
- Retention is defined.
- Deletion is defined.
- Provider processing is documented.
- Export behavior is reviewed.
- Tests use synthetic data.
