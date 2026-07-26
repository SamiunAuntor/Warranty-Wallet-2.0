const PLAN = Object.freeze({
    BASIC: "BASIC",
    PLUS: "PLUS",
    PRO: "PRO",
});

const PLAN_CONFIG = Object.freeze({
    [PLAN.BASIC]: Object.freeze({
        name: "Basic",
        price: 0,
        assetLimit: 5,
    }),
    [PLAN.PLUS]: Object.freeze({
        name: "Plus",
        price: 5,
        assetLimit: 100,
    }),
    [PLAN.PRO]: Object.freeze({
        name: "Pro",
        price: 20,
        assetLimit: 500,
    }),
});

const PAID_PLANS = Object.freeze([PLAN.PLUS, PLAN.PRO]);

module.exports = {
    PLAN,
    PLAN_CONFIG,
    PAID_PLANS,
};
