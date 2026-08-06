# User Profiles and Preferences

The user domain stores application profile data, avatar metadata, and display preferences. Firebase remains responsible for credentials.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/users/sync` | Synchronize the local account. |
| `GET/PATCH` | `/users/profile` | Read or update editable profile fields. |
| `POST` | `/users/profile/avatar` | Replace the custom avatar. |
| `GET/PATCH` | `/users/preferences` | Read or update preferences. |

Users may edit fields such as name and phone, but never role, plan, status, UID, or verification state.

Avatar replacement validates and uploads the new file before persisting metadata and removing the old provider object. This ordering prevents a failed upload from destroying the current avatar.

Preferences cover reminders, reminder days, timezone, currency, and date format. Normalize duplicate reminder days and keep timestamps in UTC. Preference changes may invalidate dashboard and date-sensitive frontend queries.

## Invariants

- Firebase UID and email are unique.
- One preference record belongs to one user.
- Avatar URL and provider ID identify the same object.
- Blocked or deleted users cannot use protected routes.
- Privileged fields are never profile-editable.

Test synchronization, partial updates, defaults, preference normalization, validation details, avatar signature and size limits, provider replacement ordering, and blocked-user access.
