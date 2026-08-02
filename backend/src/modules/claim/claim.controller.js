const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const claimService = require("./claim.service");

const createClaim = asyncHandler(async (req, res) => {
    const claim = await claimService.createClaim(req.user, req.body);
    res.status(201).json(new ApiResponse(201, "Claim created successfully.", claim));
});

const getClaims = asyncHandler(async (req, res) => {
    const result = await claimService.getClaims(req.user, req.query);
    res.status(200).json(new ApiResponse(200, "Claims fetched successfully.", result));
});

const getClaim = asyncHandler(async (req, res) => {
    const claim = await claimService.getClaim(req.params.id, req.user);
    res.status(200).json(new ApiResponse(200, "Claim fetched successfully.", claim));
});

const updateClaim = asyncHandler(async (req, res) => {
    const claim = await claimService.updateClaim(req.params.id, req.user, req.body);
    res.status(200).json(new ApiResponse(200, "Claim updated successfully.", claim));
});

const deleteClaim = asyncHandler(async (req, res) => {
    await claimService.deleteClaim(req.params.id, req.user);
    res.status(200).json(new ApiResponse(200, "Claim deleted successfully."));
});

const addTimelineEvent = asyncHandler(async (req, res) => {
    const claim = await claimService.addTimelineEvent(req.params.id, req.user, req.body);
    res.status(201).json(new ApiResponse(201, "Timeline updated successfully.", claim));
});

const attachDocument = asyncHandler(async (req, res) => {
    const claim = await claimService.attachDocument(req.params.id, req.user, req.body);
    res.status(201).json(new ApiResponse(201, "Document attached successfully.", claim));
});

const detachDocument = asyncHandler(async (req, res) => {
    const claim = await claimService.detachDocument(req.params.id, req.user, req.params.documentId);
    res.status(200).json(new ApiResponse(200, "Document detached successfully.", claim));
});

module.exports = {
    createClaim,
    getClaims,
    getClaim,
    updateClaim,
    deleteClaim,
    addTimelineEvent,
    attachDocument,
    detachDocument,
};
