# Activity and Audit Guide

## Purpose

Activity records provide a user-visible history and a lightweight operational audit trail. They describe meaningful actions without storing secrets or entire request payloads.

## Recorded fields

An activity includes owner, type, entity category, optional entity ID, title, description, optional structured metadata, network context, and creation time.

## Common activity types

- authentication and registration;
- profile updates;
- asset creation, update, and deletion;
- document upload and deletion;
- payment success or failure;
- subscription creation or expiry;
- administrator user and asset actions;
- administrator broadcasts.

## Routes

| Method | Route | Responsibility |
| --- | --- | --- |
| `GET` | `/api/v1/activities` | Paginated current-user history. |
| `GET` | `/api/v1/activities/recent` | Small recent subset. |
| `GET` | `/api/v1/activities/:id` | One owned activity, or administrator access. |

## Logging principles

Write activity only after the primary operation succeeds. A failed asset creation should not produce a successful-creation event. Where activity is compliance-critical, include it in the same transaction or use a durable outbox.

Titles should be short and stable. Descriptions can be human friendly. Machine behavior should rely on type and entity fields rather than parsing prose.

## Sensitive-data policy

Never store tokens, passwords, service credentials, full payment details, raw uploaded documents, or unrestricted request bodies. Metadata should use an explicit allowlist.

IP addresses and user agents may be personal data. Retention and access policies should reflect applicable privacy requirements.

## Ownership and administrator access

Ordinary users see only their own events. Administrators may access an individual record according to service policy, but global audit browsing should remain explicitly authorized and paginated.

## Pagination and ordering

Feeds are newest first. Stable tie-breaking by unique ID is useful for cursor pagination if activity volume grows. Current page metadata must use the same ownership filter as the data query.

## Failure policy

For ordinary product analytics, activity failure may be logged without undoing the primary operation. For security or administrative actions, decide explicitly whether missing audit evidence should fail the action.

## Test checklist

Verify ownership, administrator access, foreign-user denial, pagination, recent limits, chronological order, metadata serialization, IP/user-agent capture, and event creation after each supported operation.

## Investigation workflow

1. Identify the affected local user and entity.
2. Query events around the incident timestamp.
3. Compare activity with provider and application logs.
4. Confirm whether the primary database mutation committed.
5. Record any repair as a new administrative event.

## Retention

Define retention before activity volume becomes large. Archival or deletion jobs must be bounded, observable, and careful not to remove records needed for active disputes.

## Maintenance rules

When adding a new activity type, update the Prisma enum, logging helper, display label, filters, reports if relevant, integration fixture support, and documentation in one change.
