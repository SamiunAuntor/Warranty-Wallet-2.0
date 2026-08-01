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

const findManyByProduct = async ( productId, fileType = null) => {
    return prisma.document.findMany({
        where: {
            productId,

            ...(fileType && { fileType }),
        },

        orderBy: {
            createdAt: "desc",
        },
    });
};

const findMany = ({ where, skip, take }) =>
    prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
            product: {
                include: { category: true },
            },
            _count: {
                select: { claims: true },
            },
        },
    });

const count = (where) => prisma.document.count({ where });

const countByProduct = async (  productId) => {
    return prisma.document.count({
        where: {
            productId,
        },
    });
};

const countByType = async (  productId,  fileType) => {
    return prisma.document.count({
        where: {
            productId,
            fileType,
        },
    });
};

const countByTypes = async (productId, fileTypes) => {
    return prisma.document.count({
        where: {
            productId,
            fileType: { in: fileTypes },
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
        by: ["fileType"],

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

    findMany,

    count,

    countByProduct,

    countByType,

    countByTypes,

    update,

    remove,

    belongsToUser,

    documentStatistics,
};
