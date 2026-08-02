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

const changePlanSchema = z.object({
    body: z.object({ plan: z.enum(["PLUS", "PRO"]) }),
});

module.exports = {
    checkoutSchema,
    confirmCheckoutSchema,
    changePlanSchema,
};
