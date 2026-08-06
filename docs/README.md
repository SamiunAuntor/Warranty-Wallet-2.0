# Documentation Index

This directory contains the project documentation that applies across the frontend and backend.

## Start here

- [Root project guide](../README.md) — overview, local setup, commands, and core workflows.
- [Architecture](./ARCHITECTURE.md) — system boundaries, request lifecycle, layers, and integrations.
- [Domain glossary](./DOMAIN_GLOSSARY.md) — shared product and engineering terminology.

## Development

- [Environment configuration](./ENVIRONMENT.md) — variable purpose, placement, validation, and rotation.
- [Testing guide](./TESTING.md) — existing suites, test patterns, provider isolation, and roadmap.
- [Contributing](./CONTRIBUTING.md) — branches, commits, code expectations, and pull requests.
- [Troubleshooting](./TROUBLESHOOTING.md) — common frontend, backend, database, and provider failures.

## Backend and data

- [API reference](./API_REFERENCE.md) — endpoints, authentication, upload rules, queries, and errors.
- [API examples](./API_EXAMPLES.md) — copy-ready requests for core user and admin workflows.
- [Error catalog](./ERROR_CATALOG.md) — expected failure classes and client behavior.
- [OpenAPI specification](./openapi/README.md) — validated OpenAPI 3.1 source, tooling, and maintenance workflow.
- [Data model](./DATA_MODEL.md) — Prisma entities, relationships, enums, ownership, and migrations.
- [Security guide](./SECURITY.md) — trust boundaries, secrets, authorization, uploads, and payments.

## Operations

- [Deployment checklist](./DEPLOYMENT_CHECKLIST.md) — preflight, provider, smoke-test, and rollback checks.
- [Detailed Vercel guide](../VERCEL_DEPLOYMENT.md) — service-specific Vercel deployment procedure.

## Component documentation

- [Frontend guide](../frontend/README.md) — routes, authentication lifecycle, API clients, styling, and deployment.
- [Backend guide](../backend/README.md) — modules, endpoints, scheduled jobs, reports, and development notes.

## Documentation maintenance

Documentation should change in the same pull request as the behavior it describes. When adding a feature, review at least the root guide, relevant component guide, API reference, environment guide, and testing guide.

Use relative links so documentation remains useful in local clones and Git hosting interfaces. Examples must use fictional identities and placeholder credentials. Never paste production tokens, service-account contents, database URLs, document data, or private provider responses into documentation.

If two documents disagree, treat the implementation and automated tests as the current behavior, then correct the documentation as part of the same change.
