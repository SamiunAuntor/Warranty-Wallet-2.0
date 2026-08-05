const adminRepository = require("./admin.repository");

const activityService = require("../activity/activity.service");
const notificationService = require("../notification/notification.service");
const firebaseAdmin = require("../../config/firebase");

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

    await firebaseAdmin.auth().updateUser(user.firebaseUid, { disabled: true });
    await firebaseAdmin.auth().revokeRefreshTokens(user.firebaseUid);

    const updated = await adminRepository.updateUser(id, { status: "BLOCKED" });

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

    await firebaseAdmin.auth().updateUser(user.firebaseUid, { disabled: false });

    const updated = await adminRepository.updateUser(id, { status: "ACTIVE" });

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

    await firebaseAdmin.auth().updateUser(user.firebaseUid, { disabled: true });
    await firebaseAdmin.auth().revokeRefreshTokens(user.firebaseUid);

    const updated = await adminRepository.updateUser(id, { status: "DELETED" });

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

    const allowedSorts = ["name", "brand", "purchaseDate", "purchasePrice", "expiryDate", "createdAt"];
    const sortBy = allowedSorts.includes(query.sortBy) ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [products, total] =
        await Promise.all([

            adminRepository.findProducts({

                where,

                orderBy: { [sortBy]: sortOrder },

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

    if (query.search) where.OR = [{ user: { name: { contains: query.search, mode: "insensitive" } } }, { user: { email: { contains: query.search, mode: "insensitive" } } }, { stripeSessionId: { contains: query.search, mode: "insensitive" } }];
    const allowedSorts = ["createdAt", "amount", "status", "plan"];
    const sortBy = allowedSorts.includes(query.sortBy) ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [payments, total] =
        await Promise.all([

            adminRepository.findPayments({

                where,

                orderBy: { [sortBy]: sortOrder },

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

const catalogWhere = (query) => {
    const where = query.search ? { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }] } : {};
    if (query.status === "active") where.isActive = true;
    if (query.status === "inactive") where.isActive = false;
    return where;
};
const catalogOrder = (query) => { const allowed = ["name", "createdAt", "updatedAt"]; return { [allowed.includes(query.sortBy) ? query.sortBy : "name"]: query.sortOrder === "desc" ? "desc" : "asc" }; };
const getCategories = async (query = {}) => { const { page, limit, skip, take } = pagination(query); const where = catalogWhere(query); const [data, total] = await Promise.all([adminRepository.findCategories({ where, orderBy: catalogOrder(query), skip, take }), adminRepository.countCategories(where)]); return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }; };
const getBrands = async (query = {}) => { const { page, limit, skip, take } = pagination(query); const where = catalogWhere(query); if (query.search) where.OR.push({ websiteUrl: { contains: query.search, mode: "insensitive" } }); const [data, total] = await Promise.all([adminRepository.findBrands({ where, orderBy: catalogOrder(query), skip, take }), adminRepository.countBrands(where)]); return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }; };


const getClaims = async (query) => {
    const { page, limit, skip, take } = pagination(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ title: { contains: query.search, mode: "insensitive" } }, { claimNumber: { contains: query.search, mode: "insensitive" } }, { product: { name: { contains: query.search, mode: "insensitive" } } }, { user: { email: { contains: query.search, mode: "insensitive" } } }];
    const [claims, total] = await Promise.all([adminRepository.findClaims({ where, skip, take }), adminRepository.countClaims(where)]);
    return { data: claims, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const updateClaimStatus = async (id, status, admin) => {
    const allowed = ["SUBMITTED", "IN_PROGRESS", "RESOLVED", "REJECTED", "CANCELLED"];
    if (!allowed.includes(status)) throw new ApiError(400, "Invalid claim status.");
    const claim = await adminRepository.findClaimById(id);
    if (!claim) throw new ApiError(404, "Claim not found.");
    const updated = await adminRepository.updateClaimStatus(claim, status);
    await activityService.logActivity({ userId: admin.id, type: "PROFILE_UPDATED", entity: "CLAIM", entityId: id, title: "Claim status updated", description: `${claim.claimNumber} changed to ${status}.` });
    return updated;
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

    getBrands,

    getClaims,

    updateClaimStatus,

    broadcastNotification,

};
