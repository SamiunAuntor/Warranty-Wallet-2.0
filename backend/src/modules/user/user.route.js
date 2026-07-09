const express = require("express");

const controller = require("./user.controller");

const auth = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post("/sync", controller.syncUser);

router.get("/profile", auth, controller.getProfile);

router.patch("/profile", auth, controller.updateProfile);

module.exports = router;