const { z } = require("zod");

const { CLAIM_STATUS, CLAIM_RESOLUTION_OUTCOME, CLAIM_RECORD_TYPE, CLAIM_SERVICE_PURPOSE } = require("./claim.constant");
const CLAIM_STATUSES = Object.values(CLAIM_STATUS);
const CLAIM_RESOLUTION_OUTCOMES = Object.values(CLAIM_RESOLUTION_OUTCOME);
const CLAIM_RECORD_TYPES = Object.values(CLAIM_RECORD_TYPE);
const CLAIM_SERVICE_PURPOSES = Object.values(CLAIM_SERVICE_PURPOSE);
const evidenceItem = z.object({
    documentId: z.string().cuid(),
    evidenceType: z.enum(["SUPPORTING_DOCUMENT", "CONDITION_PHOTO", "DAMAGE_PHOTO", "SERVICE_RECEIPT", "ESTIMATE", "INSPECTION_REPORT", "CORRESPONDENCE", "OTHER"]),
    note: z.string().trim().max(500).optional(),
});

const claimIdParams = z.object({
    id: z.string().cuid(),
});

const createClaimSchema = z.object({
    body: z.object({
        productId: z.string().cuid(),
        recordType: z.enum(CLAIM_RECORD_TYPES).default("WARRANTY_CLAIM"),
        parentClaimId: z.string().cuid().optional(),
        title: z.string().trim().min(3).max(150),
        issueDescription: z.string().trim().min(10).max(3000),
        serviceCenter: z.string().trim().max(200).optional(),
        servicePurpose: z.enum(CLAIM_SERVICE_PURPOSES).optional(),
        serviceDate: z.coerce.date().optional(),
        providerReference: z.string().trim().max(200).optional(),
        submittedCondition: z.string().trim().max(3000).optional(),
        userCost: z.coerce.number().min(0).max(9999999999).optional(),
        resolution: z.string().trim().max(3000).optional(),
        resolutionOutcome: z.enum(CLAIM_RESOLUTION_OUTCOMES).optional(),
        status: z.enum(["DRAFT", "SUBMITTED", "RESOLVED"]).optional(),
        documentIds: z.array(z.string().cuid()).max(20).optional(),
        evidence: z.array(evidenceItem).max(20).optional(),
    }).superRefine((body, context) => {
        if (body.recordType === "SERVICE_RECORD" && !body.servicePurpose) context.addIssue({ code: "custom", path: ["servicePurpose"], message: "Service purpose is required." });
        if (body.status === "RESOLVED" && (!body.resolutionOutcome || !body.resolution)) context.addIssue({ code: "custom", path: ["resolution"], message: "Completed records require an outcome and summary." });
        if (body.recordType === "WARRANTY_CLAIM" && body.status === "RESOLVED") context.addIssue({ code: "custom", path: ["status"], message: "A formal claim cannot be completed when it is first created." });
    }),
});

const listClaimsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
        search: z.string().trim().max(150).optional(),
        status: z.enum(CLAIM_STATUSES).optional(),
        productId: z.string().cuid().optional(),
        recordType: z.enum(CLAIM_RECORD_TYPES).optional(),
    }),
});

const claimIdSchema = z.object({
    params: claimIdParams,
});

const updateClaimSchema = z.object({
    params: claimIdParams,
    body: z.object({
        title: z.string().trim().min(3).max(150).optional(),
        issueDescription: z.string().trim().min(10).max(3000).optional(),
        serviceCenter: z.string().trim().max(200).nullable().optional(),
        resolution: z.string().trim().max(3000).nullable().optional(),
        resolutionOutcome: z.enum(CLAIM_RESOLUTION_OUTCOMES).nullable().optional(),
        status: z.enum(CLAIM_STATUSES).optional(),
    }).refine((body) => Object.keys(body).length > 0, {
        message: "At least one field is required.",
    }),
});

const timelineEventSchema = z.object({
    params: claimIdParams,
    body: z.object({
        title: z.string().trim().min(2).max(150),
        description: z.string().trim().max(2000).optional(),
        status: z.enum(CLAIM_STATUSES).optional(),
    }),
});

const attachDocumentSchema = z.object({
    params: claimIdParams,
    body: z.object({
        documentId: z.string().cuid(),
        evidenceType: evidenceItem.shape.evidenceType.default("SUPPORTING_DOCUMENT"),
        note: z.string().trim().max(500).optional(),
    }),
});

const detachDocumentSchema = z.object({
    params: z.object({
        id: z.string().cuid(),
        documentId: z.string().cuid(),
    }),
});

module.exports = {
    CLAIM_STATUSES,
    CLAIM_RESOLUTION_OUTCOMES,
    createClaimSchema,
    listClaimsSchema,
    claimIdSchema,
    updateClaimSchema,
    timelineEventSchema,
    attachDocumentSchema,
    detachDocumentSchema,
};
