const { z } = require("zod");

const CLAIM_STATUSES = [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "RESOLVED",
    "CANCELLED",
];

const claimIdParams = z.object({
    id: z.string().cuid(),
});

const createClaimSchema = z.object({
    body: z.object({
        productId: z.string().cuid(),
        title: z.string().trim().min(3).max(150),
        issueDescription: z.string().trim().min(10).max(3000),
        serviceCenter: z.string().trim().max(200).optional(),
        status: z.enum(["DRAFT", "SUBMITTED"]).optional(),
        documentIds: z.array(z.string().cuid()).max(20).optional(),
    }),
});

const listClaimsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
        search: z.string().trim().max(150).optional(),
        status: z.enum(CLAIM_STATUSES).optional(),
        productId: z.string().cuid().optional(),
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
    createClaimSchema,
    listClaimsSchema,
    claimIdSchema,
    updateClaimSchema,
    timelineEventSchema,
    attachDocumentSchema,
    detachDocumentSchema,
};
