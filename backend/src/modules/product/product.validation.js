const { z } = require("zod");

const createProductSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(150),

        brand: z.string().trim().min(2).max(80),

        model: z.string().optional(),

        serialNumber: z.string().optional(),

        categoryId: z.string().cuid(),

        purchasePrice: z.coerce.number().positive(),

        purchaseDate: z.coerce.date(),

        warrantyDuration: z
            .number()
            .int()
            .positive(),

        warrantyType: z.enum([
            "MANUFACTURER",
            "EXTENDED",
        ]),

        sellerName: z.string().optional(),

        sellerPhone: z.string().optional(),

        sellerAddress: z.string().optional(),

        productImage: z.string().optional(),

        notes: z.string().optional(),
    }),
});

const updateProductSchema = z.object({
    body: createProductSchema.shape.body.partial(),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
};