const prisma = require("../../config/prisma");

const syncUser = ({ firebaseUid, ...payload }) => prisma.user.upsert({
    where: { firebaseUid },
    create: { firebaseUid, ...payload },
    update: payload,
});

const updateUser = (id, payload) => prisma.user.update({ where: { id }, data: payload });
const findById = (id) => prisma.user.findUnique({ where: { id } });
const findByFirebaseUid = (firebaseUid) => prisma.user.findUnique({ where: { firebaseUid } });
const getPreferences = (userId) => prisma.userPreference.upsert({ where: { userId }, create: { userId }, update: {} });
const findPreferences = (userId) => prisma.userPreference.findUnique({ where: { userId } });
const updatePreferences = (userId, payload) => prisma.userPreference.upsert({ where: { userId }, create: { userId, ...payload }, update: payload });

module.exports = { syncUser, updateUser, findById, findByFirebaseUid, getPreferences, findPreferences, updatePreferences };
