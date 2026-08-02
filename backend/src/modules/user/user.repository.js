const prisma = require("../../config/prisma");

const syncUser = ({ firebaseUid, ...payload }) => prisma.user.upsert({
    where: { firebaseUid },
    create: { firebaseUid, ...payload },
    update: payload,
});

const updateUser = (id, payload) => prisma.user.update({ where: { id }, data: payload });
const findById = (id) => prisma.user.findUnique({ where: { id } });
const findByFirebaseUid = (firebaseUid) => prisma.user.findUnique({ where: { firebaseUid } });

module.exports = { syncUser, updateUser, findById, findByFirebaseUid };
