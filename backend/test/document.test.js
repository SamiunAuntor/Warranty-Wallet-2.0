const test = require("node:test");
const assert = require("node:assert/strict");

require("dotenv").config();

const documentRepository = require("../src/modules/document/document.repository");
const productRepository = require("../src/modules/product/product.repository");
const documentService = require("../src/modules/document/document.service");

const user = {
    id: "user-1",
    role: "USER",
};

test("document uploads require ownership of the selected asset", async (t) => {
    const originalFindProduct = productRepository.findById;
    productRepository.findById = async () => ({
        id: "asset-1",
        userId: "another-user",
    });
    t.after(() => {
        productRepository.findById = originalFindProduct;
    });

    await assert.rejects(
        documentService.uploadDocuments({
            user,
            productId: "asset-1",
            files: [{ originalname: "receipt.pdf" }],
            type: "RECEIPT",
        }),
        (error) => error.statusCode === 403
    );
});

test("document uploads reject spoofed file contents", async (t) => {
    const originalFindProduct = productRepository.findById;
    productRepository.findById = async () => ({
        id: "asset-1",
        userId: user.id,
    });
    t.after(() => {
        productRepository.findById = originalFindProduct;
    });

    await assert.rejects(
        documentService.uploadDocuments({
            user,
            productId: "asset-1",
            files: [{
                originalname: "fake.pdf",
                mimetype: "application/pdf",
                buffer: Buffer.from("not a real pdf"),
            }],
            type: "OTHER",
        }),
        (error) => error.statusCode === 400 && error.message.includes("contents")
    );
});

test("assets accept no more than three purchase documents", async (t) => {
    const originalFindProduct = productRepository.findById;
    const originalCountByTypes = documentRepository.countByTypes;
    productRepository.findById = async () => ({ id: "asset-1", userId: user.id });
    documentRepository.countByTypes = async () => 3;
    t.after(() => {
        productRepository.findById = originalFindProduct;
        documentRepository.countByTypes = originalCountByTypes;
    });

    await assert.rejects(
        documentService.uploadDocuments({
            user,
            productId: "asset-1",
            files: [{ mimetype: "application/pdf", buffer: Buffer.from("%PDF demo") }],
            type: "RECEIPT",
        }),
        (error) => error.statusCode === 409 && error.message.includes("three") === false && error.message.includes("3")
    );
});

test("assets accept no more than three condition photos", async (t) => {
    const originalFindProduct = productRepository.findById;
    const originalCountByType = documentRepository.countByType;
    productRepository.findById = async () => ({ id: "asset-1", userId: user.id });
    documentRepository.countByType = async () => 3;
    t.after(() => {
        productRepository.findById = originalFindProduct;
        documentRepository.countByType = originalCountByType;
    });

    await assert.rejects(
        documentService.uploadDocuments({
            user,
            productId: "asset-1",
            files: [{ mimetype: "image/jpeg", buffer: Buffer.from([0xff, 0xd8, 0xff]) }],
            type: "PRODUCT_IMAGE",
        }),
        (error) => error.statusCode === 409 && error.message.includes("condition photos")
    );
});

test("document listing is restricted to the current user", async (t) => {
    const originalFindMany = documentRepository.findMany;
    const originalCount = documentRepository.count;
    let receivedWhere;

    documentRepository.findMany = async ({ where }) => {
        receivedWhere = where;
        return [];
    };
    documentRepository.count = async () => 0;
    t.after(() => {
        documentRepository.findMany = originalFindMany;
        documentRepository.count = originalCount;
    });

    const result = await documentService.listDocuments(user, {
        page: "1",
        limit: "12",
        search: "invoice",
        type: "INVOICE",
        productId: "asset-1",
    });

    assert.equal(receivedWhere.userId, user.id);
    assert.equal(receivedWhere.productId, "asset-1");
    assert.equal(receivedWhere.fileType, "INVOICE");
    assert.ok(receivedWhere.OR);
    assert.equal(result.meta.total, 0);
});

test("document details enforce ownership", async (t) => {
    const originalFindDocument = documentRepository.findById;
    documentRepository.findById = async () => ({
        id: "document-1",
        product: {
            userId: "another-user",
        },
    });
    t.after(() => {
        documentRepository.findById = originalFindDocument;
    });

    await assert.rejects(
        documentService.getDocument("document-1", user),
        (error) => error.statusCode === 403
    );
});

test("replacement requires a new file before modifying storage", async (t) => {
    const originalFindDocument = documentRepository.findById;
    documentRepository.findById = async () => ({
        id: "document-1",
        publicId: "old-public-id",
        fileType: "RECEIPT",
        product: {
            userId: user.id,
        },
    });
    t.after(() => {
        documentRepository.findById = originalFindDocument;
    });

    await assert.rejects(
        documentService.replaceDocument({
            id: "document-1",
            user,
            file: undefined,
        }),
        (error) => error.statusCode === 400
    );
});
