const prisma = require("../../config/prisma");

const getProductsReport = async ({
    userId,
    isAdmin = false,
    filters = {},
}) => {

    const where = {
        isDeleted: false,
    };

    if (!isAdmin) {
        where.userId = userId;
    }

    if (filters.status) {
        where.warrantyStatus = filters.status;
    }

    if (filters.categoryId) {
        where.categoryId = filters.categoryId;
    }

    if (filters.from || filters.to) {

        where.purchaseDate = {};

        if (filters.from) {
            where.purchaseDate.gte = new Date(filters.from);
        }

        if (filters.to) {
            where.purchaseDate.lte = new Date(filters.to);
        }

    }

    return prisma.product.findMany({

        where,

        include: {

            category: true,

            user: {
                select: {
                    name: true,
                    email: true,
                },
            },

        },

        orderBy: {
            purchaseDate: "desc",
        },

    });

};

const getWarrantyReport = async ({
    userId,
    isAdmin = false,
    filters = {},
}) => {

    const where = {
        isDeleted: false,
    };

    if (!isAdmin) {
        where.userId = userId;
    }

    if (filters.status) {
        where.warrantyStatus = filters.status;
    }

    return prisma.product.findMany({

        where,

        include: {

            category: true,

        },

        orderBy: {

            expiryDate: "asc",

        },

    });

};

const getPaymentReport = async ({
    userId,
    isAdmin = false,
    filters = {},
}) => {

    const where = {};

    if (!isAdmin) {
        where.userId = userId;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.from || filters.to) {

        where.createdAt = {};

        if (filters.from) {
            where.createdAt.gte = new Date(filters.from);
        }

        if (filters.to) {
            where.createdAt.lte = new Date(filters.to);
        }

    }

    return prisma.payment.findMany({

        where,

        include: {

            user: {

                select: {

                    name: true,

                    email: true,

                },

            },

        },

        orderBy: {

            createdAt: "desc",

        },

    });

};

const getRevenueReport = async ({
    from,
    to,
}) => {

    const where = {

        status: "SUCCESS",

    };

    if (from || to) {

        where.createdAt = {};

        if (from) {
            where.createdAt.gte = new Date(from);
        }

        if (to) {
            where.createdAt.lte = new Date(to);
        }

    }

    return prisma.payment.findMany({

        where,

        include: {

            user: {

                select: {

                    name: true,

                    email: true,

                },

            },

        },

        orderBy: {

            createdAt: "desc",

        },

    });

};

const getUserReport = async (filters = {}) => {

    const where = {};

    if (filters.role) {
        where.role = filters.role;
    }

    if (filters.plan) {
        where.plan = filters.plan;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    return prisma.user.findMany({

        where,

        include: {

            subscription: true,

            _count: {

                select: {

                    products: true,

                    payments: true,

                },

            },

        },

        orderBy: {

            createdAt: "desc",

        },

    });

};

const getCategoryReport = async () => {

    return prisma.category.findMany({

        include: {

            _count: {

                select: {

                    products: true,

                },

            },

        },

        orderBy: {

            name: "asc",

        },

    });

};

module.exports = {

    getProductsReport,

    getWarrantyReport,

    getPaymentReport,

    getRevenueReport,

    getUserReport,

    getCategoryReport,

};
