const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

const activityService = require("./activity.service");

const getActivities = asyncHandler(async (req, res) => {
    const result = await activityService.getActivities(
        req.user,
        req.query
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Activities fetched successfully.",
            result.data,
            result.meta
        )
    );
});

const getActivity = asyncHandler(async (req, res) => {
    const activity = await activityService.getActivity(
        req.params.id,
        req.user
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Activity fetched successfully.",
            activity
        )
    );
});

const getRecentActivities = asyncHandler(async (req, res) => {
    const result = await activityService.getActivities(
        req.user,
        {
            page: 1,
            limit: 10,
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Recent activities fetched successfully.",
            result.data
        )
    );
});

module.exports = {
    getActivities,
    getActivity,
    getRecentActivities,
};