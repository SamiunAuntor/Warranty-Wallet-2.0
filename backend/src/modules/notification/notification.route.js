const express = require("express");

const router = express.Router();

const controller = require("./notification.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const { createNotificationSchema, notificationIdSchema, } = require("./notification.validation");

router.get("/", auth, controller.getNotifications);

router.get("/unread-count", auth, controller.getUnreadCount);

router.patch("/read-all", auth, controller.markAllAsRead);

router.patch("/:id/read", auth, validate(notificationIdSchema), controller.markAsRead);

router.delete("/:id", auth, validate(notificationIdSchema), controller.deleteNotification);

router.post("/broadcast", auth, role("ADMIN"), validate(createNotificationSchema), controller.broadcastNotification);

module.exports = router;