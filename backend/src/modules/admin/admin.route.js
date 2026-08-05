const express = require("express");

const router = express.Router();

const controller = require("./admin.controller");

const adminMiddleware = require("../../middlewares/admin.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
    idSchema,
    listUsersSchema,
    listProductsSchema,
    listPaymentsSchema,
    broadcastNotificationSchema,
} = require("./admin.validation");

router.get("/dashboard", ...adminMiddleware, controller.getDashboard);

router.get("/users", ...adminMiddleware, validate(listUsersSchema), controller.getUsers);

router.get("/users/:id", ...adminMiddleware, validate(idSchema), controller.getUser);

router.patch("/users/:id/block", ...adminMiddleware, validate(idSchema), controller.blockUser);

router.patch("/users/:id/unblock", ...adminMiddleware, validate(idSchema), controller.unblockUser);

router.delete("/users/:id", ...adminMiddleware, validate(idSchema), controller.deleteUser);

router.get("/products", ...adminMiddleware, validate(listProductsSchema), controller.getProducts);

router.get("/products/:id", ...adminMiddleware, validate(idSchema), controller.getProduct);

router.delete("/products/:id", ...adminMiddleware, validate(idSchema), controller.deleteProduct);

router.get("/payments", ...adminMiddleware, validate(listPaymentsSchema), controller.getPayments);

router.get("/payments/:id", ...adminMiddleware, validate(idSchema), controller.getPayment);

router.get("/categories", ...adminMiddleware, controller.getCategories);

router.get("/claims", ...adminMiddleware, controller.getClaims);

router.patch("/claims/:id/status", ...adminMiddleware, validate(idSchema), controller.updateClaimStatus);

router.post("/notifications", ...adminMiddleware, validate(broadcastNotificationSchema), controller.broadcastNotification);

module.exports = router;
