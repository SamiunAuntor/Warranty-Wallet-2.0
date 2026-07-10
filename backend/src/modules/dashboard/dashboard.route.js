const express = require("express");

const router = express.Router();

const controller = require("./dashboard.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

router.get("/", auth, controller.getUserDashboard);

router.get("/warranty", auth, controller.getWarrantyAnalytics);

router.get("/categories", auth, controller.getCategoryAnalytics);

router.get("/admin", auth, role("ADMIN"), controller.getAdminDashboard);

router.get("/admin/revenue", auth, role("ADMIN"), controller.getRevenueAnalytics);

router.get("/admin/product-growth", auth, role("ADMIN"), controller.getProductGrowthAnalytics);

module.exports = router;