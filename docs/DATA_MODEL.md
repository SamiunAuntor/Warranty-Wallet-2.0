# Data Model Guide

The backend stores relational data in PostgreSQL through Prisma. The schema is located at `backend/prisma/schema.prisma`.

## User

`User` connects a Firebase identity to application state. `firebaseUid` and `email` are unique. Role, account status, plan, avatar metadata, and last-login time are stored locally.

Owned relationships include products, documents, notifications, activity records, payments, claims, one subscription, and one preference record.

## UserPreference

Preferences are a one-to-one extension of a user. They store whether reminders are enabled, selected reminder-day thresholds, timezone, currency, and date format.

Separating preferences keeps identity fields stable while allowing regional and notification settings to evolve independently.

## Category and Brand

Categories and brands normalize asset classification. Both use unique display names and URL-friendly slugs. An active flag supports administration without forcing historical asset records to disappear.

Every product requires a category. A product may reference a normalized brand while also retaining its text brand value for display and legacy compatibility.

## Product

`Product` represents an owned asset. Important groups of fields are:

- Ownership: user and category identifiers.
- Identification: name, brand, model, serial number, and barcode.
- Purchase: price and purchase date.
- Warranty: presence, duration, type, expiry date, and calculated status.
- Lifecycle: added or archived.
- Seller: name, phone, email, and address.
- Media: image URL and provider public identifier.
- Audit: approval, deletion, creation, and update fields.

Money uses a fixed decimal type rather than floating-point storage.

## Document

Documents belong to both a user and a product. The record stores original file metadata, provider URL and public identifier, invoice metadata, and OCR results.

The provider public identifier is required for replacement and deletion. OCR output is stored as JSON because extracted fields can evolve without a migration for every provider response change.

## Claim

A claim belongs to a user and product and has a unique human-facing claim number. It records the issue, service center, provider reference, submitted condition, resolution, status, and lifecycle timestamps.

`ClaimTimelineEvent` stores chronological updates. `ClaimDocument` is a join model connecting a claim to existing documents while recording evidence type, claim stage, note, and attachment time.

The join model prevents duplicate attachments with a composite primary key.

## Notification

Notifications contain a title, message, type, optional entity reference, event key, read state, and email delivery timestamp.

The composite uniqueness rule across user, type, entity, and event key supports idempotent reminders. A repeated scheduled run should not create the same event twice.

## Subscription and Payment

`Subscription` is one-to-one with a user and records current, pending, and scheduled plan state. Stripe customer, subscription, and price identifiers connect provider state to the application.

`Payment` records Checkout sessions, payment intent and invoice identifiers, amount, currency, method, selected plan, and status. Provider identifiers are unique to make webhook processing safe to retry.

The optional latest-payment relationship identifies the payment that most recently established subscription state.

## ActivityLog

Activity records provide an audit trail for authentication, profile changes, assets, documents, payments, subscriptions, and administrator actions. Metadata is JSON so domain-specific context can be retained without widening the table for every activity type.

## WebhookEvent

Webhook events record the unique Stripe event identifier, type, payload, processing state, and timestamps. Persisting provider event IDs protects against duplicate delivery, which is normal webhook behavior.

## Enum guidance

Enums encode finite business states. Adding a value requires reviewing validation, filters, UI labels, reports, tests, and migrations. Renaming or removing a value is a data migration, not only a code edit.

## Ownership rules

- User-facing product queries include `userId` and exclude deleted records.
- Document ownership is checked directly and through its product.
- Claim evidence must belong to the same owned product.
- Notification, activity, payment, and subscription reads are scoped to the authenticated user.
- Administrator access is enforced separately and should still use explicit query intent.

## Migration workflow

After changing the schema:

```bash
cd backend
npx prisma format
npx prisma migrate dev --name descriptive_change
npx prisma generate
npm test
```

Commit the schema and generated migration directory. Do not commit a local database, generated client directory, or production credentials.
