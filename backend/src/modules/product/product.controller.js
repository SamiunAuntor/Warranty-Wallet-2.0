const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

const productService = require("./product.service");

const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(
        req.user,
        req.body
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            "Product created successfully.",
            product
        )
    );
});

const getProducts = asyncHandler(async (req, res) => {
    const products = await productService.getProducts(
        req.user,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Products fetched successfully.",
            products
        )
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(
        req.params.id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product fetched successfully.",
            product
        )
    );
});

const updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(
        req.params.id,
        req.body,
        req.user
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product updated successfully.",
            product
        )
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(
        req.params.id,
        req.user
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Product deleted successfully."
        )
    );
});

const getDashboardStats = asyncHandler(async (req, res) => {
    const dashboard = await productService.getDashboardStats(
        req.user.id
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Dashboard fetched successfully.",
            dashboard
        )
    );
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getDashboardStats,
};