const prisma = require("../../config/prisma");

const getDashboardStatistics = async () => {

    const [
        totalUsers,
        activeUsers,
        blockedUsers,
        paidUsers,
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
                plan: { in: ["PLUS", "PRO"] },
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

        paidUsers,

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

const findCategories = ({ where = {}, orderBy = { name: "asc" }, skip, take } = {}) => prisma.category.findMany({ where, orderBy, skip, take, include: { _count: { select: { products: true } } } });
const countCategories = (where = {}) => prisma.category.count({ where });
const findBrands = ({ where = {}, orderBy = { name: "asc" }, skip, take } = {}) => prisma.brand.findMany({ where, orderBy, skip, take, include: { _count: { select: { products: true } } } });
const countBrands = (where = {}) => prisma.brand.count({ where });

const findClaims = ({ where, skip, take }) => prisma.claim.findMany({ where, skip, take, orderBy: { updatedAt: "desc" }, include: { user: { select: { id: true, name: true, email: true } }, product: { include: { category: true } }, timeline: { orderBy: { createdAt: "desc" } }, documents: { include: { document: true } } } });
const countClaims = (where) => prisma.claim.count({ where });
const findClaimById = (id) => prisma.claim.findUnique({ where: { id }, include: { user: { select: { id: true, name: true, email: true } }, product: { include: { category: true } }, timeline: { orderBy: { createdAt: "desc" } }, documents: { include: { document: true } } } });
const updateClaimStatus = (claim, status) => prisma.$transaction(async (tx) => { await tx.claim.update({ where: { id: claim.id }, data: { status, ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}) } }); if (status !== claim.status) await tx.claimTimelineEvent.create({ data: { claimId: claim.id, status, title: `Status changed to ${status.replaceAll("_", " ").toLowerCase()}` } }); return tx.claim.findUnique({ where: { id: claim.id }, include: { user: { select: { id: true, name: true, email: true } }, product: { include: { category: true } }, timeline: { orderBy: { createdAt: "desc" } }, documents: { include: { document: true } } } }); });

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

    countCategories,

    findBrands,

    countBrands,

    findClaims,

    countClaims,

    findClaimById,

    updateClaimStatus,

};
