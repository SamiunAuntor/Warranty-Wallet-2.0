# AI Document Extraction Guide

## Scope

The AI module extracts structured purchase information from supported document images and PDFs. It is an assistive boundary: provider output is a suggestion and must not silently become trusted financial or warranty data.

## Request lifecycle

1. Authenticate the local user.
2. Validate the extraction request.
3. Resolve the owned document and asset.
4. Confirm the stored file type is supported.
5. Retrieve or reference document content safely.
6. Send a constrained multimodal prompt to the configured Gemini model.
7. Parse provider output into a strict application schema.
8. Store extraction metadata and confidence.
9. Return fields for user review.

## Trust model

Uploaded documents are untrusted. AI provider responses are also untrusted. Treat extracted dates, amounts, vendor names, invoice numbers, and warranty terms as provisional until validated.

Never execute instructions found inside an uploaded document. Prompts should explicitly frame document text as data, not system guidance.

## Structured output

The extraction schema should define nullable fields, date representation, currency, confidence, and evidence. Reject malformed provider output rather than guessing missing structure.

Normalize obvious formatting while preserving original raw output for debugging under appropriate retention policy.

## Model configuration

The model name comes from validated backend configuration. Keep it environment configurable because model availability changes independently of application releases.

Provider API keys remain server-side. Do not expose them through frontend environment variables, error details, logs, or generated reports.

## File handling

Use stored, already validated documents. Enforce size and type limits again when provider constraints differ from upload limits.

Avoid embedding unrestricted private content in logs. When request tracing is necessary, log document ID, model, duration, and outcome rather than document bytes.

## Confidence and review

Confidence values are hints, not guarantees. The frontend should show extracted fields in an editable review step and distinguish user-confirmed data from suggestions.

Low-confidence results should not trigger payment, warranty, or notification changes automatically.

## Failure behavior

- Unsupported type: validation or domain error before provider call.
- Missing owned document: `NOT_FOUND`.
- Provider authentication failure: mapped service error.
- Unavailable model: readable provider error with retry guidance.
- Timeout or quota: retryable provider error.
- Invalid structured response: extraction failure without corrupting existing metadata.

## Retry policy

Retry only transient failures and use bounded exponential backoff. Do not retry validation, authentication, unsupported-type, or malformed-request errors.

Prevent concurrent duplicate extraction for the same document using a state transition, idempotency key, or job lock if extraction becomes asynchronous.

## Privacy

Document data may contain names, addresses, payment information, and serial numbers. Confirm provider data-processing settings and retention expectations before production use.

Provide deletion behavior that considers both stored documents and any persisted raw extraction output.

## Test strategy

Unit tests should mock the provider and verify model selection, multimodal content, schema parsing, unavailable models, malformed output, timeouts, and safe error mapping.

Provider sandbox tests should be optional, use synthetic documents, and never run against user uploads.

## Observability

Measure request count, latency, success rate, parse failure, model-not-found errors, quota errors, and estimated cost. Tag metrics with model and environment, not user document content.

## Maintenance rules

Prompt or model changes require fixture-based regression tests, extraction-schema review, privacy review, environment documentation, user-facing review behavior, and a rollback path.
