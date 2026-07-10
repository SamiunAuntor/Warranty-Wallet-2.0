const { z } = require("zod");

const createNotificationSchema = z.object({
    body: z.object({
        title: z.string().min(2).max(100),

        message: z.string().min(2),

        type: z.enum([
            "WARRANTY_REMINDER",
            "WARRANTY_EXPIRED",
            "PAYMENT_SUCCESS",
            "SUBSCRIPTION",
            "SYSTEM",
            "ADMIN",
        ]),

        metadata: z.any().optional(),
    }),
});

const notificationIdSchema = z.object({
    params: z.object({
        id: z.string().cuid(),
    }),
});

module.exports = {
    createNotificationSchema,
    notificationIdSchema,
};