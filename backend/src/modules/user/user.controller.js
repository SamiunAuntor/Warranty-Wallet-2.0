const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./user.service");

const syncUser = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "User synchronized successfully.", await service.syncUser(req.firebaseUser, req.body))));
const getProfile = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "Profile fetched successfully.", await service.getProfile(req.user.id))));
const updateProfile = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "Profile updated successfully.", await service.updateProfile(req.user.id, req.body))));
const updateAvatar = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "Profile photo updated successfully.", await service.updateAvatar(req.user, req.file))));
const getPreferences = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "Preferences fetched successfully.", await service.getPreferences(req.user.id))));
const updatePreferences = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "Preferences updated successfully.", await service.updatePreferences(req.user.id, req.body))));

module.exports = { syncUser, getProfile, updateProfile, updateAvatar, getPreferences, updatePreferences };
