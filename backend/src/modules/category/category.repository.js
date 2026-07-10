const prisma = require("../../config/prisma");

const create = (payload) =>
    prisma.category.create({
        data: payload,
    });

const findAll = () =>
    prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
    });

const findById = (id) =>
    prisma.category.findUnique({
        where: { id },
    });

const findByName = (name) =>
    prisma.category.findUnique({
        where: { name },
    });

const update = (id, payload) =>
    prisma.category.update({
        where: { id },
        data: payload,
    });

const remove = (id) =>
    prisma.category.delete({
        where: { id },
    });

module.exports = {
    create,
    findAll,
    findById,
    findByName,
    update,
    remove,
};