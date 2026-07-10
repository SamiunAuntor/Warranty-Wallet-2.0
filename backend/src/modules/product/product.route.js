const express = require("express");

const router = express.Router();

const controller = require("./product.controller");

const auth = require("../../middlewares/auth.middleware");

const validate = require("../../middlewares/validate.middleware");

const { createProductSchema, updateProductSchema, } = require("./product.validation");

router.get("/dashboard", auth, controller.getDashboardStats);

router.get("/", auth, controller.getProducts);

router.get("/:id", auth, controller.getProductById);

router.post("/", auth, validate(createProductSchema), controller.createProduct);

router.patch("/:id", auth, validate(updateProductSchema), controller.updateProduct);

router.delete("/:id", auth, controller.deleteProduct);

module.exports = router;