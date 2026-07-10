const adminRepository = require("./admin.repository");

const activityService = require("../activity/activity.service");
const notificationService = require("../notification/notification.service");

const ApiError = require("../../utils/ApiError");
const { pagination } = require("../../utils/query");

const getDashboard = async () => {

    return adminRepository.getDashboardStatistics();

};

const getUsers = async (query) => {

    const {
        page,
        limit,
        skip,
        take,
    } = pagination(query);

    const where = {};

    if (query.search) {

        where.OR = [
            {
                name: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                email: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
        ];

    }

    if (query.role) {
        where.role = query.role;
    }

    if (query.plan) {
        where.plan = query.plan;
    }

    if (query.status) {
        where.status = query.status;
    }

    const orderBy = {
        [query.sortBy || "createdAt"]:
            query.sortOrder || "desc",
    };

    const [users, total] =
        await Promise.all([

            adminRepository.findUsers({

                where,

                orderBy,

                skip,

                take,

            }),

            adminRepository.countUsers(where),

        ]);

    return {

        data: users,

        meta: {

            page,

            limit,

            total,

            totalPages:
                Math.ceil(total / limit),

        },

    };

};

const getUser = async (id) => {

    const user =
        await adminRepository.findUserById(id);

    if (!user) {

        throw new ApiError(
            404,
            "User not found."
        );

    }

    return user;

};

const blockUser = async (
    id,
    admin
) => {

    const user =
        await getUser(id);

    if (user.role === "ADMIN") {

        throw new ApiError(
            400,
            "Cannot block another admin."
        );

    }

    const updated =
        await adminRepository.updateUser(id, {
            status: "BLOCKED",
        });

    await activityService.logActivity({

        userId: admin.id,

        type: "PROFILE_UPDATED",

        entity: "USER",

        entityId: id,

        title: "User Blocked",

        description: `Blocked ${user.email}`,

    });

    return updated;

};

const unblockUser = async (
    id,
    admin
) => {

    const user =
        await getUser(id);

    const updated =
        await adminRepository.updateUser(id, {
            status: "ACTIVE",
        });

    await activityService.logActivity({

        userId: admin.id,

        type: "PROFILE_UPDATED",

        entity: "USER",

        entityId: id,

        title: "User Unblocked",

        description: `Unblocked ${user.email}`,

    });

    return updated;

};

const deleteUser = async (
    id,
    admin
) => {

    const user =
        await getUser(id);

    if (user.role === "ADMIN") {

        throw new ApiError(
            400,
            "Cannot delete another admin."
        );

    }

    const updated =
        await adminRepository.updateUser(id, {
            status: "DELETED",
        });

    await activityService.logActivity({

        userId: admin.id,

        type: "PROFILE_UPDATED",

        entity: "USER",

        entityId: id,

        title: "User Deleted",

        description: `Deleted ${user.email}`,

    });

    return updated;

};

const getProducts = async (query) => {

    const {
        page,
        limit,
        skip,
        take,
    } = pagination(query);

    const where = {
        isDeleted: false,
    };

    if (query.search) {

        where.OR = [
            {
                name: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                brand: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
        ];

    }

    const [products, total] =
        await Promise.all([

            adminRepository.findProducts({

                where,

                orderBy: {
                    createdAt: "desc",
                },

                skip,

                take,

            }),

            adminRepository.countProducts(where),

        ]);

    return {

        data: products,

        meta: {

            page,

            limit,

            total,

            totalPages:
                Math.ceil(total / limit),

        },

    };

};

const getProduct = async (id) => {

    const product =
        await adminRepository.findProductById(id);

    if (!product) {

        throw new ApiError(
            404,
            "Product not found."
        );

    }

    return product;

};

const deleteProduct = async (
    id,
    admin
) => {

    const product =
        await getProduct(id);

    await adminRepository.deleteProduct(id);

    await activityService.logActivity({

        userId: admin.id,

        type: "PRODUCT_DELETED",

        entity: "PRODUCT",

        entityId: id,

        title: "Product Deleted",

        description:
            `${product.name} deleted by admin.`,

    });

};

const getPayments = async (query) => {

    const {
        page,
        limit,
        skip,
        take,
    } = pagination(query);

    const where = {};

    if (query.status) {
        where.status = query.status;
    }

    const [payments, total] =
        await Promise.all([

            adminRepository.findPayments({

                where,

                orderBy: {

                    createdAt: "desc",

                },

                skip,

                take,

            }),

            adminRepository.countPayments(where),

        ]);

    return {

        data: payments,

        meta: {

            page,

            limit,

            total,

            totalPages:
                Math.ceil(total / limit),

        },

    };

};

const getPayment = async (id) => {

    const payment =
        await adminRepository.findPaymentById(id);

    if (!payment) {

        throw new ApiError(
            404,
            "Payment not found."
        );

    }

    return payment;

};

const getCategories = async () => {

    return adminRepository.findCategories();

};


const broadcastNotification = async (payload) => {

    await notificationService.broadcastNotification(
        payload
    );

};

module.exports = {

    getDashboard,

    getUsers,

    getUser,

    blockUser,

    unblockUser,

    deleteUser,

    getProducts,

    getProduct,

    deleteProduct,

    getPayments,

    getPayment,

    getCategories,

    broadcastNotification,

};