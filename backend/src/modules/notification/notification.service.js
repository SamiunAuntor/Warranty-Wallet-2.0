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

const notifyWarrantyExpiry = async ({ userId, productId, productName, expiryDate, expired = false, daysRemaining }) => {
    const eventKey = `${expired ? "expired" : `expiring-${daysRemaining}`}:${new Date(expiryDate).toISOString().slice(0, 10)}`;
    const existing = await notificationRepository.findByEvent({
        userId,
        type: "REMINDER",
        entityId: productId,
        eventKey,
    });
    if (existing) return existing;

    return notificationRepository.create({

        userId,

        title:
            expired ? "Warranty Expired" : "Warranty Expiring Soon",

        message:
            expired
                ? `Your warranty for "${productName}" has expired.`
                : `Your warranty for "${productName}" expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`,

        type:
            "REMINDER",

        entityId: productId,

        eventKey,

    });

};

const notifyPaymentSuccess = async ({ userId, amount, planName, }) => {

    return notificationRepository.create({

        userId,

        title:
            "Payment Successful",

        message:
            `Your ${planName} subscription payment of $${amount} was successful.`,

        type:
            "PAYMENT",

    });

};

const markReminderEmailSent = (notificationId) =>
    notificationRepository.markEmailSent(notificationId);

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
    markReminderEmailSent,
};
