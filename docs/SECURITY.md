# Security Guide

## Security model

Warranty Wallet uses Firebase for authentication and PostgreSQL records for authorization. Possession of a valid Firebase token establishes identity; it does not by itself grant access to application data. The API loads the synchronized user and applies account status, role, ownership, and plan rules.

## Secrets

Backend secrets belong only in runtime environment variables. This includes database URLs, Firebase Admin service accounts, Cloudinary secrets, Stripe secrets, webhook secrets, SMTP passwords, and Gemini keys.

Frontend `NEXT_PUBLIC_*` values are visible to browsers and must never contain private credentials.

Do not commit:

- `.env` or `.env.local`
- Firebase service-account JSON
- private keys or certificates
- database dumps containing user data
- Stripe webhook payload archives
- email credentials
- copied production logs

## Authentication

Protected requests must include a Firebase ID token in the bearer header. The backend verifies token signature and claims through Firebase Admin, then looks up the application user by Firebase UID.

Rejected conditions include:

- Missing or malformed authorization header
- Invalid or expired Firebase token
- Identity not synchronized to an application user
- Blocked or deleted account

Authentication middleware should never trust a user ID supplied in a request body or query string.

## Authorization

Repositories for user-owned resources include the authenticated database user ID. Checking ownership before upload, replacement, deletion, or claim attachment prevents insecure direct object references.

Administrator middleware checks the local role. Adding an admin page in the frontend is not sufficient; every corresponding API endpoint must enforce the role server-side.

## Upload security

Uploads are held in memory before provider transfer. The API restricts count, size, declared MIME type, and recognized file signatures. Supported content is limited to JPEG, PNG, WebP, and PDF.

Uploaded filenames are metadata, not trusted filesystem paths. Provider public IDs should come from successful upload results rather than raw user input.

Before adding a file format, evaluate parser risk, active content, browser rendering behavior, provider transformations, and download response headers.

## Payment security

The browser must not declare that payment succeeded. Durable payment and subscription state is established from Stripe data after ownership and paid-status verification.

Stripe webhook handling requires:

- Raw request body preservation
- Signature verification with `STRIPE_WEBHOOK_SECRET`
- Idempotency using provider event and session identifiers
- Amount, currency, plan, and customer validation
- Safe handling of repeated and out-of-order events

## AI safety

Invoice content is untrusted input. The Gemini response is parsed into an expected structure and presented for user review. Extracted values must pass the same validation as manually entered values.

Prompts and responses may contain personal purchase information. Avoid logging full files, extracted document content, or provider responses in production.

## Web controls

The API enables Helmet, explicit CORS origins, compression, and rate limiting. Production `CLIENT_URL` should contain only known frontend origins. Avoid wildcard origins with credentialed requests.

Public error responses should be concise. Stack traces, raw database messages, query text, provider secrets, and internal paths belong only in controlled development diagnostics.

## Email and reminders

Template values must be escaped before interpolation into HTML. Reminder jobs should be idempotent so repeated scheduling does not spam users. Email delivery failures must not corrupt the underlying notification record.

## Dependency hygiene

- Commit lockfiles.
- Review security advisories before upgrades.
- Prefer supported runtime and framework versions.
- Remove unused dependencies.
- Never commit `node_modules`.
- Re-run tests after SDK or ORM upgrades.

## Reporting a vulnerability

Do not open a public issue containing an exploit, credential, or real user data. Contact the repository owner privately with the affected component, reproduction steps, impact, and suggested mitigation. Rotate any exposed credential immediately.

## Security review checklist

- Is the endpoint authenticated at the API layer?
- Is role or ownership verified before data access?
- Are all identifiers treated as untrusted input?
- Is request data validated and normalized?
- Can the operation be safely retried?
- Are file limits and signatures checked?
- Are secrets excluded from logs and responses?
- Are provider callbacks cryptographically verified?
- Does the change introduce personal data retention?
- Are tests included for denied access and malformed input?
