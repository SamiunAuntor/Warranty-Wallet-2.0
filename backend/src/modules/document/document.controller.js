const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");

const documentService = require("./document.service");


const uploadDocuments = asyncHandler(async (req, res) => {
    const documents = await documentService.uploadDocuments({

        user: req.user,

        productId: req.params.productId,

        files: req.files,

        type: req.body.type,

    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Documents uploaded successfully.",
            documents
        )
    );

});

const getDocuments = asyncHandler(async (req, res) => {
    const documents = await documentService.getDocuments(
        req.user,
        req.params.productId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Documents fetched successfully.",
            documents
        )
    );

});

const getDocument = asyncHandler(async (req, res) => {
    const document = await documentService.getDocument(
        req.params.id,
        req.user
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Document fetched successfully.",
            document
        )
    );

});

const replaceDocument = asyncHandler(async (req, res) => {
    const document = await documentService.replaceDocument({
        id: req.params.id,
        user: req.user,
        file: req.file,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            "Document replaced successfully.",
            document
        )
    );

});

const deleteDocument = asyncHandler(async (req, res) => {
    await documentService.deleteDocument(
        req.params.id,
        req.user
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            "Document deleted successfully."
        )
    );

});

const getDocumentStatistics = asyncHandler(async (req, res) => {

    const stats = await documentService.getDocumentStatistics(

        req.user.id

    );

    return res.status(200).json(

        new ApiResponse(

            200,

            "Document statistics fetched successfully.",

            stats

        )

    );

});

module.exports = {

    uploadDocuments,

    getDocuments,

    getDocument,

    replaceDocument,

    deleteDocument,

    getDocumentStatistics,

};