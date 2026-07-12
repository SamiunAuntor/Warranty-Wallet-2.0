const { z } = require("zod");

const syncUserSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        photoURL: z.string().optional(),
    }),
});

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
        photoURL: z.string().optional(),
    }),
});

module.exports = {
    syncUserSchema,
    updateProfileSchema,
};