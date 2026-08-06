# Billing and Subscription Guide

## Scope

The billing domain exposes plan definitions, creates Stripe Checkout sessions, confirms successful sessions, records payments, maintains subscription state, and applies asset limits through the user's active plan.

## Plan model

| Plan | Monthly price | Asset limit | Checkout eligible |
| --- | ---: | ---: | --- |
| Basic | 0 | 5 | No |
| Plus | 5 | 100 | Yes |
| Pro | 20 | 500 | Yes |

Prices and limits come from backend constants. Frontend display constants must remain synchronized, but the backend is authoritative.

## Checkout sequence

1. The client requests checkout for Plus or Pro.
2. The backend validates the target plan and current subscription.
3. Stripe creates a hosted Checkout session with user and plan metadata.
4. The client redirects to the returned provider URL.
5. Stripe redirects the browser to the configured success page.
6. The client confirms the session identifier with the backend.
7. The backend retrieves the session directly from Stripe.
8. Ownership, paid status, and plan metadata are verified.
9. Payment, subscription, and user plan update transactionally.

Never activate a plan solely because the browser reached a success URL.

## Payment records

Payments preserve Stripe session, intent, invoice, amount, currency, method, plan, status, and ownership. Provider identifiers are unique to make confirmation and webhook processing idempotent.

## Subscription state

Subscriptions track current plan, pending or scheduled plan, provider identifiers, billing period, cancellation intent, and active status. The local record is a projection of provider state used for application authorization.

## Plan changes

An upgrade may require immediate provider action and return a payment URL. A downgrade is normally scheduled for the end of the current billing period so paid access remains available until then.

Cancellation sets end-of-period intent rather than immediately removing access. Resume reverses that intent while the provider subscription remains recoverable.

## Webhook requirements

Webhook signature verification must use the raw request body. Process events idempotently using the unique Stripe event ID. Store processing state so retries do not duplicate payments, notifications, or subscription changes.

## Authorization

Payment history and subscription routes are scoped to the authenticated user. Administrator payment routes are separately role protected and may search across users.

## Error handling

- Invalid plan: `VALIDATION_FAILED` or a documented domain error.
- Duplicate active plan: reject without contacting Stripe.
- Unpaid session: `PAYMENT_FAILED`.
- Session owned by another user: deny confirmation.
- Provider outage: `PAYMENT_PROVIDER_ERROR` with no raw secret details.
- Missing local subscription: return `null` for read operations when documented.

## Idempotency and transactions

Confirmation and webhook paths may race. Unique provider identifiers and database transactions must ensure one successful payment and one effective subscription update.

## Test strategy

Unit tests mock Stripe to cover checkout configuration, ownership, paid status, upgrade, downgrade, cancel, resume, and provider errors. Database integration tests cover plan reads, user-scoped history, subscription projection, pagination, filters, and administrator views without network calls.

Provider sandbox tests should be opt-in and use dedicated test-mode products, prices, customers, and webhook secrets.

## Operational checklist

- Verify success and cancel URLs per environment.
- Verify webhook secrets independently from API keys.
- Compare local subscription state with Stripe before manual repair.
- Never edit payment history to conceal provider discrepancies.
- Keep currency casing and amount units consistent.
- Audit failed webhook events and retry safely.

## Maintenance rules

Plan changes require backend constants, frontend plan display, Stripe configuration, asset-limit tests, checkout tests, OpenAPI examples, deployment variables, and billing documentation to change together.
