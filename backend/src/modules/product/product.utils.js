const { WARRANTY_STATUS } = require("./product.constant");

const calculateExpiryDate = (purchaseDate, duration) => {
    const expiry = new Date(purchaseDate);

    expiry.setMonth(
        expiry.getMonth() + duration
    );

    return expiry;
};

const calculateWarrantyStatus = (expiryDate) => {
    const today = new Date();

    const days = Math.ceil(
        (expiryDate - today) /
        (1000 * 60 * 60 * 24)
    );

    if (days < 0) {
        return WARRANTY_STATUS.EXPIRED;
    }

    if (days <= 30) {
        return WARRANTY_STATUS.EXPIRING_SOON;
    }

    return WARRANTY_STATUS.ACTIVE;
};

module.exports = {
    calculateExpiryDate,
    calculateWarrantyStatus,
};