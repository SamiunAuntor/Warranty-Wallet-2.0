const { z } = require("zod");

const productBody = z.object({
    name: z.string().trim().min(2).max(150),
    brand: z.string().trim().min(2).max(80),
    model: z.string().trim().max(120).optional(),
    serialNumber: z.string().trim().max(150).optional(),
    categoryId: z.string().cuid(),
    purchasePrice: z.coerce.number().positive(),
    purchaseDate: z.coerce.date(),
    hasWarranty: z.boolean(),
    warrantyDuration: z.number().int().positive().nullable().optional(),
    warrantyType: z.enum(["MANUFACTURER", "EXTENDED"]).nullable().optional(),
    lifecycleStatus: z.enum(["ADDED", "ARCHIVED"]).optional(),
    sellerName: z.string().trim().max(150).optional(),
    sellerPhone: z.string().trim().max(50).optional(),
    sellerAddress: z.string().trim().max(500).optional(),
    productImageUrl: z.string().url().optional().or(z.literal("")),
    notes: z.string().trim().max(3000).optional(),
}).superRefine((body, context) => {
    if (body.hasWarranty && !body.warrantyDuration) {
        context.addIssue({
            code: "custom",
            path: ["warrantyDuration"],
            message: "Warranty duration is required when the asset has a warranty.",
        });
    }

    if (body.hasWarranty && !body.warrantyType) {
        context.addIssue({
            code: "custom",
            path: ["warrantyType"],
            message: "Warranty type is required when the asset has a warranty.",
        });
    }

    if (!body.hasWarranty && (body.warrantyDuration || body.warrantyType)) {
        context.addIssue({
            code: "custom",
            path: ["hasWarranty"],
            message: "Warranty details must be empty when the asset has no warranty.",
        });
    }
});

const createProductSchema = z.object({
    body: productBody,
});

const updateProductSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(150).optional(),
        brand: z.string().trim().min(2).max(80).optional(),
        model: z.string().trim().max(120).nullable().optional(),
        serialNumber: z.string().trim().max(150).nullable().optional(),
        categoryId: z.string().cuid().optional(),
        purchasePrice: z.coerce.number().positive().optional(),
        purchaseDate: z.coerce.date().optional(),
        hasWarranty: z.boolean().optional(),
        warrantyDuration: z.number().int().positive().nullable().optional(),
        warrantyType: z.enum(["MANUFACTURER", "EXTENDED"]).nullable().optional(),
        lifecycleStatus: z.enum(["ADDED", "ARCHIVED"]).optional(),
        sellerName: z.string().trim().max(150).nullable().optional(),
        sellerPhone: z.string().trim().max(50).nullable().optional(),
        sellerAddress: z.string().trim().max(500).nullable().optional(),
        productImageUrl: z.string().url().nullable().optional().or(z.literal("")),
        notes: z.string().trim().max(3000).nullable().optional(),
    }).refine((body) => Object.keys(body).length > 0, {
        message: "At least one field is required.",
    }),
});

module.exports = {
    createProductSchema,
    updateProductSchema,
};
