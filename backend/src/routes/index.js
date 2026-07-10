const express = require("express");

const router = express.Router();

const userRoutes = require("../modules/user/user.route");
const categoryRoutes = require("../modules/category/category.route");
const productRoutes = require("../modules/product/product.route");
const documentRoutes = require("../modules/document/document.route");

router.use("/users", userRoutes);

router.use("/categories", categoryRoutes);

router.use("/products", productRoutes);

router.use("/", documentRoutes);

module.exports = router;