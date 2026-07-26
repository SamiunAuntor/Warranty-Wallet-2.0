const { PLAN_CONFIG } = require("../../constants/plans");

const PRODUCT_LIMIT = Object.freeze(
    Object.fromEntries(
        Object.entries(PLAN_CONFIG).map(([plan, config]) => [plan, config.assetLimit])
    )
);

const WARRANTY_STATUS = {
    ACTIVE: "ACTIVE",
    EXPIRING_SOON: "EXPIRING_SOON",
    EXPIRED: "EXPIRED",
};

module.exports = {
    PRODUCT_LIMIT,
    WARRANTY_STATUS,
};
