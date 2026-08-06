# User Profile and Preference Guide

## Scope

The user domain owns local account synchronization, profile fields, avatar metadata, and presentation preferences. Firebase remains responsible for authentication credentials; PostgreSQL stores application-specific profile state.

## Profile endpoints

| Method | Route | Responsibility |
| --- | --- | --- |
| `POST` | `/api/v1/users/sync` | Create or refresh the local account. |
| `GET` | `/api/v1/users/profile` | Return the authenticated profile. |
| `PATCH` | `/api/v1/users/profile` | Update editable profile fields. |
| `POST` | `/api/v1/users/profile/avatar` | Replace the custom avatar. |
| `GET` | `/api/v1/users/preferences` | Read normalized preferences. |
| `PATCH` | `/api/v1/users/preferences` | Update preference values. |

## Editable and protected fields

Users may edit presentation fields such as name and phone. They must not set role, plan, status, Firebase UID, verification state, subscription dates, or ownership identifiers through profile input.

Email changes require special care because Firebase and PostgreSQL can otherwise disagree. Any future email-change feature should verify the provider-side change before updating the local unique email.

## Avatar workflow

Avatar upload is a multipart request. The server validates the uploaded content, sends it to the configured storage provider, stores the URL and provider identifier, and marks the avatar source as custom.

Safe replacement order:

1. Validate the new file.
2. Upload the new object.
3. Persist new avatar metadata.
4. Remove the old provider object after persistence succeeds.

This order prevents a failed upload from destroying the current avatar. Cleanup failures should be logged without rolling back an otherwise successful profile update.

## Preference model

Preferences include warranty reminder enablement, reminder-day windows, timezone, currency, and date format. Defaults are created lazily or during synchronization depending on service behavior.

Reminder days are a set-like collection. The API should normalize duplicates and ordering so equivalent user input produces stable stored state and cache keys.

Timezone values affect display and scheduled communication. Store canonical IANA names where possible and keep business timestamps in UTC.

## Client behavior

The frontend should use the typed auth client, update cached profile state after successful mutations, and avoid optimistic avatar URLs that reference revoked browser object URLs.

Preference changes should invalidate dashboard and date-sensitive queries because currency, timezone, and date format can affect multiple views.

## Failure handling

- `VALIDATION_FAILED`: associate issues with the relevant form fields.
- `UNAUTHORIZED`: refresh authentication or return to sign-in.
- `USER_NOT_FOUND`: run synchronization once.
- `UPLOAD_INVALID`: explain accepted avatar formats.
- `UPLOAD_TOO_LARGE`: show the configured size limit.
- `CONFLICT`: do not overwrite another account's unique field.

## Data invariants

- One local user maps to one Firebase UID.
- Firebase UID and email remain unique.
- One preference record belongs to one user.
- Avatar provider ID and URL describe the same object.
- Deleted users cannot use protected profile routes.
- Role, status, and plan are never profile-editable.

## Test checklist

Cover first synchronization, repeat synchronization, profile reads, partial profile updates, unknown properties, default preferences, normalized reminder days, invalid currencies, invalid date formats, invalid timezones if enforced, avatar MIME spoofing, oversized uploads, and blocked-user access.

## Operational notes

When investigating profile mismatch, compare Firebase UID first, then local email and account status. Do not repair identity linkage by editing IDs manually without an audit trail and backup.

## Change checklist

Schema changes require Prisma updates, response-contract updates, frontend type updates, migration or schema-sync review, OpenAPI changes, seed adjustments, and integration tests for both existing and newly synchronized users.
