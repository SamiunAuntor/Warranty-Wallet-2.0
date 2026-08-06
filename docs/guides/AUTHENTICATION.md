# Authentication Workflow Guide

## Purpose

Warranty Wallet uses Firebase as the identity provider and PostgreSQL as the source of application authorization. A valid Firebase token proves control of an identity, but it does not by itself grant access to application data.

## Trust boundaries

1. The browser obtains an ID token from Firebase Authentication.
2. The browser sends the token in `Authorization: Bearer <token>`.
3. Firebase Admin verifies signature, issuer, audience, and expiry.
4. The backend resolves `firebaseUid` to a local `User` record.
5. Local role and status determine whether the request may continue.

Never accept a user ID, role, plan, or account status from request JSON. These fields must come from the verified local account.

## Account synchronization

`POST /api/v1/users/sync` is the bridge between Firebase and the application database. It requires a verified Firebase identity and creates or updates the corresponding local account.

Expected client sequence:

1. Complete Firebase sign-in or registration.
2. obtain a fresh ID token.
3. Call the sync endpoint with profile data.
4. Store the returned application profile in UI state.
5. Use fresh tokens for protected API requests.

Synchronization is idempotent for the same Firebase UID. Repeating it must not create a second local user.

## Protected request behavior

Protected endpoints use the full authentication middleware. The middleware rejects:

- a missing bearer token;
- a malformed authorization header;
- an expired or revoked Firebase session;
- a verified Firebase UID with no local account;
- a blocked or deleted local account.

Clients should branch on stable error codes rather than matching message text.

| Code | Client action |
| --- | --- |
| `UNAUTHORIZED` | Ask the user to sign in again. |
| `AUTH_SESSION_INVALID` | Refresh the token once, then sign out if retry fails. |
| `USER_NOT_FOUND` | Retry account synchronization. |
| `ACCOUNT_SUSPENDED` | Sign out and show support guidance. |
| `FORBIDDEN` | Keep the session but hide the unauthorized action. |

## Role authorization

Administrative routes require both an authenticated local user and `role: ADMIN`. UI route guards improve navigation but are not security controls. Every privileged backend route must retain server-side role middleware.

## Integration-test identity

Database integration tests use synthetic identity headers only when both `NODE_ENV=test` and `ENABLE_TEST_AUTH=true`. This seam avoids network calls to Firebase while preserving local-user lookup, status, role, and ownership checks.

Never enable test identity in development previews or production. Deployment configuration must omit `ENABLE_TEST_AUTH`.

## Security checklist

- Do not log ID tokens or authorization headers.
- Do not persist Firebase tokens in PostgreSQL.
- Do not trust email alone as an identity key.
- Revoke provider sessions when administrators suspend an account.
- Keep Firebase service-account material backend-only.
- Rotate leaked provider credentials immediately.
- Treat frontend route guards as user experience only.
- Test blocked-user behavior after every authentication refactor.

## Verification scenarios

Automated coverage should verify successful synchronization, repeat synchronization, missing tokens, unknown local users, blocked accounts, ordinary-user denial on admin routes, and ownership checks after authentication succeeds.

Manual verification should additionally cover token refresh, sign-out in multiple tabs, Firebase password reset, and provider-side account disablement.

## Maintenance rules

When authentication behavior changes, update the error catalog, OpenAPI security schemes, frontend auth context, integration identity documentation, and affected workflow tests in the same pull request.
