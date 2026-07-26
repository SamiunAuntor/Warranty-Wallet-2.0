const { z } = require("zod");

const createCategorySchema = z.object({
    body: z.object({
        name: z
            .string({
                required_error: "Category name is required",
            })
            .trim()
            .min(2)
            .max(50),

        icon: z.string().url().optional(),
        description: z.string().trim().max(500).nullable().optional(),
    }),
});

const updateCategorySchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(50).optional(),
        icon: z.string().url().optional(),
        description: z.string().trim().max(500).nullable().optional(),
        isActive: z.boolean().optional(),
    }),
});

module.exports = {
    createCategorySchema,
    updateCategorySchema,
};
