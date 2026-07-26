const prisma = require("../../config/prisma");

const create = (data) => prisma.notification.create({ data });
const findById = (id) => prisma.notification.findUnique({ where: { id } });
const findByEvent = ({ userId, type, entityId, eventKey }) =>
    prisma.notification.findFirst({ where: { userId, type, entityId, eventKey } });
const findManyByUser = (userId, skip, take) => prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take,
});
const countUnread = (userId) => prisma.notification.count({ where: { userId, isRead: false } });
const markAsRead = (id) => prisma.notification.update({ where: { id }, data: { isRead: true } });
const markAllAsRead = (userId) => prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
});
const remove = (id) => prisma.notification.delete({ where: { id } });
const countByUser = (userId) => prisma.notification.count({ where: { userId } });

module.exports = {
    create,
    findById,
    findByEvent,
    findManyByUser,
    countUnread,
    markAsRead,
    markAllAsRead,
    remove,
    countByUser,
};
