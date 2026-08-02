const { z } = require("zod");

const checkoutSchema = z.object({
    body: z.object({
        plan: z.enum(["PLUS", "PRO"]),
    }),
});

const confirmCheckoutSchema = z.object({
    body: z.object({
        sessionId: z.string().trim().min(1),
    }),
});

module.exports = {
    checkoutSchema,
    confirmCheckoutSchema,
};
