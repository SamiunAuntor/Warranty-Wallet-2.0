# Vercel deployment

Deploy this repository as two independent Vercel projects. Both projects use the
same Git branch, but each one has a different root directory.

## 1. Deploy the backend

1. In Vercel, create a new project from this Git repository.
2. Set **Root Directory** to `backend`.
3. Keep the detected **Express** framework and default install/build settings.
4. Set Node.js to `24.x` if Vercel does not select it automatically.
5. Add every variable from `backend/.env.example` to the project:
   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `FIREBASE_SERVICE_ACCOUNT_BASE64`
   - Cloudinary credentials
   - Stripe credentials
   - SMTP credentials
   - `GEMINI_API_KEY`
   - `CRON_SECRET`
6. Initially set `CLIENT_URL` to the frontend URL you expect Vercel to assign.
   After the frontend deploys, replace it with the exact URL. Multiple allowed
   origins can be separated by commas.
7. Deploy and verify:

   ```text
   https://YOUR-BACKEND.vercel.app/api/v1/health
   ```

The backend runs as one Express Vercel Function in `iad1`, close to the current
Neon US East database. A secured Vercel Cron invokes warranty maintenance daily
at midnight UTC. `CRON_SECRET` is automatically sent by Vercel as a bearer token.

Do not run `prisma db push` during every Vercel build. Apply schema changes to
Neon deliberately before deploying:

```bash
cd backend
npx prisma generate
npx prisma db push
```

## 2. Deploy the frontend

1. Create a second Vercel project from the same Git repository.
2. Set **Root Directory** to `frontend`.
3. Keep the detected **Next.js** framework and default build settings.
4. Add every variable from `frontend/.env.example`.
5. Set `NEXT_PUBLIC_API_URL` to:

   ```text
   https://YOUR-BACKEND.vercel.app/api/v1
   ```

6. Deploy the frontend.
7. Copy its exact production URL into the backend project's `CLIENT_URL` and
   redeploy the backend.

`NEXT_PUBLIC_*` values are embedded during the frontend build, so changing one
requires a frontend redeployment.

## 3. External service configuration

- Firebase Authentication: add the frontend `.vercel.app` domain under
  **Authentication > Settings > Authorized domains**.
- Stripe: create a test-mode webhook targeting
  `https://YOUR-BACKEND.vercel.app/api/v1/webhooks/stripe`, then put its signing
  secret in `STRIPE_WEBHOOK_SECRET`.
- Google authentication: verify the deployed domain is accepted by the Firebase
  web application configuration.
- Neon: keep the pooled, SSL-enabled connection string in `DATABASE_URL`.
- Cloudinary/Gemini/SMTP: use test credentials until deployed integration tests
  pass.

## 4. Deployment checks

Test in this order:

1. Backend health endpoint.
2. Landing page and frontend navigation.
3. Email/password registration and Google authentication.
4. Protected dashboard access and database user synchronization.
5. Asset CRUD and the Basic plan's five-asset limit.
6. Document upload, preview, replacement, AI extraction, and deletion.
7. Multiple claims and admin claim transitions.
8. Stripe test checkout and webhook-driven plan update.
9. Notifications and the daily warranty cron logs.
10. Every admin page and report download.

## Vercel upload constraint

Vercel Functions allow a maximum request body of 4.5 MB. The application limits
documents to 4 MB and sends multi-file selections as individual requests. Files
larger than 4 MB will require a future direct-to-Cloudinary signed upload flow.

