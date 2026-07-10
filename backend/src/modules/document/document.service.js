const documentRepository = require("./document.repository");
const productRepository = require("../product/product.repository");

const { uploadFile } = require("../../services/upload.service");
const deleteImage = require("../../utils/deleteCloudinaryFile");

const ApiError = require("../../utils/ApiError");

const { DOCUMENT_TYPE, MAX_FILES_PER_UPLOAD } = require("./document.constant");

const getFolder = (type) => {
    switch (type) {
        case DOCUMENT_TYPE.INVOICE:
            return "WarrantyWallet/invoices";

        case DOCUMENT_TYPE.WARRANTY_CARD:
            return "WarrantyWallet/warranty_cards";

        case DOCUMENT_TYPE.PRODUCT_IMAGE:
            return "WarrantyWallet/products";

        case DOCUMENT_TYPE.RECEIPT:
            return "WarrantyWallet/receipts";

        default:
            return "WarrantyWallet/others";
    }
};

const uploadDocuments = async ({ user, productId, files, type, }) => {
    const product = await productRepository.findById(productId);

    if (!product) {
        throw new ApiError(
            404,
            "Product not found."
        );
    }

    if (product.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(
            403,
            "You do not have permission."
        );
    }

    if (!files || files.length === 0) {
        throw new ApiError(400, "No files uploaded.");
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
        throw new ApiError(400, `Maximum ${MAX_FILES_PER_UPLOAD} files allowed.`);
    }

    if (type === DOCUMENT_TYPE.INVOICE || type === DOCUMENT_TYPE.WARRANTY_CARD) {
        const existing = await documentRepository.countByType(productId, type);

        if (existing > 0) {
            throw new ApiError(409, `${type} already exists for this product.`);
        }
    }

    const uploadedDocuments = [];

    for (const file of files) {

        const uploaded =
            await uploadFile(file.buffer, getFolder(type));

        const document = await documentRepository.create({
            productId,

            type,

            fileName:
                file.originalname,

            fileUrl:
                uploaded.secure_url,

            publicId:
                uploaded.public_id,

            mimeType:
                file.mimetype,

            fileSize:
                file.size,

            uploadedBy:
                user.id,
        });

        uploadedDocuments.push(
            document
        );
    }

    return uploadedDocuments;
};

const getDocuments = async (user, productId) => {
    const product = await productRepository.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    if (
        product.userId !== user.id &&
        user.role !== "ADMIN"
    ) {
        throw new ApiError(403, "Forbidden.");
    }

    return documentRepository.findManyByProduct(
        productId
    );
};

const getDocument = async (id, user) => {
    const document = await documentRepository.findById(id);

    if (!document) {
        throw new ApiError(404, "Document not found.");
    }

    if (document.product.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden.");
    }

    return document;
};

const deleteDocument = async (id, user) => {
    const document = await documentRepository.findById(id);

    if (!document) {
        throw new ApiError(404, "Document not found.");
    }

    if (document.product.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden."
        );
    }

    await deleteImage(
        document.publicId
    );

    await documentRepository.remove(
        id
    );

    return;
};

const replaceDocument = async ({ id, user, file, }) => {

    const document = await documentRepository.findById(id);

    if (!document) {
        throw new ApiError(
            404,
            "Document not found."
        );
    }

    if (document.product.userId !== user.id && user.role !== "ADMIN") {
        throw new ApiError(
            403,
            "Forbidden."
        );
    }

    await deleteImage(document.publicId);

    const uploaded = await uploadFile(
        file.buffer,
        getFolder(document.type)
    );

    return documentRepository.update(
        id,
        {
            fileName:
                file.originalname,

            fileUrl:
                uploaded.secure_url,

            publicId:
                uploaded.public_id,

            mimeType:
                file.mimetype,

            fileSize:
                file.size,
        }
    );
};

const getDocumentStatistics =
    async (userId) => {

        return documentRepository.documentStatistics(
            userId
        );

    };

module.exports = {

    uploadDocuments,

    getDocuments,

    getDocument,

    deleteDocument,

    replaceDocument,

    getDocumentStatistics,

};