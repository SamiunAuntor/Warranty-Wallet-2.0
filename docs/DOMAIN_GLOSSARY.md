# Domain Glossary

## Asset

A purchased item managed by a user. The database model is named `Product`, while the current interface generally uses “asset.” An asset contains purchase, seller, warranty, and identification details.

## Warranty

Coverage associated with an asset. Coverage can be manufacturer-provided or extended. Assets can also explicitly have no warranty.

## Warranty duration

Number of months of coverage beginning on the purchase date. The service derives an expiry date rather than requiring the user to calculate it.

## Warranty status

- `NO_WARRANTY`: The asset has no warranty coverage.
- `ACTIVE`: Coverage is active and outside the configured warning window.
- `EXPIRING_SOON`: Coverage is active but close to expiry.
- `EXPIRED`: The expiry date has passed.

## Asset lifecycle

- `ADDED`: Normal active inventory record.
- `ARCHIVED`: Retained record removed from the primary working inventory.

Lifecycle and warranty status describe different concerns and should not be conflated.

## Purchase document

Evidence associated with acquiring or covering an asset, such as an invoice, receipt, or warranty card.

## Condition photo

An image recording an asset's physical state. Condition evidence can support a later claim and is stored separately from purchase documents.

## OCR

Optical character recognition. In this project, Gemini performs multimodal extraction and returns structured purchase fields. The result is assistive and requires review.

## Claim

A record of a warranty or service request for an owned asset. A claim contains an issue, status, provider details, supporting evidence, and timeline.

## Claim timeline

Chronological events describing claim progress. Timeline entries can record a status, title, description, and timestamp.

## Claim evidence

Documents attached to a claim. Evidence must belong to the same user and asset. The attachment records its purpose and optional claim stage.

## Reminder threshold

A user-selected number of calendar days before warranty expiry, such as 30, 14, or 3 days. Calendar-day comparison avoids errors caused by daylight-saving or elapsed-hour differences.

## Notification

An in-application message for reminders, payments, subscriptions, or system information. Notifications can be marked read and may correspond to an email delivery.

## Activity log

An auditable record of a significant user or administrator action. It is distinct from a notification: activities describe what happened, while notifications communicate information to a recipient.

## Plan

- `BASIC`: Free tier with a small asset allowance.
- `PLUS`: Paid tier with a larger asset allowance.
- `PRO`: Highest paid tier with the largest allowance.

The backend enforces plan limits. UI presentation alone must not be treated as enforcement.

## Subscription

The user's ongoing paid-plan state. A subscription records current and future plan intent, period dates, cancellation state, and Stripe identifiers.

## Payment

A financial event associated with a Stripe Checkout session. A payment has an amount, currency, selected plan, method, and processing status.

## Scheduled downgrade

A plan change that takes effect after the current paid period. Current access remains available until the period ends.

## User synchronization

The process that maps a verified Firebase identity to a PostgreSQL `User`. It refreshes application identity fields and returns role, account status, and plan information.

## Administrator

A synchronized user with the `ADMIN` role. Administrators can inspect platform data and perform protected moderation, catalog, communication, and reporting tasks.

## Soft deletion

Retaining a record while marking it unavailable to ordinary queries. Product deletion behavior uses an explicit flag so historical relationships can remain intact where required.

## Idempotency

The property that repeating an operation does not create duplicate effects. It is especially important for webhook delivery and scheduled reminders.

## Provider public ID

The storage-provider identifier used to replace or delete a Cloudinary object. It is different from the public download URL.

## Webhook event

A signed asynchronous message sent by Stripe. Events can be delivered more than once, so their unique provider IDs are persisted.
