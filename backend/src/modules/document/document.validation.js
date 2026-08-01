const { z } = require("zod");

const DOCUMENT_TYPES = [
    "INVOICE",
    "WARRANTY_CARD",
    "PRODUCT_IMAGE",
    "RECEIPT",
    "OTHER",
];

const createDocumentSchema = z.object({
    body: z.object({
        type: z.enum(DOCUMENT_TYPES),
        extractedData: z.string().max(10000).optional(),
    }),

    params: z.object({
        productId: z.string().cuid(),
    }),
});

const documentIdSchema = z.object({
    params: z.object({
        id: z.string().cuid(),
    }),
});

const listDocumentsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
        search: z.string().trim().max(150).optional(),
        type: z.enum(DOCUMENT_TYPES).optional(),
        productId: z.string().cuid().optional(),
    }),
});

module.exports = {
    createDocumentSchema,

    documentIdSchema,

    listDocumentsSchema,
};
