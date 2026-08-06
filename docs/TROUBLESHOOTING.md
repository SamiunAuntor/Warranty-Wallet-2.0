# Troubleshooting

## Frontend does not start

### `next` is not recognized

Dependencies are missing. Run `npm install` inside `frontend` and confirm `frontend/node_modules/.bin/next` exists.

### Package lock is out of sync

Run `npm install` with the supported Node/npm version, review the lockfile diff, and commit the manifest and lockfile together when dependencies changed intentionally.

### Turbopack watches the wrong directory

Next.js detects roots from lockfiles. This project explicitly sets `turbopack.root` to the frontend directory. Preserve that setting if a parent directory also contains a lockfile.

### Google font download warning

Local network restrictions may prevent `next/font` from reaching Google. Next.js uses the fallback font in development. For fully offline builds, replace the remote font with bundled local font files.

## Frontend opens but authentication fails

- Confirm `frontend/.env.local` exists.
- Check all required `NEXT_PUBLIC_FIREBASE_*` values.
- Add `localhost` and deployed domains to Firebase authorized domains.
- Restart the frontend after changing environment variables.
- Verify browser time is correct because token validation depends on timestamps.

If Firebase succeeds but the session immediately signs out, inspect the `/users/sync` request and backend logs. The provider intentionally signs out when application-user synchronization fails.

## API does not start

- Run `npm install` in `backend`.
- Generate Prisma Client with `npx prisma generate`.
- Confirm `backend/.env` exists.
- Check that the configured port is available.
- Inspect configuration-specific errors before changing application code.

## Database failures

### Prisma cannot connect

- Verify the host, port, database, username, and password.
- Confirm the database permits the current network.
- Add the provider's required TLS parameters.
- Check whether the connection limit is exhausted.

### Prisma Client is stale

Run `npx prisma generate` after schema or package changes. Apply migrations before using fields introduced by a newer schema.

## CORS errors

`CLIENT_URL` is a comma-separated allow-list. Values must exactly match the browser origin, including protocol and port. Add both production and preview origins when previews need API access.

Do not solve a credentialed CORS problem by allowing every origin.

## Upload failures

- Use field `files` for multi-document uploads and `file` for single uploads.
- Keep each file below 5 MB.
- Use JPEG, PNG, WebP, or PDF.
- Confirm file contents match the declared MIME type.
- Verify Cloudinary credentials and account limits.
- Confirm the authenticated user owns the selected asset.

When replacement fails, verify the new upload succeeded before investigating deletion of the previous object.

## Gemini extraction failures

- Verify `GEMINI_API_KEY` and the configured model.
- Use a supported image or PDF.
- Check provider quota and model availability.
- Inspect the sanitized service error rather than logging document contents.
- Confirm the response contains valid JSON matching expected invoice fields.

AI extraction is assistive. Users should always review values before asset creation.

## Stripe checkout or subscription issues

- Use matching test-mode frontend and backend configuration.
- Confirm the checkout request uses `PLUS` or `PRO`.
- Verify success/cancel URLs use an allowed frontend origin.
- Forward Stripe CLI events to `/api/v1/webhooks/stripe` locally.
- Use the webhook secret printed for the active forwarding session.
- Confirm the webhook route receives a raw body.
- Check stored webhook event and payment identifiers for duplicate delivery.

Do not manually mark a payment successful based only on the browser redirect.

## Email is not delivered

- Check SMTP host, port, username, and application password.
- Confirm the sender is allowed by the provider.
- Review spam and sandbox restrictions.
- Verify TLS requirements for the selected port.
- Test with a controlled recipient before sending broadcasts.

## Scheduled reminders do not run

Development uses `node-cron` only when `NODE_ENV=development`. Production uses the protected cron endpoint. Check the runtime mode, Vercel Cron configuration, authorization secret, timezone assumptions, and user preference thresholds.

## Tests fail unexpectedly

- Use Node.js 24.x.
- Install backend dependencies.
- Run one suite with `node --test test/name.test.js`.
- Check for shared mocks that were not restored.
- Avoid loading provider configuration before mocks are installed.
- Confirm no test points at production services.
