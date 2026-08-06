# Environment Configuration

## File locations

- Backend development values: `backend/.env`
- Frontend development values: `frontend/.env.local`
- Templates: `backend/.env.example` and `frontend/.env.example`

Environment files containing real values are intentionally ignored by Git.

## Backend runtime

### `NODE_ENV`

Use `development` for local work and `production` for deployments. Development starts the in-process reminder scheduler. Production delegates scheduling to Vercel Cron.

### `PORT`

HTTP port for local execution. Defaults to `5000` when omitted.

### `CLIENT_URL`

Comma-separated allowed frontend origins. Include protocol and hostname, without an unnecessary trailing slash.

```env
CLIENT_URL=http://localhost:3000,https://warranty-wallet.example.com
```

## Database

### `DATABASE_URL`

PostgreSQL connection string consumed by Prisma.

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

Use a dedicated database user with only the privileges needed by the application. Production connections should require TLS when supported by the provider.

## Firebase Admin

### `FIREBASE_SERVICE_ACCOUNT_BASE64`

Base64 encoding of the complete service-account JSON object. Encoding is not encryption; treat the value as a private key.

PowerShell example:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
```

Delete local copies of downloaded service-account files when they are no longer needed.

## Cloudinary

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

These values enable product images and documents to be uploaded, replaced, and deleted. The API secret is server-only.

## Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Use test-mode keys locally. The webhook secret belongs to the specific endpoint created by the Stripe CLI or Dashboard and is different from the API secret key.

## Email

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_EMAIL`
- `SMTP_PASSWORD`

Port `587` commonly uses STARTTLS. Provider requirements vary, so use an application password or scoped SMTP credential instead of a personal account password.

## Gemini

- `GEMINI_API_KEY`
- `GEMINI_MODEL`

`GEMINI_MODEL` defaults to the model declared in backend configuration. Pin a supported multimodal model and verify invoice extraction after changing it.

## Frontend API

### `NEXT_PUBLIC_API_URL`

Complete API base including `/api/v1`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Firebase web configuration

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

These public identifiers come from Firebase Console's web-app settings. Firebase security depends on Authentication and backend authorization, not secrecy of these browser values.

## Validation checklist

- Backend starts without configuration parsing errors.
- `/api/v1/health` returns HTTP 200.
- Frontend renders and Firebase initializes.
- Email/password and Google sign-in use an authorized domain.
- Backend CORS accepts the frontend origin.
- Prisma can connect and query.
- Cloudinary upload and delete work in a non-production folder.
- Stripe test checkout returns a URL.
- Stripe CLI webhook events pass signature verification.
- Gemini can process a sample receipt.
- SMTP can send to a controlled test address.

## Rotation

If a secret is exposed, revoke or rotate it at the provider first, update deployment environments, redeploy affected services, and inspect logs for misuse. Removing the secret from the latest Git commit does not remove it from history.
