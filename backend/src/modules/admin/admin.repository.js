const prisma = require("../../config/prisma");

const getDashboardStatistics = async () => {

    const [
        totalUsers,
        activeUsers,
        blockedUsers,
        premiumUsers,
        totalProducts,
        totalCategories,
        totalPayments,
        revenue,
    ] = await Promise.all([

        prisma.user.count(),

        prisma.user.count({
            where: {
                status: "ACTIVE",
            },
        }),

        prisma.user.count({
            where: {
                status: "BLOCKED",
            },
        }),

        prisma.user.count({
            where: {
                plan: "PREMIUM",
            },
        }),

        prisma.product.count({
            where: {
                isDeleted: false,
            },
        }),

        prisma.category.count(),

        prisma.payment.count(),

        prisma.payment.aggregate({
            where: {
                status: "SUCCESS",
            },
            _sum: {
                amount: true,
            },
        }),

    ]);

    return {

        totalUsers,

        activeUsers,

        blockedUsers,

        premiumUsers,

        totalProducts,

        totalCategories,

        totalPayments,

        totalRevenue:
            revenue._sum.amount || 0,

    };

};

const findUsers = async ({ where, orderBy, skip, take }) => {

    return prisma.user.findMany({

        where,

        orderBy,

        skip,

        take,

        include: {

            subscription: true,

        },

    });

};

const countUsers = (where) => {

    return prisma.user.count({

        where,

    });

};

const findUserById = (id) => {

    return prisma.user.findUnique({

        where: {
            id,
        },

        include: {

            subscription: true,

            products: true,

            payments: true,

        },

    });

};

const updateUser = (id, payload) => {

    return prisma.user.update({

        where: {
            id,
        },

        data: payload,

    });

};

const findProducts = ({ where, orderBy, skip, take, }) => {
    return prisma.product.findMany({

        where,

        orderBy,

        skip,

        take,

        include: {

            category: true,

            user: {

                select: {

                    id: true,

                    name: true,

                    email: true,

                },

            },

        },

    });

};

const countProducts = (where) => {

    return prisma.product.count({

        where,

    });

};

const findProductById = (id) => {

    return prisma.product.findUnique({

        where: {
            id,
        },

        include: {

            documents: true,

            category: true,

            user: true,

        },

    });

};

const deleteProduct = (id) => {

    return prisma.product.update({

        where: {
            id,
        },

        data: {
            isDeleted: true,
        },

    });

};

const findPayments = ({ where, orderBy, skip, take, }) => {

    return prisma.payment.findMany({

        where,

        orderBy,

        skip,

        take,

        include: {

            user: {

                select: {

                    id: true,

                    name: true,

                    email: true,

                },

            },

        },

    });

};

const countPayments = (where) => {

    return prisma.payment.count({

        where,

    });

};

const findPaymentById = (id) => {

    return prisma.payment.findUnique({

        where: {
            id,
        },

        include: {

            user: true,

        },

    });

};

const findCategories = () => {

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

    getDashboardStatistics,

    findUsers,

    countUsers,

    findUserById,

    updateUser,

    findProducts,

    countProducts,

    findProductById,

    deleteProduct,

    findPayments,

    countPayments,

    findPaymentById,

    findCategories,

};