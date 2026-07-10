const prisma = require("../../config/prisma");

const createMany = async (documents) => {
    return prisma.document.createMany({
        data: documents,
    });
};

const create = async (payload) => {
    return prisma.document.create({
        data: payload,
        include: {
            product: {
                include: {
                    category: true,
                },
            },
        },
    });
};

const findById = async (id) => {
    return prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            product: {
                include: {
                    user: true,
                    category: true,
                },
            },
        },
    });
};

const findManyByProduct = async ( productId, type = null) => {
    return prisma.document.findMany({
        where: {
            productId,

            ...(type && { type }),
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};

const countByProduct = async (  productId) => {
    return prisma.document.count({
        where: {
            productId,
        },
    });
};

const countByType = async (  productId,  type) => {
    return prisma.document.count({
        where: {
            productId,
            type,
        },
    });
};

const update = async ( id, payload) => {
    return prisma.document.update({
        where: {
            id,
        },
        data: payload,
    });
};

const remove = async (id) => {
    return prisma.document.delete({
        where: {
            id,
        },
    });
};

const belongsToUser = async (  documentId,  userId) => {
    return prisma.document.findFirst({
        where: {
            id: documentId,

            product: {
                userId,
            },
        },
    });
};

const documentStatistics = async (  userId) => {
    return prisma.document.groupBy({
        by: ["type"],

        where: {
            product: {
                userId,
            },
        },

        _count: {
            id: true,
        },
    });
};

module.exports = {
    create,

    createMany,

    findById,

    findManyByProduct,

    countByProduct,

    countByType,

    update,

    remove,

    belongsToUser,

    documentStatistics,
};