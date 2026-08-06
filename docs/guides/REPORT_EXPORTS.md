# Report Export Guide

## Purpose

Reports convert project data into PDF or Excel downloads for users and administrators. The report domain owns filtering, ownership, tabular presentation, response headers, and binary streaming.

## Available reports

| Route | Audience | Contents |
| --- | --- | --- |
| `/reports/products` | User | Owned asset inventory. |
| `/reports/warranty` | User | Owned warranty status and dates. |
| `/reports/payments` | User | Owned payment history. |
| `/reports/admin/users` | Admin | Platform user records. |
| `/reports/admin/revenue` | Admin | Platform revenue data. |
| `/reports/admin/categories` | Admin | Catalog category metrics. |

All routes require `format=PDF` or `format=EXCEL`.

## Ownership

User reports receive the authenticated local user and apply ownership in repository queries. Administrator reports require explicit role middleware before any workbook or PDF generation begins.

## HTTP response contract

PDF responses use `application/pdf`, include an attachment filename ending in `.pdf`, and begin with the `%PDF` signature.

Excel responses use the Open XML spreadsheet media type, include an `.xlsx` attachment filename, and produce a ZIP-based workbook beginning with the `PK` signature.

Once binary streaming begins, controllers cannot safely switch to a JSON error response. Complete validation and data loading before writing headers where possible.

## Filtering

Report query validation supports format, optional warranty status, and optional date bounds. Apply the same date interpretation across PDF and Excel paths.

Use half-open or inclusive boundaries consistently and document timezone behavior. Invalid date ranges should fail before querying large datasets.

## PDF design

PDF generation should include report title, generation time, applied filters, readable column widths, repeated headers where supported, and explicit empty-state text.

Long user content must wrap safely. Escape or normalize control characters before placing text into the document.

## Excel design

Workbooks should use stable sheet names, bold headers, sensible widths, typed date and numeric cells, frozen headers for long sheets, and filters where useful.

Do not prefix untrusted text with spreadsheet formula markers. Sanitize values beginning with `=`, `+`, `-`, or `@` when they originate from users.

## Money and dates

Preserve decimal precision for payment and purchase values. Format for display only after retaining the authoritative value. Export timestamps with an explicit timezone or as UTC.

## Performance

Large exports can consume memory because workbook and PDF generation may buffer content. Enforce bounded date ranges or move high-volume exports into background jobs with expiring download links.

## Failure handling

- Missing format: `VALIDATION_FAILED`.
- Unsupported format: `VALIDATION_FAILED`.
- Ordinary user on admin report: `FORBIDDEN`.
- No matching records: return a valid empty report unless documented otherwise.
- Generation failure before streaming: mapped JSON error.
- Failure after streaming starts: log correlation details and close the response.

## Test checklist

Verify role and ownership, both formats, content types, disposition filenames, binary signatures, empty datasets, filters, date boundaries, special characters, formula injection protection, large text wrapping, and provider-independent deterministic output.

## Maintenance rules

When adding a report column, update both PDF and Excel implementations, headers, formatting, width rules, documentation, examples, and binary integration tests.
