const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

const adminService = require("./admin.service");

const getDashboard = asyncHandler(async (req, res) => {

    const dashboard = await adminService.getDashboard();

    return res.status(200).json(

        new ApiResponse(

            200,

            "Admin dashboard fetched successfully.",

            dashboard

        )

    );

});


const getUsers = asyncHandler(async (req, res) => {

    const result = await adminService.getUsers(
        req.query
    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Users fetched successfully.",

            result.data,

            result.meta

        )

    );

});

const getUser = asyncHandler(async (req, res) => {

    const user = await adminService.getUser(
        req.params.id
    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "User fetched successfully.",

            user

        )

    );

});

const blockUser = asyncHandler(async (req, res) => {

    const user = await adminService.blockUser(

        req.params.id,

        req.user

    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "User blocked successfully.",

            user

        )

    );

});

const unblockUser = asyncHandler(async (req, res) => {

    const user = await adminService.unblockUser(

        req.params.id,

        req.user

    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "User unblocked successfully.",

            user

        )

    );

});

const deleteUser = asyncHandler(async (req, res) => {

    await adminService.deleteUser(

        req.params.id,

        req.user

    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "User deleted successfully."

        )

    );

});

const getProducts = asyncHandler(async (req, res) => {

    const result = await adminService.getProducts(
        req.query
    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Products fetched successfully.",

            result.data,

            result.meta

        )

    );

});

const getProduct = asyncHandler(async (req, res) => {

    const product = await adminService.getProduct(
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

const deleteProduct = asyncHandler(async (req, res) => {

    await adminService.deleteProduct(

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

const getPayments = asyncHandler(async (req, res) => {
    const result = await adminService.getPayments(
        req.query
    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Payments fetched successfully.",

            result.data,

            result.meta

        )

    );

});

const getPayment = asyncHandler(async (req, res) => {

    const payment = await adminService.getPayment(
        req.params.id
    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Payment fetched successfully.",

            payment

        )

    );

});

const getCategories = asyncHandler(async (req, res) => {

    const result = await adminService.getCategories(req.query);

    return res.status(200).json(

        new ApiResponse(

            200,

            "Categories fetched successfully.",

            result.data,

            result.meta

        )

    );

});

const getBrands = asyncHandler(async (req, res) => { const result = await adminService.getBrands(req.query); return res.status(200).json(new ApiResponse(200, "Brands fetched successfully.", result.data, result.meta)); });

const broadcastNotification = asyncHandler(async (req, res) => {

    await adminService.broadcastNotification(
        req.body
    );

    return res.status(201).json(

        new ApiResponse(

            201,

            "Notification broadcasted successfully."

        )

    );

});

const getClaims = asyncHandler(async (req, res) => { const result = await adminService.getClaims(req.query); return res.status(200).json(new ApiResponse(200, "Claims fetched successfully.", result.data, result.meta)); });
const updateClaimStatus = asyncHandler(async (req, res) => { const claim = await adminService.updateClaimStatus(req.params.id, req.body.status, req.user); return res.status(200).json(new ApiResponse(200, "Claim updated successfully.", claim)); });

module.exports = {

    getDashboard,

    getUsers,

    getUser,

    blockUser,

    unblockUser,

    deleteUser,

    getProducts,

    getProduct,

    deleteProduct,

    getPayments,

    getPayment,

    getCategories,

    getBrands,

    broadcastNotification,

    getClaims,

    updateClaimStatus,

};
