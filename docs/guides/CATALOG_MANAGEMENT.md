# Category and Brand Catalog Guide

## Purpose

Categories and brands normalize reusable asset metadata. Public reads support asset forms, while administrator mutations keep naming and active-state policy controlled.

## Routes

| Method | Route | Authorization |
| --- | --- | --- |
| `GET` | `/api/v1/categories` | Public |
| `POST` | `/api/v1/categories` | Admin |
| `PATCH` | `/api/v1/categories/:id` | Admin |
| `DELETE` | `/api/v1/categories/:id` | Admin |
| `GET` | `/api/v1/brands` | Public |
| `POST` | `/api/v1/brands` | Admin |
| `PATCH` | `/api/v1/brands/:id` | Admin |
| `DELETE` | `/api/v1/brands/:id` | Admin |

Administrator-specific list routes add pagination, search, status filters, sorting, and product counts.

## Naming and slugs

Names and slugs are unique. Slug generation lowercases text, removes accents while preserving base letters, collapses punctuation and whitespace, and trims separators.

Do not silently attach two distinct catalog entries to the same slug. Return a conflict that allows an administrator to choose a new name or reactivate an existing entry.

## Active state

Delete endpoints deactivate catalog entries rather than removing referenced rows. Existing assets retain their relationships. Public catalogs should normally expose only active choices.

Reactivation can be implemented as an update to `isActive`; it should preserve stable identifiers and relationships.

## Brand representation

Assets keep both a textual brand and an optional normalized brand reference. This supports historical or uncommon values while enabling managed catalog options.

Changes to a brand display name should not rewrite historic asset text unless an explicit migration policy exists.

## Category representation

Every asset requires a category relationship. Deactivation must therefore preserve the category row for existing assets and reports.

## Search and sorting

Administrator search covers names and descriptions; brand search may include website URL. Sort fields are allowlisted. Pagination metadata uses the same active/search filter as the data query.

## Public-client caching

Catalog reads change infrequently and may be cached. Administrator mutations must invalidate relevant public and admin query keys.

Do not cache authorization-dependent administrator results under a public key.

## Error handling

- Duplicate name or slug: `CONFLICT`.
- Invalid URL or short name: `VALIDATION_FAILED`.
- Ordinary-user mutation: `FORBIDDEN`.
- Missing entry: `NOT_FOUND`.
- Deactivation with existing assets: succeed without breaking relationships.

## Test checklist

Cover public reads, admin denial, creation, slug normalization, accents, punctuation, duplicate conflicts, updates, website validation, deactivation, reactivation, product counts, search, sorting, and inactive filtering.

## Operational cleanup

Before merging duplicate catalog entries, identify all referencing assets, choose the surviving entry, migrate references transactionally, deactivate the duplicate, and record the action.

## Maintenance rules

Catalog-field changes require Prisma, validation, public and admin serializers, frontend form options, typed contracts, OpenAPI schemas, search behavior, seed data, and integration tests.
