const crypto = require("node:crypto");
const claimRepository = require("./claim.repository");
const productRepository = require("../product/product.repository");
const ApiError = require("../../utils/ApiError");
const { pagination } = require("../../utils/query");
const { TERMINAL_CLAIM_STATUSES } = require("./claim.constant");

const createClaimNumber = () => `CLM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

const assertProductOwnership = async (productId, user) => {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Asset not found.");
    if (product.userId !== user.id && user.role !== "ADMIN") throw new ApiError(403, "You do not own this asset.");
    return product;
};

const assertClaimOwnership = async (id, user) => {
    const claim = await claimRepository.findById(id);
    if (!claim) throw new ApiError(404, "Claim not found.");
    if (claim.userId !== user.id && user.role !== "ADMIN") throw new ApiError(403, "You do not have permission to access this claim.");
    return claim;
};

const validateEvidence = async (evidence, productId, user) => {
    const unique = [...new Map(evidence.map((item) => [item.documentId, item])).values()];
    if (!unique.length) return unique;
    const documents = await claimRepository.findDocuments(unique.map((item) => item.documentId));
    if (documents.length !== unique.length) throw new ApiError(404, "One or more documents were not found.");
    if (documents.some((document) => document.productId !== productId || (document.userId !== user.id && user.role !== "ADMIN"))) {
        throw new ApiError(403, "A claim can only use documents belonging to its asset.");
    }
    return unique;
};

const createClaim = async (user, payload) => {
    await assertProductOwnership(payload.productId, user);
    const evidence = payload.evidence || (payload.documentIds || []).map((documentId) => ({ documentId, evidenceType: "SUPPORTING_DOCUMENT" }));
    const validEvidence = await validateEvidence(evidence, payload.productId, user);
    const status = payload.status || "SUBMITTED";
    if (TERMINAL_CLAIM_STATUSES.includes(status) && !payload.resolution?.trim()) throw new ApiError(400, "Add a note before closing a claim.");
    return claimRepository.create({
        claimNumber: createClaimNumber(),
        userId: user.id,
        productId: payload.productId,
        title: payload.title,
        issueDescription: payload.issueDescription,
        serviceCenter: payload.serviceCenter,
        providerReference: payload.providerReference,
        submittedCondition: payload.submittedCondition,
        resolution: payload.resolution,
        status,
        filedAt: new Date(),
        ...(TERMINAL_CLAIM_STATUSES.includes(status) && { resolvedAt: new Date() }),
    }, validEvidence);
};

const listClaims = async (user, query) => {
    const { page, limit, skip, take } = pagination(query);
    const ownership = user.role === "ADMIN" ? {} : { userId: user.id };
    const where = {
        ...ownership,
        ...(query.status && { status: query.status }),
        ...(query.productId && { productId: query.productId }),
        ...(query.search && {
            OR: [
                { claimNumber: { contains: query.search, mode: "insensitive" } },
                { title: { contains: query.search, mode: "insensitive" } },
                { issueDescription: { contains: query.search, mode: "insensitive" } },
                { product: { name: { contains: query.search, mode: "insensitive" } } },
            ],
        }),
    };
    const [data, total] = await Promise.all([claimRepository.list({ where, skip, take }), claimRepository.count(where)]);
    return { data, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
};

const getClaim = (id, user) => assertClaimOwnership(id, user);

const updateClaim = async (id, user, payload) => {
    const claim = await assertClaimOwnership(id, user);
    if (payload.status && TERMINAL_CLAIM_STATUSES.includes(payload.status) && !payload.resolution?.trim() && !claim.resolution?.trim()) {
        throw new ApiError(400, "Add a note before closing a claim.");
    }
    return claimRepository.update(claim, {
        ...payload,
        ...(payload.status && TERMINAL_CLAIM_STATUSES.includes(payload.status) && { resolvedAt: new Date() }),
        ...(payload.status && !TERMINAL_CLAIM_STATUSES.includes(payload.status) && { resolvedAt: null }),
    });
};

const deleteClaim = async (id, user) => { await assertClaimOwnership(id, user); await claimRepository.remove(id); };

const addTimelineEvent = async (id, user, payload) => {
    await assertClaimOwnership(id, user);
    await claimRepository.addTimelineEvent(id, payload);
    return claimRepository.findById(id);
};

const attachDocument = async (id, user, evidence) => {
    const claim = await assertClaimOwnership(id, user);
    const [valid] = await validateEvidence([evidence], claim.productId, user);
    await claimRepository.attachDocument(id, { ...valid, claimStage: claim.status });
    return claimRepository.findById(id);
};

const detachDocument = async (id, documentId, user) => {
    const claim = await assertClaimOwnership(id, user);
    if (!claim.documents.some((item) => item.documentId === documentId)) throw new ApiError(404, "Document is not attached to this claim.");
    await claimRepository.detachDocument(id, documentId);
    return claimRepository.findById(id);
};

module.exports = { createClaim, listClaims, getClaim, updateClaim, deleteClaim, addTimelineEvent, attachDocument, detachDocument };
