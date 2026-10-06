const { z } = require("zod");

// Native apps pass the deep link that Stripe should eventually return to.
const MOBILE_RETURN_SCHEMES = ["warrantywallet:", "exp:", "exps:"];
const isMobileReturnUrl = (value) => {
    try {
        return MOBILE_RETURN_SCHEMES.includes(new URL(value).protocol);
    } catch {
        return false;
    }
};
const mobileReturnUrl = z.string().trim().max(500).refine(isMobileReturnUrl, "Return URL must use the Warranty Wallet app scheme.");

const checkoutSchema = z.object({
    body: z.object({
        plan: z.enum(["PLUS", "PRO"]),
        returnUrl: mobileReturnUrl.optional(),
    }),
});
const mobileReturnSchema = z.object({
    query: z.object({
        status: z.enum(["success", "cancel"]),
        session_id: z.string().trim().max(255).optional(),
        redirect: mobileReturnUrl,
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
    mobileReturnSchema,
    confirmCheckoutSchema,
    changePlanSchema,
};
