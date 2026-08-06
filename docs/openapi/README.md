# OpenAPI Specification

This directory contains the machine-readable OpenAPI 3.1 description for the Warranty Wallet API.

## Entry point

Use [`openapi.yaml`](./openapi.yaml) as the entry document. It references reusable components and domain path files with relative `$ref` values.

```text
openapi/
├── openapi.yaml
├── components/
│   ├── parameters.yaml
│   ├── responses.yaml
│   └── schemas.yaml
└── paths/
    ├── admin.yaml
    ├── ai.yaml
    ├── catalog.yaml
    ├── claims.yaml
    ├── dashboard.yaml
    ├── documents.yaml
    ├── engagement.yaml
    ├── health.yaml
    ├── operations.yaml
    ├── payments.yaml
    ├── products.yaml
    ├── reports.yaml
    └── users.yaml
```

## Validation

Validate the complete description with Redocly CLI:

```bash
npx --yes @redocly/cli lint docs/openapi/openapi.yaml
```

The recommended rules currently report warnings for intentional local/example server URLs and public operations that have no meaningful 4xx response. The specification must have zero validation errors before it is committed.

## Bundle into one file

Some tools do not follow external references. Create a single bundled document:

```bash
npx --yes @redocly/cli bundle docs/openapi/openapi.yaml \
  --output docs/openapi/dist/openapi.yaml
```

The bundled output is generated documentation. Prefer validating the modular source and decide explicitly whether bundled artifacts belong in a release.

## Preview locally

Build an HTML reference page:

```bash
npx --yes @redocly/cli build-docs docs/openapi/openapi.yaml \
  --output docs/openapi/dist/index.html
```

Alternatively, import `openapi.yaml` into Swagger Editor, Postman, Insomnia, Bruno, or another OpenAPI 3.1-compatible client.

## Authentication

Protected endpoints use the `FirebaseBearer` security scheme. Supply a Firebase ID token through the standard bearer header:

```http
Authorization: Bearer <firebase-id-token>
```

Administrator endpoints use the same scheme and additionally require the synchronized database user to have role `ADMIN`.

Public endpoints explicitly declare `security: []`. The Stripe webhook uses its own signature header rather than Firebase authentication.

## Source of truth

The Express routes and Zod schemas are the implementation source of truth:

- Routes: `backend/src/**/*.route.js`
- Validation: `backend/src/**/*.validation.js`
- Persistence: `backend/prisma/schema.prisma`
- Error mapping: `backend/src/utils/errorMapper.js`

When implementation and OpenAPI disagree, verify the running behavior and correct the specification in the same change.

## Maintenance checklist

When adding or changing an endpoint:

1. Update the matching domain path file.
2. Add or update request schemas and examples.
3. Document authentication, role, and ownership requirements.
4. Include success and expected failure responses.
5. Update reusable domain schemas when response fields change.
6. Check that operation IDs remain globally unique.
7. Run the Redocly validation command.
8. Update human-readable API examples when the workflow changes.

## Modeling conventions

- Database CUIDs are represented as strings.
- Dates use `format: date`; timestamps use `format: date-time`.
- Prisma decimal values may serialize as numbers or strings, so response schemas permit both where necessary.
- Nullable fields use OpenAPI 3.1 JSON Schema types such as `type: [string, "null"]`.
- User-owned paths document Firebase authentication even when ownership is also enforced in a repository query.
- Administrator paths explicitly mention role enforcement.
- Binary reports define both PDF and XLSX media types.
- Multipart upload schemas use `format: binary`.
- Provider callbacks describe their provider-specific verification rather than Firebase security.

## Known operational concern

The current `/cron/warranty` Express route has no token or scheduler-secret check. The specification documents that behavior rather than claiming protection that is not implemented. Production deployments should secure the route and then update its OpenAPI security definition.

## Generated clients

OpenAPI generators can create typed clients, but generated code should be reviewed before replacing the handwritten frontend API modules. Confirm URL construction, bearer-token injection, multipart handling, binary downloads, and the shared response envelope.

Do not commit generated clients merely to increase repository size. Commit them only when the application imports them and the generation command is reproducible.
