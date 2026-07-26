const express = require("express");

const controller = require("./category.controller");

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createCategorySchema, updateCategorySchema } = require("./category.validation");

const router = express.Router();

router.get("/", controller.getCategories);

router.post("/", auth, role("ADMIN"), validate(createCategorySchema), controller.createCategory);

router.patch("/:id", auth, role("ADMIN"), validate(updateCategorySchema), controller.updateCategory);

router.delete("/:id", auth, role("ADMIN"), controller.deleteCategory);

module.exports = router;
