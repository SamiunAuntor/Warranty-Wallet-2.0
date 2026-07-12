const prisma = require("../../config/prisma");

const createPayment = (payload) => {
    return prisma.payment.create({
        data: payload,
    });
};

const findPaymentById = (id) => {
    return prisma.payment.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
        },
    });
};

const findPaymentBySessionId = (stripeSessionId) => {
    return prisma.payment.findUnique({
        where: {
            stripeSessionId,
        },
        include: {
            user: true,
        },
    });
};

const updatePayment = (id, payload) => {
    return prisma.payment.update({
        where: {
            id,
        },
        data: payload,
    });
};

const paymentHistory = ({ userId, skip, take, }) => {
    return prisma.payment.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take,
    });
};

const paymentCount = (userId) => {
    return prisma.payment.count({
        where: {
            userId,
        },
    });
};

const findSubscription = (userId) => {
    return prisma.subscription.findUnique({
        where: {
            userId,
        },
        include: {
            latestPayment: true,
        },
    });
};

const createSubscription = (payload) => {
    return prisma.subscription.create({
        data: payload,
    });
};

const updateSubscription = (userId, payload) => {
    return prisma.subscription.update({
        where: {
            userId,
        },
        data: payload,
    });
};

const upgradeUserPlan = (
    userId,
    plan
) => {
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            plan,
        },
    });
};

const totalRevenue = () => {
    return prisma.payment.aggregate({
        where: {
            status: "SUCCESS",
        },
        _sum: {
            amount: true,
        },
    });
};

const successfulPayments = () => {
    return prisma.payment.count({
        where: {
            status: "SUCCESS",
        },
    });
};

const premiumUsers = () => {
    return prisma.subscription.count({
        where: {
            isActive: true,
        },
    });
};

const recentPayments = (take = 10) => {
    return prisma.payment.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: true,
        },
        take,
    });
};

module.exports = {
    createPayment,

    findPaymentById,

    findPaymentBySessionId,

    updatePayment,

    paymentHistory,

    paymentCount,

    findSubscription,

    createSubscription,

    updateSubscription,

    upgradeUserPlan,

    totalRevenue,

    successfulPayments,

    premiumUsers,

    recentPayments,

};