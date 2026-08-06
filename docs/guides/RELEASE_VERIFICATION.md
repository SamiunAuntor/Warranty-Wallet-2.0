# Release Verification Checklist

## Objective

Use this checklist before promoting a release and after deployment. Record evidence for each applicable item rather than marking an unverified assumption as complete.

## Source and build

- Confirm the deployed commit matches the approved branch.
- Confirm the working tree was clean when the release was built.
- Review dependency and lockfile changes.
- Run backend unit tests.
- Run PostgreSQL integration suites.
- Run frontend TypeScript compilation.
- Run frontend linting.
- Build the production frontend bundle.
- Confirm Prisma Client generation succeeds.
- Review CI logs for skipped or retried checks.

## Configuration

- Confirm frontend and backend API URLs match the environment.
- Confirm the database host and name are correct.
- Confirm test-auth flags are absent outside tests.
- Confirm Firebase service-account configuration decodes successfully.
- Confirm Stripe key and webhook secret belong to the same mode.
- Confirm Cloudinary account and folder policy.
- Confirm Gemini model and API key.
- Confirm SMTP sender and credentials.
- Confirm allowed browser origins.
- Confirm scheduled-job authentication secrets.

## Database

- Back up production before destructive schema changes.
- Review schema changes for data compatibility.
- Confirm indexes cover new filters and relations.
- Verify connection limits for the deployment platform.
- Confirm schema synchronization completed once.
- Check startup logs for Prisma errors.
- Verify a read-only query through the application.

## Authentication smoke test

- Register or sign in with a test account.
- Synchronize the local user.
- Load the current profile.
- Refresh the page and retain the session.
- Sign out and confirm protected navigation is blocked.
- Verify an ordinary account cannot open an admin API.
- Verify a designated admin can open the admin dashboard.

## Core workflow smoke test

- Create a synthetic asset.
- Find it through list search.
- Update a non-sensitive field.
- Upload a small synthetic supported document.
- Open document metadata.
- Create a claim with that document as evidence.
- Advance the claim status.
- Verify dashboard totals changed.
- Delete the test records through supported behavior.

## Billing smoke test

- Load public plan definitions.
- Load current subscription and payment history.
- Use only Stripe test mode for checkout verification.
- Confirm success and cancel redirects.
- Confirm webhook signature validation.
- Confirm one provider event creates one local effect.

## Reports

- Download a product PDF.
- Download an Excel workbook.
- Open both files in standard readers.
- Verify attachment filenames and extensions.
- Verify ordinary users cannot access admin reports.
- Test a report with no matching rows.

## Security

- Inspect defensive response headers.
- Verify configured CORS origin succeeds.
- Verify an unknown origin fails.
- Confirm rate-limit headers are present.
- Confirm secrets do not appear in client bundles.
- Confirm errors do not expose database or provider internals.
- Confirm upload signature validation is active.

## Observability

- Confirm application logs arrive in the expected destination.
- Confirm timestamps and environment tags are correct.
- Confirm health monitoring targets the deployed API.
- Confirm alert recipients are current.
- Check error rate, latency, and database connections after release.

## Rollback readiness

- Identify the previous healthy deployment.
- Confirm rollback authority and procedure.
- Determine whether schema changes are backward compatible.
- Preserve provider configuration from the previous release.
- Define the metric or symptom that triggers rollback.

## Sign-off record

Record release commit, environment, verifier, start and completion times, failed checks, accepted risks, follow-up issues, and final promotion decision.
