const crypto = require("node:crypto");
const claimRepository = require("./claim.repository");
const productRepository = require("../product/product.repository");
const ApiError = require("../../utils/ApiError");
const { pagination } = require("../../utils/query");
const { CLAIM_TRANSITIONS, TERMINAL_CLAIM_STATUSES } = require("./claim.constant");
const notificationService = require("../notification/notification.service");
const EVIDENCE_EDITABLE_STATUSES = ["DRAFT", "SUBMITTED"];

const claimNumber = () =>
    `CLM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

const assertProductOwnership = async (productId, user) => {
    const product = await productRepository.findById(productId);

    if (!product) throw new ApiError(404, "Asset not found.");
    if (product.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(403, "You do not own this asset.");
    }

    return product;
};

const assertClaimOwnership = async (id, user) => {
    const claim = await claimRepository.findById(id);

    if (!claim) throw new ApiError(404, "Claim not found.");
    if (claim.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(403, "You do not have permission to access this claim.");
    }

    return claim;
};

const validateDocuments = async (documentIds, productId, user) => {
    const uniqueIds = [...new Set(documentIds)];
    if (uniqueIds.length === 0) return uniqueIds;

    const documents = await claimRepository.findDocuments(uniqueIds);
    if (documents.length !== uniqueIds.length) {
        throw new ApiError(404, "One or more documents were not found.");
    }

    const invalid = documents.some((document) =>
        document.productId !== productId ||
        (document.userId !== user.id && user.role !== "ADMIN")
    );
    if (invalid) {
        throw new ApiError(403, "Claims can only use documents belonging to the selected asset.");
    }

    return uniqueIds;
};

const assertStatusTransition = (claim, nextStatus, user) => {
    if (!nextStatus || nextStatus === claim.status) return;
    if (!CLAIM_TRANSITIONS[claim.status]?.includes(nextStatus)) {
        throw new ApiError(409, `A claim cannot move from ${claim.status} to ${nextStatus}.`);
    }
    if (user.role !== "ADMIN") {
        const userCanSubmit = claim.status === "DRAFT" && nextStatus === "SUBMITTED";
        const userCanCancel = nextStatus === "CANCELLED";
        if (!userCanSubmit && !userCanCancel) {
            throw new ApiError(403, "Only an administrator can perform this claim status transition.");
        }
    }
};

const createClaim = async (user, payload) => {
    await assertProductOwnership(payload.productId, user);
    if (payload.recordType === "SERVICE_RECORD" && !payload.servicePurpose) {
        throw new ApiError(400, "Service purpose is required.");
    }
    if (payload.recordType === "SERVICE_RECORD" && (!payload.resolutionOutcome || !payload.resolution?.trim())) {
        throw new ApiError(400, "A service record requires its outcome and summary.");
    }
    if (payload.recordType === "WARRANTY_CLAIM" && payload.status === "RESOLVED") {
        throw new ApiError(400, "A formal claim cannot be completed when it is first created.");
    }
    if (payload.parentClaimId) {
        const parent = await assertClaimOwnership(payload.parentClaimId, user);
        if (parent.productId !== payload.productId) throw new ApiError(400, "A follow-up must belong to the same asset as the original record.");
    }
    const evidence = payload.evidence || (payload.documentIds || []).map((documentId) => ({ documentId, evidenceType: "SUPPORTING_DOCUMENT" }));
    const documentIds = await validateDocuments(evidence.map((item) => item.documentId), payload.productId, user);
    const uniqueEvidence = documentIds.map((documentId) => evidence.find((item) => item.documentId === documentId));
    const status = payload.status || (payload.recordType === "SERVICE_RECORD" ? "RESOLVED" : "DRAFT");

    return claimRepository.create({
        claimNumber: claimNumber(),
        userId: user.id,
        productId: payload.productId,
        recordType: payload.recordType,
        parentClaimId: payload.parentClaimId,
        title: payload.title,
        issueDescription: payload.issueDescription,
        serviceCenter: payload.serviceCenter,
        servicePurpose: payload.servicePurpose,
        serviceDate: payload.serviceDate,
        providerReference: payload.providerReference,
        submittedCondition: payload.submittedCondition,
        userCost: payload.userCost,
        resolution: payload.resolution,
        resolutionOutcome: payload.resolutionOutcome,
        status,
        ...(status === "SUBMITTED" && { filedAt: new Date() }),
        ...(status === "RESOLVED" && { resolvedAt: new Date() }),
    }, uniqueEvidence);
};

const getClaims = async (user, query) => {
    const { skip, take, page, limit } = pagination(query);
    const where = {
        ...(user.role !== "ADMIN" && { userId: user.id }),
        ...(query.status && { status: query.status }),
        ...(query.productId && { productId: query.productId }),
        ...(query.recordType && { recordType: query.recordType }),
        ...(query.search && {
            OR: [
                { claimNumber: { contains: query.search, mode: "insensitive" } },
                { title: { contains: query.search, mode: "insensitive" } },
                { product: { name: { contains: query.search, mode: "insensitive" } } },
            ],
        }),
    };
    const [claims, total] = await Promise.all([
        claimRepository.list({ where, skip, take }),
        claimRepository.count(where),
    ]);

    return {
        data: claims,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getClaim = (id, user) => assertClaimOwnership(id, user);

const updateClaim = async (id, user, payload) => {
    const claim = await assertClaimOwnership(id, user);
    assertStatusTransition(claim, payload.status, user);
    if (TERMINAL_CLAIM_STATUSES.includes(claim.status)) {
        throw new ApiError(409, "A completed claim can no longer be edited.");
    }
    if ((payload.resolution !== undefined || payload.resolutionOutcome !== undefined) && user.role !== "ADMIN") {
        throw new ApiError(403, "Only an administrator can record a claim resolution.");
    }
    if (user.role !== "ADMIN" && !EVIDENCE_EDITABLE_STATUSES.includes(claim.status)) {
        const changedIssueDetails = ["title", "issueDescription", "serviceCenter"].some((field) => payload[field] !== undefined);
        if (changedIssueDetails) throw new ApiError(409, "Issue details are locked after claim review begins.");
    }
    if (payload.status === "RESOLVED" && (!payload.resolutionOutcome || !payload.resolution?.trim())) {
        throw new ApiError(400, "A completion outcome and resolution summary are required.");
    }
    if (payload.status === "REJECTED" && !payload.resolution?.trim()) {
        throw new ApiError(400, "A reason is required when declining a claim.");
    }
    const update = {
        ...payload,
        ...(payload.status === "SUBMITTED" && !claim.filedAt && { filedAt: new Date() }),
        ...(
            payload.status &&
            ["RESOLVED", "REJECTED", "CANCELLED"].includes(payload.status) &&
            { resolvedAt: new Date() }
        ),
        ...(
            payload.status &&
            !["RESOLVED", "REJECTED", "CANCELLED"].includes(payload.status) &&
            { resolvedAt: null }
        ),
    };
    await claimRepository.update(claim, update);
    if (payload.status && payload.status !== claim.status && user.role === "ADMIN") {
        await notificationService.notifyClaimStatus({ userId: claim.userId, claimId: claim.id, claimNumber: claim.claimNumber, status: payload.status });
    }
    return assertClaimOwnership(id, user);
};

const deleteClaim = async (id, user) => {
    const claim = await assertClaimOwnership(id, user);
    if (user.role !== "ADMIN" && !["DRAFT", "CANCELLED"].includes(claim.status)) {
        throw new ApiError(409, "Only draft or cancelled claims can be deleted.");
    }
    await claimRepository.remove(id);
};

const addTimelineEvent = async (id, user, payload) => {
    const claim = await assertClaimOwnership(id, user);
    if (TERMINAL_CLAIM_STATUSES.includes(claim.status)) {
        throw new ApiError(409, "A completed claim can no longer receive timeline updates.");
    }
    assertStatusTransition(claim, payload.status, user);
    if (["RESOLVED", "REJECTED"].includes(payload.status)) {
        throw new ApiError(400, "Complete or decline the claim through the structured resolution action.");
    }
    if (user.role !== "ADMIN" && payload.status && payload.status !== "CANCELLED") {
        throw new ApiError(403, "Only an administrator can update claim progress.");
    }
    await claimRepository.addTimelineEvent(id, payload);
    if (payload.status && payload.status !== claim.status && user.role === "ADMIN") {
        await notificationService.notifyClaimStatus({ userId: claim.userId, claimId: claim.id, claimNumber: claim.claimNumber, status: payload.status });
    }
    return assertClaimOwnership(id, user);
};

const attachDocument = async (id, user, evidence) => {
    const claim = await assertClaimOwnership(id, user);
    const normalizedEvidence = typeof evidence === "string" ? { documentId: evidence, evidenceType: "SUPPORTING_DOCUMENT" } : evidence;
    const { documentId } = normalizedEvidence;
    await validateDocuments([documentId], claim.productId, user);

    if (claim.documents.some((item) => item.documentId === documentId)) {
        throw new ApiError(409, "This document is already attached to the claim.");
    }

    await claimRepository.attachDocument(id, { ...normalizedEvidence, claimStage: claim.status });
    return assertClaimOwnership(id, user);
};

const detachDocument = async (id, user, documentId) => {
    const claim = await assertClaimOwnership(id, user);
    if (claim.status !== "DRAFT") {
        throw new ApiError(409, "Submitted claim evidence is immutable. Add a corrected file instead.");
    }
    if (!claim.documents.some((item) => item.documentId === documentId)) {
        throw new ApiError(404, "Attached document not found.");
    }
    await claimRepository.detachDocument(id, documentId);
    return assertClaimOwnership(id, user);
};

module.exports = {
    createClaim,
    getClaims,
    getClaim,
    updateClaim,
    deleteClaim,
    addTimelineEvent,
    attachDocument,
    detachDocument,
};
