const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const service = require("./brand.service");

const getBrands = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "Brands retrieved successfully.", await service.getBrands(req.user?.role === "ADMIN" && req.query.includeInactive === "true"))));
const createBrand = asyncHandler(async (req, res) => res.status(201).json(new ApiResponse(201, "Brand created successfully.", await service.createBrand(req.body))));
const updateBrand = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "Brand updated successfully.", await service.updateBrand(req.params.id, req.body))));
const deleteBrand = asyncHandler(async (req, res) => res.status(200).json(new ApiResponse(200, "Brand deactivated successfully.", await service.deactivateBrand(req.params.id))));

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
