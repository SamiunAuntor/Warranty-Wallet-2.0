const { z } = require("zod");

const createNotificationSchema = z.object({
    body: z.object({
        title: z.string().min(2).max(100),

        message: z.string().min(2),

        type: z.enum([
            "REMINDER",
            "PAYMENT",
            "SUBSCRIPTION",
            "SYSTEM",
        ]),
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