const express = require("express");

const router = express.Router();

const userRoutes = require("../modules/user/user.route");
const categoryRoutes = require("../modules/category/category.route");
const productRoutes = require("../modules/product/product.route");
const documentRoutes = require("../modules/document/document.route");
const aiRoutes = require("../modules/ai/ai.route");
const notificationRoutes = require("../modules/notification/notification.route");
const activityRoutes = require("../modules/activity/activity.route");
const paymentRoutes = require("../modules/payment/payment.route");
const dashboardRoutes = require("../modules/dashboard/dashboard.route");

router.use("/users", userRoutes);

router.use("/categories", categoryRoutes);

router.use("/products", productRoutes);

router.use("/", documentRoutes);

router.use("/ai", aiRoutes);

router.use("/notifications", notificationRoutes);

router.use("/activities", activityRoutes);

router.use("/payments", paymentRoutes);

router.use("/dashboard", dashboardRoutes);

module.exports = router;