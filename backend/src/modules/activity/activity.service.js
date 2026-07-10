const activityRepository = require("./activity.repository");

const { pagination } = require("../../utils/query");

const ApiError = require("../../utils/ApiError");

const logActivity = async ({ userId, type, entity, entityId = null, title, description, metadata = null, ipAddress = null, userAgent = null }) => {
    return activityRepository.create({
        userId,
        type,
        entity,
        entityId,
        title,
        description,
        metadata,
        ipAddress,
        userAgent,
    });

};

const getActivities = async (user, query) => {
    const { skip, take, page, limit } = pagination(query);

    const activities =
        await activityRepository.findManyByUser(
            user.id,
            skip,
            take
        );

    const total =
        await activityRepository.countByUser(
            user.id
        );

    return {
        data: activities,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };

};

const getActivity = async (id, user) => {
    const activity =
        await activityRepository.findById(
            id
        );

    if (!activity) {

        throw new ApiError(
            404,
            "Activity not found."
        );

    }

    if (
        activity.userId !== user.id &&
        user.role !== "ADMIN"
    ) {

        throw new ApiError(
            403,
            "Forbidden."
        );

    }

    return activity;

};

const logProductCreated = async ({ userId, productId, productName, ipAddress, userAgent }) => {
    return logActivity({

        userId,

        type: "PRODUCT_CREATED",

        entity: "PRODUCT",

        entityId: productId,

        title: "Product Created",

        description: `${productName} has been added.`,

        ipAddress,

        userAgent,

    });

};

const logProductUpdated = async ({ userId, productId, productName, ipAddress, userAgent }) => {
    return logActivity({

        userId,

        type: "PRODUCT_UPDATED",

        entity: "PRODUCT",

        entityId: productId,

        title: "Product Updated",

        description: `${productName} has been updated.`,

        ipAddress,

        userAgent,

    });

};

const logProductDeleted = async ({ userId, productId, productName, ipAddress, userAgent, }) => {
    return logActivity({

        userId,

        type: "PRODUCT_DELETED",

        entity: "PRODUCT",

        entityId: productId,

        title: "Product Deleted",

        description: `${productName} has been deleted.`,

        ipAddress,

        userAgent,

    });

};

const logDocumentUploaded = async ({ userId, documentId, fileName, ipAddress, userAgent, }) => {
    return logActivity({

        userId,

        type: "DOCUMENT_UPLOADED",

        entity: "DOCUMENT",

        entityId: documentId,

        title: "Document Uploaded",

        description: `${fileName} uploaded.`,

        ipAddress,

        userAgent,

    });

};

const logDocumentDeleted = async ({ userId, documentId, fileName, ipAddress, userAgent }) => {

    return logActivity({

        userId,

        type: "DOCUMENT_DELETED",

        entity: "DOCUMENT",

        entityId: documentId,

        title: "Document Deleted",

        description: `${fileName} deleted.`,

        ipAddress,

        userAgent,

    });

};

const logLogin = async ({ userId, ipAddress, userAgent }) => {
    return logActivity({

        userId,

        type: "LOGIN",

        entity: "USER",

        title: "User Login",

        description: "User logged in successfully.",

        ipAddress,

        userAgent,

    });

};

const logPaymentSuccess = async ({ userId, paymentId, amount, ipAddress, userAgent }) => {
    return logActivity({

        userId,

        type: "PAYMENT_SUCCESS",

        entity: "PAYMENT",

        entityId: paymentId,

        title: "Payment Successful",

        description: `Payment of $${amount} completed successfully.`,

        metadata: {
            amount,
        },

        ipAddress,

        userAgent,

    });

};

module.exports = {

    logActivity,

    getActivities,

    getActivity,

    logLogin,

    logProductCreated,

    logProductUpdated,

    logProductDeleted,

    logDocumentUploaded,

    logDocumentDeleted,

    logPaymentSuccess,

};