const prisma = require("../../config/prisma");

const ACTIVE_CLAIM_STATUSES = ["SUBMITTED", "IN_PROGRESS"];

const claimSummary = {
    documents: {
        where: { fileType: "PRODUCT_IMAGE" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
            id: true,
            fileName: true,
            fileType: true,
            fileUrl: true,
            fileSize: true,
            ocrProcessed: true,
            createdAt: true,
        },
    },
    claims: {
        where: {
            status: { in: ACTIVE_CLAIM_STATUSES },
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: {
            id: true,
            claimNumber: true,
            title: true,
            status: true,
            updatedAt: true,
        },
    },
    _count: {
        select: {
            claims: true,
            documents: true,
        },
    },
};

const create = (payload) => {
    return prisma.product.create({
        data: payload,
        include: {
            category: true,
            brandReference: true,
            ...claimSummary,
        },
    });
};

const findById = (id) => {
    return prisma.product.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            category: true,
            brandReference: true,
            documents: {
                orderBy: { createdAt: "desc" },
                include: { _count: { select: { claims: true } } },
            },
            claims: {
                orderBy: { updatedAt: "desc" },
                include: {
                    timeline: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                    _count: {
                        select: { documents: true },
                    },
                },
            },
            _count: {
                select: {
                    documents: true,
                    claims: true,
                },
            },
        },
    });
};

const update = (id, payload) => {
    return prisma.product.update({
        where: {
            id,
        },
        data: payload,
    });
};

const softDelete = (id) => {
    return prisma.product.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
        },
    });
};

const findMany = ({ where, orderBy, skip, take }) => {
    return prisma.product.findMany({
        where: {
            ...where,
            isDeleted: false,
        },

        include: {
            category: true,
            brandReference: true,
            ...claimSummary,
        },

        orderBy,

        skip,

        take,
    });
};

const count = (where) => {
    return prisma.product.count({
        where: {
            ...where,
            isDeleted: false,
        },
    });
};

const countUserProducts = (userId) => {
    return prisma.product.count({
        where: {
            userId,
            isDeleted: false,
        },
    });
};

const findBySerialNumber = (userId, serialNumber) => {
    return prisma.product.findFirst({
        where: {
            userId,

            serialNumber,

            isDeleted: false,
        },
    });
};

const findByInvoiceNumber = (invoiceNumber) => {
    return prisma.document.findFirst({
        where: {
            invoiceNumber,
        },
    });
};

const dashboardStats = (userId) => {
    return prisma.product.groupBy({
        by: ["warrantyStatus"],

        where: {
            userId,

            isDeleted: false,
        },

        _count: true,
    });
};

const latestProducts = (userId, limit = 5) => {
    return prisma.product.findMany({
        where: {
            userId,

            isDeleted: false,
        },

        orderBy: {
            createdAt: "desc",
        },

        take: limit,

        include: {
            category: true,
        },
    });
};

const findExpiringProducts = (fromDate, toDate) => {
    return prisma.product.findMany({
        where: {
            expiryDate: {
                gte: fromDate,
                lte: toDate,
            },
            warrantyStatus: { in: ["ACTIVE", "EXPIRING_SOON"] },
            hasWarranty: true,
            isDeleted: false,
        },
        include: {
            user: { include: { preferences: true } },
            category: true,
        },
    });
};

const findExpiredProducts = (date) => {
    return prisma.product.findMany({
        where: {
            expiryDate: {
                lt: date,
            },
            warrantyStatus: {
                not: "EXPIRED",
            },
            hasWarranty: true,
            isDeleted: false,
        },
        include: {
            user: { include: { preferences: true } },
        },
    });
};

const updateWarrantyStatus = (id, warrantyStatus) => {
    return prisma.product.update({
        where: {
            id,
        },
        data: {
            warrantyStatus,
        },
    });
};

module.exports = {
    create,

    findById,

    update,

    softDelete,

    findMany,

    count,

    countUserProducts,

    findBySerialNumber,

    findByInvoiceNumber,

    dashboardStats,

    latestProducts,

    findExpiringProducts,

    findExpiredProducts,

    updateWarrantyStatus
};
