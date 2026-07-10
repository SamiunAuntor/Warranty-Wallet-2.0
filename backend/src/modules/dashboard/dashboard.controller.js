const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

const dashboardService = require("./dashboard.service");

const getUserDashboard = asyncHandler(async (req, res) => {

    const dashboard =
        await dashboardService.getUserDashboard(
            req.user
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Dashboard fetched successfully.",
            dashboard
        )
    );

});

const getAdminDashboard = asyncHandler(async (req, res) => {

    const dashboard =
        await dashboardService.getAdminDashboard(
            req.user
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Admin dashboard fetched successfully.",
            dashboard
        )
    );

});

const getRevenueAnalytics =
    asyncHandler(async (req, res) => {

        const year =
            Number(req.query.year) ||
            new Date().getFullYear();

        const revenue =
            await dashboardService.getRevenueAnalytics(
                year
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Revenue analytics fetched successfully.",
                revenue
            )
        );

    });

const getProductGrowthAnalytics =
    asyncHandler(async (req, res) => {

        const year =
            Number(req.query.year) ||
            new Date().getFullYear();

        const growth =
            await dashboardService.getProductGrowthAnalytics(
                year
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Product growth fetched successfully.",
                growth
            )
        );

    });

const getWarrantyAnalytics =
    asyncHandler(async (req, res) => {

        const timeline =
            await dashboardService.getWarrantyAnalytics(
                req.user.id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Warranty timeline fetched successfully.",
                timeline
            )
        );

    });

const getCategoryAnalytics =
    asyncHandler(async (req, res) => {

        const categories =
            await dashboardService.getCategoryAnalytics(
                req.user.id
            );

        return res.status(200).json(
            new ApiResponse(
                200,
                "Category distribution fetched successfully.",
                categories
            )
        );

    });

module.exports = {

    getUserDashboard,

    getAdminDashboard,

    getRevenueAnalytics,

    getProductGrowthAnalytics,

    getWarrantyAnalytics,

    getCategoryAnalytics,

};