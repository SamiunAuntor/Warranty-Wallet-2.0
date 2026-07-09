const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const service = require("./user.service");

const syncUser = asyncHandler(async (req, res) => {
    const user = await service.syncUser(req.body);

    res.status(200).json(
        new ApiResponse(200, "User synchronized successfully.", user)
    );
});

const getProfile = asyncHandler(async (req, res) => {
    const user = await service.getProfile(req.user.id);

    res.status(200).json(
        new ApiResponse(200, "Profile fetched successfully.", user)
    );
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await service.updateProfile(req.user.id, req.body);

    res.status(200).json(
        new ApiResponse(200, "Profile updated successfully.", user)
    );
});

module.exports = {
    syncUser,
    getProfile,
    updateProfile,
};