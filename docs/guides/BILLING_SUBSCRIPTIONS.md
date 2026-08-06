# Billing and Subscriptions

The billing domain exposes plans, creates Stripe Checkout sessions, confirms payment, records history, and projects subscription state into application access.

| Plan | Price | Asset limit |
| --- | ---: | ---: |
| Basic | 0 | 5 |
| Plus | 5 | 100 |
| Pro | 20 | 500 |

Checkout validates the target plan, creates a hosted Stripe session, and returns its URL. After redirect, the backend retrieves the session and verifies ownership, paid state, and plan metadata before transactionally updating payment, subscription, and user plan.

Never activate access from the browser success URL alone.

Provider identifiers make confirmation and webhook processing idempotent. Webhooks verify signatures against the raw body and record event IDs to prevent duplicate side effects.

Upgrades may require immediate payment. Downgrades and cancellation normally take effect at period end; resume reverses pending cancellation while allowed.

Payment history and subscription reads are user scoped. Administrator payment routes are read-only and role protected.

Test plan definitions, checkout configuration, session ownership, paid status, history isolation, subscription projection, upgrade, downgrade, cancel, resume, provider errors, and event idempotency. Live-provider tests remain opt-in and use Stripe test mode.
