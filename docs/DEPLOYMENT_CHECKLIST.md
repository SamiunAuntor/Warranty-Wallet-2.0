# Deployment Checklist

This checklist complements the detailed Vercel deployment guide and is intended for release review.

## Before deployment

- [ ] Frontend lint completes.
- [ ] Frontend production build completes.
- [ ] Backend test suite passes.
- [ ] Prisma schema is formatted.
- [ ] Required migrations are committed.
- [ ] Prisma Client generation succeeds.
- [ ] No `.env` files or credentials are staged.
- [ ] Lockfiles match package manifests.
- [ ] Release commits have accurate messages.

## Backend project

- [ ] Backend root directory is configured as `backend`.
- [ ] Node.js 24.x is selected.
- [ ] `NODE_ENV=production` is set.
- [ ] `DATABASE_URL` points to production PostgreSQL.
- [ ] Firebase Admin service account is encoded correctly.
- [ ] Cloudinary production credentials are configured.
- [ ] Stripe live or intended test credentials are configured.
- [ ] SMTP credentials use a production sender.
- [ ] Gemini API key and model are configured.
- [ ] `CLIENT_URL` contains every approved frontend origin.
- [ ] Health endpoint returns HTTP 200.

## Database

- [ ] A backup or provider recovery point exists before migration.
- [ ] Migration SQL has been reviewed.
- [ ] Production migrations complete successfully.
- [ ] Expected indexes exist.
- [ ] Database connection limits match serverless concurrency.
- [ ] Application user has only required privileges.
- [ ] TLS is enabled when supported.

## Frontend project

- [ ] Frontend root directory is configured as `frontend`.
- [ ] Node.js 24.x is selected.
- [ ] `NEXT_PUBLIC_API_URL` includes `/api/v1`.
- [ ] Firebase web configuration is present.
- [ ] Production domain is authorized in Firebase.
- [ ] Landing page and static assets render.
- [ ] Login and registration reach Firebase.
- [ ] Authenticated API requests reach the production backend.

## Stripe

- [ ] Checkout plan identifiers and prices are correct.
- [ ] Webhook URL ends with `/api/v1/webhooks/stripe`.
- [ ] Webhook signing secret matches that endpoint.
- [ ] Required event types are enabled.
- [ ] Test checkout completes before enabling live mode.
- [ ] Successful payment updates application state.
- [ ] Replayed events remain idempotent.
- [ ] Cancel and success redirects use production frontend URLs.

## Scheduled reminders

- [ ] Vercel Cron configuration is deployed with the backend.
- [ ] Cron endpoint authorization is configured.
- [ ] Production does not start duplicate in-process jobs.
- [ ] A controlled asset is eligible for a reminder.
- [ ] Repeated execution does not duplicate notifications.
- [ ] Email failures are observable without breaking status updates.

## Security review

- [ ] CORS does not use a wildcard with credentials.
- [ ] Admin endpoints reject normal users.
- [ ] User-owned endpoints reject another user's identifiers.
- [ ] Upload limits and signatures are enforced.
- [ ] Error responses omit stack traces and provider details.
- [ ] Logs contain no tokens, secrets, or document bodies.
- [ ] Rate limiting is enabled.
- [ ] Provider credentials can be rotated independently.

## Smoke test

- [ ] Register a new user.
- [ ] Sign in and sign out.
- [ ] Update profile preferences.
- [ ] Create an asset.
- [ ] Upload and delete a test document.
- [ ] Extract a test invoice and review fields.
- [ ] Create and update a claim.
- [ ] Read and dismiss a notification.
- [ ] Complete a Stripe test checkout.
- [ ] Export PDF and Excel reports.
- [ ] Verify administrator lists and filters.

## Rollback preparation

- [ ] Previous frontend deployment is identifiable.
- [ ] Previous backend deployment is identifiable.
- [ ] Migration rollback or forward-fix plan is documented.
- [ ] Feature changes can be disabled without deleting data.
- [ ] Provider webhook destinations can be restored.

## After deployment

- [ ] Monitor runtime errors and latency.
- [ ] Inspect authentication and CORS failures.
- [ ] Confirm webhook delivery success.
- [ ] Confirm cron execution at the expected time.
- [ ] Review database connections and slow queries.
- [ ] Check email bounce or provider rejection rates.
- [ ] Record deployment identifiers in the release notes.
