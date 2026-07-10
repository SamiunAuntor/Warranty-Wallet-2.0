const express = require("express");

const router = express.Router();

const controller = require("./report.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
    exportReportSchema,
} = require("./report.validation");

router.get(
    "/products",
    auth,
    validate(exportReportSchema),
    controller.exportProducts
);

router.get(
    "/warranty",
    auth,
    validate(exportReportSchema),
    controller.exportWarranty
);

router.get(
    "/payments",
    auth,
    validate(exportReportSchema),
    controller.exportPayments
);

router.get(
    "/admin/users",
    auth,
    role("ADMIN"),
    validate(exportReportSchema),
    controller.exportUsers
);

router.get(
    "/admin/revenue",
    auth,
    role("ADMIN"),
    validate(exportReportSchema),
    controller.exportRevenue
);

router.get(
    "/admin/categories",
    auth,
    role("ADMIN"),
    validate(exportReportSchema),
    controller.exportCategories
);

module.exports = router;