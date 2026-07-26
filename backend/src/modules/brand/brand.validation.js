const { z } = require("zod");

const fields = {
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500).nullable().optional(),
    websiteUrl: z.string().url().nullable().optional(),
    isActive: z.boolean().optional(),
};

const createBrandSchema = z.object({ body: z.object(fields) });
const updateBrandSchema = z.object({
    body: z.object({
        name: fields.name.optional(),
        description: fields.description,
        websiteUrl: fields.websiteUrl,
        isActive: fields.isActive,
    }).refine((body) => Object.keys(body).length > 0, "At least one field is required."),
});

module.exports = { createBrandSchema, updateBrandSchema };
