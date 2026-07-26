const prisma = require("../../config/prisma");

const getProductStatistics = async (userId) => {
    const [total, active, expiringSoon, expired, purchaseValue] = await Promise.all([
        prisma.product.count({
            where: {
                userId,
                isDeleted: false,
            },
        }),

        prisma.product.count({
            where: {
                userId,
                warrantyStatus: "ACTIVE",
                isDeleted: false,
            },
        }),

        prisma.product.count({
            where: {
                userId,
                warrantyStatus: "EXPIRING_SOON",
                isDeleted: false,
            },
        }),

        prisma.product.count({
            where: {
                userId,
                warrantyStatus: "EXPIRED",
                isDeleted: false,
            },
        }),

        prisma.product.aggregate({
            where: {
                userId,
                isDeleted: false,
            },
            _sum: {
                purchasePrice: true,
            },
        }),
    ]);

    return {
        total,
        active,
        expiringSoon,
        expired,
        purchaseValue:
            purchaseValue._sum.purchasePrice || 0,
    };
};

const getDocumentStatistics = async (userId) => {
    return prisma.document.count({

        where: {

            product: {

                userId,

            },

        },

    });

};

const getNotificationStatistics = async (userId) => {
    const [total, unread,] = await Promise.all([

        prisma.notification.count({

            where: {

                userId,

            },

        }),

        prisma.notification.count({

            where: {

                userId,

                isRead: false,

            },

        }),

    ]);

    return {

        total,

        unread,

    };

};

const getRecentNotifications = async (userId, limit = 5) => {

    return prisma.notification.findMany({

        where: {

            userId,

        },

        orderBy: {

            createdAt: "desc",

        },

        take: limit,

    });

};


const getRecentActivities = async (userId, limit = 5) => {

    return prisma.activityLog.findMany({

        where: {

            userId,

        },

        orderBy: {

            createdAt: "desc",

        },

        take: limit,

    });

};

const getCategoryDistribution = async (userId) => {
    return prisma.product.groupBy({

        by: [

            "categoryId",

        ],

        where: {

            userId,

            isDeleted: false,

        },

        _count: {

            id: true,

        },

    });

};

const getWarrantyTimeline = async (userId, limit = 10) => {

    return prisma.product.findMany({

        where: {

            userId,

            isDeleted: false,

            hasWarranty: true,

            lifecycleStatus: "ADDED",

            expiryDate: { not: null },

        },

        orderBy: {

            expiryDate: "asc",

        },

        select: {

            id: true,

            name: true,

            expiryDate: true,

            warrantyStatus: true,

        },

        take: limit,

    });

};

const getAdminStatistics = async () => {
    const [

        totalUsers,

        paidUsers,

        totalProducts,

        totalRevenue,

        successfulPayments,

    ] = await Promise.all([

        prisma.user.count(),

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

        prisma.payment.aggregate({

            where: {

                status: "SUCCESS",

            },

            _sum: {

                amount: true,

            },

        }),

        prisma.payment.count({

            where: {

                status: "SUCCESS",

            },

        }),

    ]);

    return {

        totalUsers,

        paidUsers,

        totalProducts,

        totalRevenue:
            totalRevenue._sum.amount || 0,

        successfulPayments,

    };

};

const getRecentPayments = async (limit = 10) => {

    return prisma.payment.findMany({

        orderBy: {

            createdAt: "desc",

        },

        include: {

            user: {

                select: {

                    id: true,

                    name: true,

                    email: true,

                },

            },

        },

        take: limit,

    });

};

const getMonthlyRevenue = async (year) => {
    const start = new Date(
        year,
        0,
        1
    );

    const end = new Date(
        year + 1,
        0,
        1
    );

    return prisma.payment.groupBy({

        by: [

            "createdAt",

        ],

        where: {

            status: "SUCCESS",

            createdAt: {

                gte: start,

                lt: end,

            },

        },

        _sum: {

            amount: true,

        },

    });

};

const getProductGrowth = async (year) => {

    const start = new Date(
        year,
        0,
        1
    );

    const end = new Date(
        year + 1,
        0,
        1
    );

    return prisma.product.groupBy({

        by: [

            "createdAt",

        ],

        where: {

            createdAt: {

                gte: start,

                lt: end,

            },

            isDeleted: false,

        },

        _count: {

            id: true,

        },

    });

};

module.exports = {

    getProductStatistics,

    getDocumentStatistics,

    getOpenClaimsCount,

    getRecentDocuments,

    getAiProcessingCount,

    getNotificationStatistics,

    getRecentNotifications,

    getRecentActivities,

    getCategoryDistribution,

    getWarrantyTimeline,

    getAdminStatistics,

    getRecentPayments,

    getMonthlyRevenue,

    getProductGrowth,

};

const getOpenClaimsCount = (userId) => prisma.claim.count({
    where: {
        userId,
        status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
    },
});

const getRecentDocuments = (userId, limit = 5) => prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
        id: true,
        fileName: true,
        fileType: true,
        ocrProcessed: true,
        createdAt: true,
        product: { select: { id: true, name: true } },
    },
});

const getAiProcessingCount = (userId) => prisma.document.count({
    where: {
        userId,
        fileType: { in: ["INVOICE", "RECEIPT", "WARRANTY_CARD"] },
        ocrProcessed: false,
    },
});
