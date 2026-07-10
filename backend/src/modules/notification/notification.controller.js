const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

const notificationService = require("./notification.service");

const getNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.getNotifications(
        req.user,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Notifications fetched successfully.",
            result.data,
            result.meta
        )
    );
});

const getUnreadCount = asyncHandler(async (req, res) => {
    const result = await notificationService.getUnreadCount(
        req.user.id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Unread notification count fetched successfully.",
            result
        )
    );
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification =
        await notificationService.markAsRead(
            req.params.id,
            req.user
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Notification marked as read.",
            notification
        )
    );
});

const markAllAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(
        req.user.id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "All notifications marked as read."
        )
    );
});

const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(
        req.params.id,
        req.user
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Notification deleted successfully."
        )
    );
});

const broadcastNotification = asyncHandler(async (req, res) => {
    await notificationService.broadcastNotification(
        req.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            "Notification broadcasted successfully."
        )
    );
});

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    broadcastNotification,
};