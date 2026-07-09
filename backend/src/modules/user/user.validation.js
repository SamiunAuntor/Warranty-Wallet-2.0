const { z } = require("zod");

const syncUserSchema = z.object({
    body: z.object({
        firebaseUid: z.string(),
        name: z.string().min(2),
        email: z.string().email(),
        photo: z.string().optional(),
    }),
});

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
        photo: z.string().optional(),
    }),
});

module.exports = {
    syncUserSchema,
    updateProfileSchema,
};