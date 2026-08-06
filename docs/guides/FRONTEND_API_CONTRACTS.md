# Frontend API Contract Guide

## Purpose

The frontend contract layer gives components a stable, typed view of backend envelopes, domain enums, pagination, and errors. It also centralizes authentication headers and response parsing.

## Core files

- `src/lib/api-contracts.ts` defines shared response and domain types.
- `src/lib/api-client.ts` implements JSON transport and typed errors.
- Domain API files expose task-oriented functions to pages and components.

Components should not call `fetch` directly when an API client exists.

## Success envelopes

A standard success response contains `success`, `message`, `data`, and optional `meta`. The generic contract separates data and metadata so list clients preserve pagination types.

Use `apiRequest<T>` when only response data is needed. Use `apiRequestEnvelope<T, M>` when pagination or other metadata is required.

## Error envelopes

An error response contains `success: false`, human-readable `message`, stable `code`, and optional structured `details`.

`ApiClientError` preserves HTTP status, code, message, and details. UI code can branch through helpers for authentication, authorization, validation, and retryability.

Do not convert typed API errors into plain `Error` in domain clients because that discards actionable metadata.

## Request behavior

The shared client:

- prefixes the configured API base URL;
- adds bearer authentication when supplied;
- defaults cache behavior to `no-store`;
- adds JSON content type for JSON-compatible bodies;
- avoids forcing JSON headers on multipart or binary bodies;
- safely handles missing or non-JSON error payloads;
- maps HTTP status to a fallback stable code;
- rejects malformed success envelopes.

## Domain types

Prefer shared enum unions for roles, plans, statuses, document types, claim states, and warranty states. Avoid redefining similar unions in each domain file.

Dates travel as ISO strings. Money may arrive as string or number because database decimals must preserve precision.

## Authentication

Domain functions accept a token rather than importing Firebase state. This keeps transport testable and separates identity acquisition from API behavior.

Callers should obtain a fresh token through the auth context and retry at most once after an authentication failure.

## Pagination

List clients return `{ data, meta }`. Components should use server-provided `totalPages` and must not infer total count from the current page length.

Encode query values with `URLSearchParams`. Omit undefined and empty values so validation receives only intentional filters.

## Multipart requests

Pass `FormData` directly and let the browser set the multipart boundary. Manually assigning `Content-Type: multipart/form-data` without a boundary breaks parsing.

## Cache invalidation

Mutation success should invalidate all affected read models, not only the current page. Examples:

- asset mutation: assets, dashboard, warranty, categories;
- claim mutation: claims, claim detail, asset detail, dashboard;
- notification mutation: notification list and unread count;
- billing mutation: subscription, payments, plan-limited asset UI;
- profile preference mutation: profile, settings, formatted dashboard data.

## Error presentation

Messages are suitable for a general fallback. Validation details support field-level errors. Authentication codes drive session recovery. Retryable database or provider failures should preserve user input.

Avoid displaying raw provider or database messages.

## Migration checklist

When migrating an older client:

1. Import the shared request function.
2. Remove local API URL and envelope types.
3. Preserve the domain function's public return shape.
4. Pass token through the typed request options.
5. Use the envelope variant for paginated calls.
6. Confirm multipart behavior.
7. Compile all consumers.
8. Test failure-code handling.

## Test checklist

Cover success data, pagination metadata, JSON errors, non-JSON errors, network failures, fallback codes, explicit codes, validation details, bearer headers, FormData, empty responses, and invalid envelopes.

## Maintenance rules

Backend response changes require shared contract updates, relevant domain client updates, component compilation, OpenAPI changes, integration assertions, and a compatibility decision for deployed older frontends.
