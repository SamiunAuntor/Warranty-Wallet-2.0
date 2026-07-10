const { z } = require("zod");

const createDocumentSchema = z.object({
    body: z.object({
        type: z.enum([
            "INVOICE",
            "WARRANTY_CARD",
            "PRODUCT_IMAGE",
            "RECEIPT",
            "OTHER",
        ]),
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

module.exports = {
    createDocumentSchema,

    documentIdSchema,
};