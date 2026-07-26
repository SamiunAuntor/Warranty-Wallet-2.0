const { PLAN_CONFIG } = require("../../constants/plans");

const PRODUCT_LIMIT = Object.freeze(
    Object.fromEntries(
        Object.entries(PLAN_CONFIG).map(([plan, config]) => [plan, config.assetLimit])
    )
);

const WARRANTY_STATUS = {
    NO_WARRANTY: "NO_WARRANTY",
    ACTIVE: "ACTIVE",
    EXPIRING_SOON: "EXPIRING_SOON",
    EXPIRED: "EXPIRED",
};

const ASSET_LIFECYCLE_STATUS = {
    ADDED: "ADDED",
    ARCHIVED: "ARCHIVED",
};

module.exports = {
    PRODUCT_LIMIT,
    WARRANTY_STATUS,

    ASSET_LIFECYCLE_STATUS,
};
