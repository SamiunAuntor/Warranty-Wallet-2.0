const express = require("express");

const controller = require("./user.controller");

const auth = require("../../middlewares/auth.middleware");
const verifyFirebaseToken = require("../../middlewares/verifyFirebaseToken.middleware");
const validate = require("../../middlewares/validate.middleware");

const { syncUserSchema, updateProfileSchema } = require("./user.validation");

const router = express.Router();

router.post("/sync", verifyFirebaseToken, validate(syncUserSchema), controller.syncUser);

router.get("/profile", auth, controller.getProfile);

router.patch("/profile", auth, validate(updateProfileSchema), controller.updateProfile);

module.exports = router;