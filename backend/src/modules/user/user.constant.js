const USER_ROLE = {
    USER: "USER",
    ADMIN: "ADMIN",
};

const { PLAN: USER_PLAN } = require("../../constants/plans");

const USER_STATUS = {
    ACTIVE: "ACTIVE",
    SUSPENDED: "SUSPENDED",
    DELETED: "DELETED",
};

module.exports = {
    USER_ROLE,
    USER_PLAN,
    USER_STATUS,
};
