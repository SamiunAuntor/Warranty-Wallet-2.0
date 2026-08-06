# Authentication Workflow

Firebase proves identity; PostgreSQL determines application access. Protected requests follow this sequence:

1. The browser sends `Authorization: Bearer <token>`.
2. Firebase Admin verifies the token.
3. The backend resolves `firebaseUid` to a local user.
4. Local status and role authorize the request.

`POST /api/v1/users/sync` creates or updates the local account after Firebase verification. It must remain idempotent for the same UID. Never accept user ID, role, plan, or status from request JSON.

## Error handling

| Code | Client action |
| --- | --- |
| `UNAUTHORIZED` | Sign in again. |
| `AUTH_SESSION_INVALID` | Refresh once, then sign out. |
| `USER_NOT_FOUND` | Retry synchronization once. |
| `ACCOUNT_SUSPENDED` | Sign out and show support guidance. |
| `FORBIDDEN` | Keep the session but hide the action. |

Administrative routes require server-side role middleware. Frontend guards are navigation aids, not security controls.

Integration tests may use synthetic identity headers only when both `NODE_ENV=test` and `ENABLE_TEST_AUTH=true`. Production and preview environments must omit the test flag.

## Verification

Test synchronization, repeat synchronization, missing and invalid tokens, unknown local users, blocked accounts, ordinary-user denial, administrator access, and resource ownership. Never log tokens or store them in PostgreSQL.

When behavior changes, update the error catalog, OpenAPI security definitions, frontend auth context, and integration tests together.
