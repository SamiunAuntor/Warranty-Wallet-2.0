const prisma = require("../../config/prisma");

const syncUser = ({ firebaseUid, ...payload }) => {
    return prisma.user.upsert({
        where: {
            firebaseUid,
        },
        create: {
            firebaseUid,
            ...payload,
        },
        update: payload,
    });
};

const updateUser = (id, payload) => {
    return prisma.user.update({
        where: {
            id,
        },
        data: payload,
    });
};

const findById = (id) => {
    return prisma.user.findUnique({
        where: {
            id,
        },
    });
};

module.exports = {
    syncUser,
    updateUser,
    findById,
};
