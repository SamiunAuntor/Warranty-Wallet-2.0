const test = require("node:test");
const assert = require("node:assert/strict");

require("dotenv").config();

const claimRepository = require("../src/modules/claim/claim.repository");
const productRepository = require("../src/modules/product/product.repository");
const claimService = require("../src/modules/claim/claim.service");

const user = {
    id: "user-1",
    role: "USER",
};

test("claim creation requires ownership of the selected asset", async (t) => {
    const originalFindProduct = productRepository.findById;
    productRepository.findById = async () => ({
        id: "asset-1",
        userId: "another-user",
    });
    t.after(() => {
        productRepository.findById = originalFindProduct;
    });

    await assert.rejects(
        claimService.createClaim(user, {
            productId: "asset-1",
            title: "Broken display",
            issueDescription: "The display no longer turns on.",
        }),
        (error) => error.statusCode === 403
    );
});

test("claim attachments must belong to the claim asset", async (t) => {
    const originalFindProduct = productRepository.findById;
    const originalFindDocuments = claimRepository.findDocuments;

    productRepository.findById = async () => ({
        id: "asset-1",
        userId: user.id,
    });
    claimRepository.findDocuments = async () => [{
        id: "document-1",
        userId: user.id,
        productId: "asset-2",
    }];
    t.after(() => {
        productRepository.findById = originalFindProduct;
        claimRepository.findDocuments = originalFindDocuments;
    });

    await assert.rejects(
        claimService.createClaim(user, {
            productId: "asset-1",
            title: "Broken display",
            issueDescription: "The display no longer turns on.",
            documentIds: ["document-1"],
        }),
        (error) => error.statusCode === 403
    );
});

test("claim creation records status, ownership, and unique documents", async (t) => {
    const originalFindProduct = productRepository.findById;
    const originalFindDocuments = claimRepository.findDocuments;
    const originalCreate = claimRepository.create;
    let received;

    productRepository.findById = async () => ({
        id: "asset-1",
        userId: user.id,
    });
    claimRepository.findDocuments = async () => [{
        id: "document-1",
        userId: user.id,
        productId: "asset-1",
    }];
    claimRepository.create = async (payload, documentIds) => {
        received = { payload, documentIds };
        return received;
    };
    t.after(() => {
        productRepository.findById = originalFindProduct;
        claimRepository.findDocuments = originalFindDocuments;
        claimRepository.create = originalCreate;
    });

    await claimService.createClaim(user, {
        productId: "asset-1",
        title: "Broken display",
        issueDescription: "The display no longer turns on.",
        status: "SUBMITTED",
        documentIds: ["document-1", "document-1"],
    });

    assert.equal(received.payload.userId, user.id);
    assert.equal(received.payload.status, "SUBMITTED");
    assert.match(received.payload.claimNumber, /^CLM-/);
    assert.deepEqual(received.documentIds, ["document-1"]);
    assert.ok(received.payload.filedAt instanceof Date);
});

test("claim details enforce claim ownership", async (t) => {
    const originalFindClaim = claimRepository.findById;
    claimRepository.findById = async () => ({
        id: "claim-1",
        userId: "another-user",
    });
    t.after(() => {
        claimRepository.findById = originalFindClaim;
    });

    await assert.rejects(
        claimService.getClaim("claim-1", user),
        (error) => error.statusCode === 403
    );
});

test("users cannot perform administrator claim transitions", async (t) => {
    const originalFindClaim = claimRepository.findById;
    claimRepository.findById = async () => ({
        id: "claim-1",
        userId: user.id,
        status: "SUBMITTED",
        documents: [],
    });
    t.after(() => {
        claimRepository.findById = originalFindClaim;
    });

    await assert.rejects(
        claimService.updateClaim("claim-1", user, { status: "UNDER_REVIEW" }),
        (error) => error.statusCode === 403
    );
});

test("invalid claim transitions are rejected for administrators", async (t) => {
    const originalFindClaim = claimRepository.findById;
    claimRepository.findById = async () => ({
        id: "claim-1",
        userId: user.id,
        status: "SUBMITTED",
        documents: [],
    });
    t.after(() => {
        claimRepository.findById = originalFindClaim;
    });

    await assert.rejects(
        claimService.updateClaim("claim-1", { id: "admin-1", role: "ADMIN" }, { status: "RESOLVED" }),
        (error) => error.statusCode === 409
    );
});

test("users can submit their own draft claim", async (t) => {
    const originalFindClaim = claimRepository.findById;
    const originalUpdate = claimRepository.update;
    let received;
    claimRepository.findById = async () => ({
        id: "claim-1",
        userId: user.id,
        status: "DRAFT",
        documents: [],
    });
    claimRepository.update = async (_claim, payload) => {
        received = payload;
    };
    t.after(() => {
        claimRepository.findById = originalFindClaim;
        claimRepository.update = originalUpdate;
    });

    await claimService.updateClaim("claim-1", user, { status: "SUBMITTED" });
    assert.equal(received.status, "SUBMITTED");
    assert.ok(received.filedAt instanceof Date);
});
