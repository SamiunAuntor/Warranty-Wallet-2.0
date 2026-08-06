# Operations Runbook

## Purpose

This runbook provides a repeatable first response for incidents involving the API, frontend, PostgreSQL, Firebase, Stripe, Cloudinary, Gemini, email, scheduled reminders, and report generation.

## First-response sequence

1. Confirm the affected environment and deployment version.
2. Record incident start time, reporter, and visible symptoms.
3. Check health endpoint and deployment status.
4. Determine whether impact is global, role-specific, or user-specific.
5. Review recent deploys and configuration changes.
6. Inspect sanitized application logs around a correlation timestamp.
7. Check database and provider status pages.
8. Apply the smallest reversible mitigation.
9. Verify recovery through the complete user workflow.
10. Document cause, impact, fix, and follow-up work.

## API unavailable

Check process startup logs, required environment validation, database connectivity, Prisma generation, port binding, and platform health probes. A healthy process with failing routes often indicates provider or database dependency failure.

Do not restart repeatedly without capturing the original error.

## Database failures

Confirm `DATABASE_URL` points to the intended environment. Check connection limits, active sessions, long-running queries, locks, schema synchronization, and provider maintenance.

Never run integration cleanup or `prisma db push` against production. Test-database names must contain `test` for the automated harness.

## Authentication failures

Separate Firebase verification failures from local-user lookup and status failures. Check token audience and issuer, service-account configuration, clock drift, Firebase UID linkage, and local account status.

Do not request tokens or service-account JSON from users in support messages.

## Payment incidents

Compare Stripe session, payment intent, invoice, webhook event, local payment, local subscription, and user plan. Provider data is authoritative for money movement; local data controls application access.

Replay webhooks only after confirming idempotency. Never create a second successful payment record to work around a missing subscription.

## Upload incidents

Check file signature rejection, size and count limits, Cloudinary credentials, storage folder, provider quota, and database rollback behavior. Preserve the original file only through approved secure channels.

## AI extraction incidents

Check configured model availability, quota, provider authentication, supported file type, request size, parse failures, and latency. Disable extraction gracefully rather than blocking document access.

## Email and reminder incidents

Confirm reminder preferences, date windows, timezone, warranty status, scheduler execution, SMTP credentials, provider acceptance, and deduplication keys.

Avoid manually resending to the entire user population until scope and duplicate behavior are known.

## Report incidents

Check query validation, ownership filters, dataset size, memory usage, content headers, binary stream completion, and special characters. Verify both PDF and Excel because their generators fail differently.

## Security incident basics

For suspected credential exposure, rotate the credential, revoke sessions where appropriate, inspect access logs, identify affected data, preserve evidence, and follow organizational notification policy.

Do not place secrets or personal data in public issue trackers.

## Safe mitigations

- Roll back a recent deployment.
- Disable an optional provider feature through approved configuration.
- Reduce export range or upload size temporarily.
- Pause a scheduled job that is producing duplicates.
- Block a compromised account through audited administration.

Every mitigation needs an owner, expiry or reversal condition, and verification step.

## Verification matrix

| Area | Minimum recovery check |
| --- | --- |
| Authentication | Sign in, sync, and load profile. |
| Assets | Create, list, view, and update one test asset. |
| Documents | Upload and retrieve a synthetic supported file. |
| Claims | Create and advance a synthetic claim. |
| Billing | Read plans and a test subscription; use Stripe test mode for writes. |
| Notifications | Read count and mark a synthetic item. |
| Reports | Download and open one PDF and Excel workbook. |
| Admin | Confirm ordinary denial and administrator success. |

## Post-incident review

Record timeline, detection, impact, root cause, contributing conditions, successful and unsuccessful mitigations, recovery evidence, and action items. Assign owners and deadlines.

Prefer automated prevention: tests, health checks, alerts, validation, idempotency, safer defaults, and clearer runbooks.

## Change checklist

Operational changes should update deployment documentation, environment examples, monitoring, rollback steps, security implications, test coverage, and this runbook in the same pull request.
