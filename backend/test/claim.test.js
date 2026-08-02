const test = require("node:test");
const assert = require("node:assert/strict");
require("dotenv").config();
const claimRepository = require("../src/modules/claim/claim.repository");
const productRepository = require("../src/modules/product/product.repository");
const claimService = require("../src/modules/claim/claim.service");
const user = { id: "user-1", role: "USER" };

test("claim creation requires asset ownership", async (t) => {
    const original = productRepository.findById; productRepository.findById = async () => ({ id: "asset-1", userId: "other" }); t.after(() => { productRepository.findById = original; });
    await assert.rejects(claimService.createClaim(user, { productId: "asset-1", title: "Broken display", issueDescription: "The display no longer turns on." }), (error) => error.statusCode === 403);
});

test("a new claim is submitted and preserves unique asset documents", async (t) => {
    const findProduct = productRepository.findById; const findDocuments = claimRepository.findDocuments; const create = claimRepository.create; let received;
    productRepository.findById = async () => ({ id: "asset-1", userId: user.id });
    claimRepository.findDocuments = async () => [{ id: "document-1", userId: user.id, productId: "asset-1" }];
    claimRepository.create = async (payload, evidence) => { received = { payload, evidence }; return received; };
    t.after(() => { productRepository.findById = findProduct; claimRepository.findDocuments = findDocuments; claimRepository.create = create; });
    await claimService.createClaim(user, { productId: "asset-1", title: "Broken display", issueDescription: "The display no longer turns on.", documentIds: ["document-1", "document-1"] });
    assert.equal(received.payload.status, "SUBMITTED"); assert.ok(received.payload.filedAt instanceof Date); assert.deepEqual(received.evidence, [{ documentId: "document-1", evidenceType: "SUPPORTING_DOCUMENT" }]);
});

test("users can update the status of their own claim", async (t) => {
    const find = claimRepository.findById; const update = claimRepository.update; let received;
    claimRepository.findById = async () => ({ id: "claim-1", userId: user.id, status: "SUBMITTED", resolution: null, documents: [] });
    claimRepository.update = async (_claim, payload) => { received = payload; return payload; };
    t.after(() => { claimRepository.findById = find; claimRepository.update = update; });
    await claimService.updateClaim("claim-1", user, { status: "IN_PROGRESS" }); assert.equal(received.status, "IN_PROGRESS");
});

test("closing a claim requires a note", async (t) => {
    const find = claimRepository.findById; claimRepository.findById = async () => ({ id: "claim-1", userId: user.id, status: "IN_PROGRESS", resolution: null, documents: [] }); t.after(() => { claimRepository.findById = find; });
    await assert.rejects(claimService.updateClaim("claim-1", user, { status: "RESOLVED" }), (error) => error.statusCode === 400);
});

test("claim evidence must belong to the selected asset", async (t) => {
    const findProduct = productRepository.findById; const findDocuments = claimRepository.findDocuments;
    productRepository.findById = async () => ({ id: "asset-1", userId: user.id }); claimRepository.findDocuments = async () => [{ id: "document-1", userId: user.id, productId: "asset-2" }];
    t.after(() => { productRepository.findById = findProduct; claimRepository.findDocuments = findDocuments; });
    await assert.rejects(claimService.createClaim(user, { productId: "asset-1", title: "Broken display", issueDescription: "The display no longer turns on.", documentIds: ["document-1"] }), (error) => error.statusCode === 403);
});
