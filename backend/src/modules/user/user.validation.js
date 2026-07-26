const { z } = require("zod");

const syncUserSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        photoURL: z.string().optional(),
    }),
});

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(100).optional(),
        phone: z.string().trim().min(7).max(30).nullable().optional(),
        photoURL: z.string().url().nullable().optional(),
    }).refine((body) => Object.keys(body).length > 0, "At least one field is required."),
});

module.exports = {
    syncUserSchema,
    updateProfileSchema,
};
