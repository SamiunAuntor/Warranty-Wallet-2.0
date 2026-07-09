const prisma = require("../../config/prisma");

const findByFirebaseUid = (firebaseUid) => {
    return prisma.user.findUnique({
        where: {
            firebaseUid,
        },
    });
};

const createUser = (payload) => {
    return prisma.user.create({
        data: payload,
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
    findByFirebaseUid,
    createUser,
    updateUser,
    findById,
};