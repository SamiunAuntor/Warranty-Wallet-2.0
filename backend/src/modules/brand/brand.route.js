const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const controller = require("./brand.controller");
const { createBrandSchema, updateBrandSchema } = require("./brand.validation");

const router = express.Router();
router.get("/", controller.getBrands);
router.post("/", auth, role("ADMIN"), validate(createBrandSchema), controller.createBrand);
router.patch("/:id", auth, role("ADMIN"), validate(updateBrandSchema), controller.updateBrand);
router.delete("/:id", auth, role("ADMIN"), controller.deleteBrand);

module.exports = router;
