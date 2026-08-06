# AI Extraction

The AI module extracts suggested purchase fields from owned documents. Uploaded content and model output are both untrusted.

The workflow authenticates the user, verifies document ownership and type, sends constrained multimodal input to the configured Gemini model, parses a strict schema, stores extraction metadata, and returns fields for review.

Never execute document instructions or treat extracted dates, amounts, vendor names, or warranty terms as confirmed data. Low-confidence output must not trigger billing, warranty, or notification changes automatically.

Provider keys remain backend-only. Logs may include document ID, model, duration, and outcome, but not tokens, document bytes, or unrestricted provider output.

## Failure policy

- Reject unsupported types before provider calls.
- Map missing owned documents to `NOT_FOUND`.
- Treat model availability, quota, and timeout failures as provider errors.
- Reject malformed structured output without overwriting existing metadata.
- Retry only transient failures with bounded backoff.

Document data may contain personal and purchase information. Review provider retention and processing settings before production use.

Unit tests mock the provider and cover model selection, multimodal input, parsing, malformed output, unavailable models, timeouts, and safe error mapping. Sandbox tests use synthetic documents and remain opt-in.

Prompt or model changes require regression fixtures, schema and privacy review, observability, user-review behavior, and rollback planning.
