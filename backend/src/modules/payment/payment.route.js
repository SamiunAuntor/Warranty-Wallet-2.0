const express = require("express");

const router = express.Router();

const controller = require("./payment.controller");

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { checkoutSchema, confirmCheckoutSchema } = require("./payment.validation");

router.get("/plans", controller.plans);

router.post("/create-checkout", auth, validate(checkoutSchema), controller.createCheckout);

router.post("/confirm-checkout", auth, validate(confirmCheckoutSchema), controller.confirmCheckout);

router.get("/", auth, controller.paymentHistory);

router.get("/subscription", auth, controller.subscription);

module.exports = router;
