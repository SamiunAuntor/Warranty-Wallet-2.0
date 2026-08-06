# API Request Examples

These examples use the local API at `http://localhost:5000/api/v1`. Replace placeholder identifiers and tokens with values from your own development environment.

## Shell variables

Bash:

```bash
API_URL="http://localhost:5000/api/v1"
TOKEN="firebase-id-token"
```

PowerShell:

```powershell
$ApiUrl = "http://localhost:5000/api/v1"
$Token = "firebase-id-token"
```

Never paste a real token into committed files, screenshots, issues, or shared terminal transcripts.

## Health check

```bash
curl "$API_URL/health"
```

Example response:

```json
{
  "success": true,
  "message": "Warranty Wallet API is healthy.",
  "environment": "development",
  "timestamp": "2026-08-07T00:00:00.000Z"
}
```

## Synchronize a Firebase user

The frontend obtains a Firebase ID token and sends it with the synchronization request.

```bash
curl -X POST "$API_URL/users/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo User",
    "photoURL": "https://example.com/avatar.png"
  }'
```

The verified Firebase token supplies the UID, email, and verification state. The request body cannot select another Firebase identity.

## Read and update the profile

```bash
curl "$API_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X PATCH "$API_URL/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Student",
    "phone": "+8801700000000"
  }'
```

## Update preferences

```bash
curl -X PATCH "$API_URL/users/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "warrantyReminders": true,
    "reminderDays": [30, 14, 3],
    "timezone": "Asia/Dhaka",
    "currency": "BDT",
    "dateFormat": "DD_MM_YYYY"
  }'
```

## List catalog values

Categories and brands are public lookup endpoints.

```bash
curl "$API_URL/categories"
curl "$API_URL/brands"
```

## Create an asset

```bash
curl -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "brand": "Sony",
    "model": "WH-1000XM6",
    "serialNumber": "DEMO-0001",
    "categoryId": "category-cuid",
    "purchasePrice": 44990,
    "purchaseDate": "2026-08-01",
    "hasWarranty": true,
    "warrantyDuration": 12,
    "warrantyType": "MANUFACTURER",
    "sellerName": "Example Electronics",
    "sellerEmail": "support@example.com",
    "notes": "Course demonstration record"
  }'
```

The API calculates `expiryDate` and `warrantyStatus`. Clients should not attempt to override server-derived warranty state.

## Search and paginate assets

```bash
curl "$API_URL/products?page=1&limit=10&search=headphones&sortBy=purchaseDate&sortOrder=desc" \
  -H "Authorization: Bearer $TOKEN"
```

Page size is capped by the backend. Unknown sorting fields should be rejected or ignored according to endpoint validation.

## Update an asset

```bash
curl -X PATCH "$API_URL/products/product-cuid" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerPhone": "+8801800000000",
    "notes": "Added seller contact details"
  }'
```

## Upload purchase documents

Use field name `files` for this multi-file route. The request may include up to the configured per-asset and per-request limits.

```bash
curl -X POST "$API_URL/products/product-cuid/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=RECEIPT" \
  -F "files=@./sample-receipt.pdf;type=application/pdf"
```

Supported media types are PDF, JPEG, PNG, and WebP. File contents must match the declared MIME type.

## Upload condition evidence

```bash
curl -X POST "$API_URL/products/product-cuid/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=PRODUCT_IMAGE" \
  -F "files=@./condition-front.jpg;type=image/jpeg" \
  -F "files=@./condition-back.jpg;type=image/jpeg"
```

## List documents

```bash
curl "$API_URL/documents?page=1&limit=20&productId=product-cuid" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl "$API_URL/products/product-cuid/documents" \
  -H "Authorization: Bearer $TOKEN"
```

## Replace a document

The single replacement field is named `file`.

```bash
curl -X PATCH "$API_URL/documents/document-cuid" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./corrected-receipt.pdf;type=application/pdf"
```

## Extract invoice information

```bash
curl -X POST "$API_URL/ai/extract-invoice" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./sample-receipt.pdf;type=application/pdf"
```

Example extracted data:

```json
{
  "productName": "Wireless Headphones",
  "brand": "Sony",
  "purchaseDate": "2026-08-01",
  "purchasePrice": 44990,
  "sellerName": "Example Electronics",
  "invoiceNumber": "INV-DEMO-100",
  "warrantyDuration": 12
}
```

Extraction can be incomplete or incorrect. Validate and present the result for human review before asset creation.

## Create a claim

```bash
curl -X POST "$API_URL/claims" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-cuid",
    "title": "Left speaker stopped working",
    "issueDescription": "Audio became intermittent and then stopped.",
    "serviceCenter": "Example Authorized Service",
    "submittedCondition": "No visible physical damage",
    "documentIds": ["document-cuid"]
  }'
```

## Add a claim timeline entry

```bash
curl -X POST "$API_URL/claims/claim-cuid/timeline" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Service center accepted the item",
    "description": "Inspection is expected within three business days."
  }'
```

## Attach and detach claim evidence

```bash
curl -X POST "$API_URL/claims/claim-cuid/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "document-cuid",
    "evidenceType": "SUPPORTING_DOCUMENT",
    "note": "Original purchase receipt"
  }'
```

```bash
curl -X DELETE "$API_URL/claims/claim-cuid/documents/document-cuid" \
  -H "Authorization: Bearer $TOKEN"
```

## Read notifications

```bash
curl "$API_URL/notifications?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X PATCH "$API_URL/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN"
```

## Start checkout

```bash
curl -X POST "$API_URL/payments/create-checkout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"PLUS"}'
```

The returned Stripe URL is a customer-action URL. Navigate the browser to it; do not attempt to call it as an API endpoint.

## Confirm checkout

```bash
curl -X POST "$API_URL/payments/confirm-checkout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"cs_test_example"}'
```

The backend verifies session ownership and paid status with Stripe before applying plan access.

## Change or cancel a plan

```bash
curl -X POST "$API_URL/payments/change-plan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"PRO"}'
```

```bash
curl -X POST "$API_URL/payments/cancel-subscription" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -X POST "$API_URL/payments/resume-subscription" \
  -H "Authorization: Bearer $TOKEN"
```

## Export a report

```bash
curl "$API_URL/reports/products?format=PDF&status=ACTIVE" \
  -H "Authorization: Bearer $TOKEN" \
  --output products-report.pdf
```

```bash
curl "$API_URL/reports/payments?format=EXCEL&from=2026-01-01&to=2026-12-31" \
  -H "Authorization: Bearer $TOKEN" \
  --output payments-report.xlsx
```

## Administrator example

The token must belong to a synchronized administrator.

```bash
curl "$API_URL/admin/users?page=1&limit=20&status=ACTIVE&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

```bash
curl -X POST "$API_URL/admin/notifications" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Scheduled maintenance",
    "message": "The service will be unavailable for ten minutes.",
    "type": "SYSTEM"
  }'
```

## PowerShell upload example

Recent PowerShell versions support `-Form`:

```powershell
$Headers = @{ Authorization = "Bearer $Token" }
$Form = @{
  file = Get-Item ".\sample-receipt.pdf"
}
Invoke-RestMethod -Method Post `
  -Uri "$ApiUrl/ai/extract-invoice" `
  -Headers $Headers `
  -Form $Form
```

## Safe debugging

When a request fails, capture the method, path, status code, sanitized response message, and correlation time. Do not record bearer tokens, document contents, database connection strings, signed Stripe payloads, or provider credentials.
