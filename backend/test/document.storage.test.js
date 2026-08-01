const test = require("node:test");
const assert = require("node:assert/strict");

const { getDocumentFolder } = require("../src/modules/document/document.storage");

test("PDF purchase records use the structured PDF folder", () => {
    assert.equal(getDocumentFolder({ mimetype: "application/pdf", productId: "asset_123", type: "INVOICE" }), "WarrantyWallet/pdfs/invoice/asset_123");
});

test("product evidence uses the structured condition-photo folder", () => {
    assert.equal(getDocumentFolder({ mimetype: "image/jpeg", productId: "asset_123", type: "PRODUCT_IMAGE" }), "WarrantyWallet/images/condition-photos/asset_123");
});

test("image receipts remain separate from condition evidence", () => {
    assert.equal(getDocumentFolder({ mimetype: "image/webp", productId: "asset_123", type: "RECEIPT" }), "WarrantyWallet/images/receipt/asset_123");
});
