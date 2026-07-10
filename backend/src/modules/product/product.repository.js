const prisma = require("../../config/prisma");

const create = (payload) => {
    return prisma.product.create({
        data: payload,
        include: {
            category: true,
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
            invoices: true,
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
    return prisma.invoice.findFirst({
        where: {
            invoiceNumber,
        },
    });
};

const dashboardStats = (userId) => {
    return prisma.product.groupBy({
        by: ["status"],

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
};