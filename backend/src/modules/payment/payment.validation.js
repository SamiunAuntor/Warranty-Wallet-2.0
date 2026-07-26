const { z } = require("zod");

const checkoutSchema = z.object({
    body: z.object({
        plan: z.enum(["PLUS", "PRO"]),
    }),
});

module.exports = {
    checkoutSchema,
};
