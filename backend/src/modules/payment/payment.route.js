const express = require("express");

const router = express.Router();

const controller = require("./payment.controller");

const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const { checkoutSchema, confirmCheckoutSchema, changePlanSchema } = require("./payment.validation");

router.get("/plans", controller.plans);

router.post("/create-checkout", auth, validate(checkoutSchema), controller.createCheckout);

router.post("/confirm-checkout", auth, validate(confirmCheckoutSchema), controller.confirmCheckout);

router.get("/", auth, controller.paymentHistory);

router.get("/subscription", auth, controller.subscription);

router.post("/change-plan", auth, validate(changePlanSchema), controller.changePlan);

router.post("/cancel-subscription", auth, controller.cancelSubscription);

router.post("/resume-subscription", auth, controller.resumeSubscription);

module.exports = router;
