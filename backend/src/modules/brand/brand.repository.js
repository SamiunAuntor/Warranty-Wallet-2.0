const prisma = require("../../config/prisma");

const create = (data) => prisma.brand.create({ data });
const findAllActive = () => prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
const findAll = () => prisma.brand.findMany({ orderBy: { name: "asc" } });
const findById = (id) => prisma.brand.findUnique({ where: { id } });
const findByName = (name) => prisma.brand.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
const update = (id, data) => prisma.brand.update({ where: { id }, data });
const countProducts = (id) => prisma.product.count({ where: { brandId: id, isDeleted: false } });

module.exports = { create, findAllActive, findAll, findById, findByName, update, countProducts };
