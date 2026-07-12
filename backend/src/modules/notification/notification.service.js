const notificationRepository = require("./notification.repository");
const userRepository = require("../user/user.repository");

const ApiError = require("../../utils/ApiError");

const { pagination } = require("../../utils/query");

const createNotification = async (payload) => {

    return notificationRepository.create(payload);

};

const getNotifications = async (user, query) => {
    const { skip, take, page, limit, } = pagination(query);

    const notifications = await notificationRepository.findManyByUser(
        user.id,
        skip,
        take
    );

    const total = await notificationRepository.countByUser(
        user.id
    );

    return {

        data: notifications,

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

const getUnreadCount = async (userId) => {
    const unread = await notificationRepository.countUnread(
        userId
    );

    return {
        unread,
    };

};

const markAsRead = async (id, user) => {
    const notification = await notificationRepository.findById(id);

    if (!notification) {

        throw new ApiError(
            404,
            "Notification not found."
        );

    }

    if (
        notification.userId !== user.id &&
        user.role !== "ADMIN"
    ) {

        throw new ApiError(
            403,
            "Forbidden."
        );

    }

    return notificationRepository.markAsRead(
        id
    );

};

const markAllAsRead = async (userId) => {
    await notificationRepository.markAllAsRead(
        userId
    );

    return;

};

const deleteNotification = async (id, user) => {
    const notification = await notificationRepository.findById(id);

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found."
        );

    }

    if (
        notification.userId !== user.id &&
        user.role !== "ADMIN"
    ) {

        throw new ApiError(
            403,
            "Forbidden."
        );

    }

    await notificationRepository.remove(
        id
    );

};

const broadcastNotification = async ({ title, message, type, }) => {
    const users = await userRepository.findAll();

    const notifications = users.map((user) => ({
        userId: user.id,
        title,
        message,
        type,
    }));

    await Promise.all(

        notifications.map((notification) =>
            notificationRepository.create(
                notification
            )
        )

    );

};

const notifyWarrantyExpiry = async ({ userId, productId, productName, }) => {

    return notificationRepository.create({

        userId,

        title:
            "Warranty Expiring Soon",

        message:
            `Your warranty for "${productName}" is expiring soon.`,

        type:
            "REMINDER",

    });

};

const notifyPaymentSuccess = async ({ userId, amount, }) => {

    return notificationRepository.create({

        userId,

        title:
            "Payment Successful",

        message:
            `Your Premium subscription payment of $${amount} was successful.`,

        type:
            "PAYMENT",

    });

};

module.exports = {

    createNotification,

    getNotifications,

    getUnreadCount,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    broadcastNotification,

    notifyWarrantyExpiry,

    notifyPaymentSuccess,

};