const documentRepository = require("./document.repository");
const productRepository = require("../product/product.repository");

const { uploadFile } = require("../../services/upload.service");
const deleteImage = require("../../utils/deleteCloudinaryFile");

const ApiError = require("../../utils/ApiError");
const { hasValidFileSignature } = require("../../utils/fileValidation");

const { DOCUMENT_TYPE, MAX_FILES_PER_UPLOAD } = require("./document.constant");
const { pagination } = require("../../utils/query");
const aiService = require("../ai/ai.service");

const EXTRACTABLE_TYPES = new Set([
    DOCUMENT_TYPE.INVOICE,
    DOCUMENT_TYPE.RECEIPT,
    DOCUMENT_TYPE.WARRANTY_CARD,
]);

const extractMetadata = async (file, type, extractedData) => {
    if (!EXTRACTABLE_TYPES.has(type)) {
        return { ocrProcessed: false, ocrConfidence: null, ocrRaw: null };
    }

    let data;
    if (extractedData) {
        try {
            data = aiService.extractedDocumentSchema.parse(JSON.parse(extractedData));
        } catch {
            throw new ApiError(400, "The supplied AI extraction data is invalid.");
        }
    } else {
        data = await aiService.extractInvoice(file);
    }

    return {
        invoiceNumber: data.invoiceNumber || null,
        vendorName: data.sellerName || null,
        ocrProcessed: true,
        ocrConfidence: data.confidence ?? null,
        ocrRaw: data,
    };
};

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

const uploadDocuments = async ({ user, productId, files, type, extractedData, }) => {
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

    if (files.some((file) => !hasValidFileSignature(file))) {
        throw new ApiError(400, "A file's contents do not match its declared PDF or image type.");
    }

    if (type === DOCUMENT_TYPE.INVOICE || type === DOCUMENT_TYPE.WARRANTY_CARD) {
        const existing = await documentRepository.countByType(productId, type);

        if (existing > 0) {
            throw new ApiError(409, `${type} already exists for this product.`);
        }
    }

    const uploadedDocuments = [];

    for (const file of files) {
        const extracted = await extractMetadata(file, type, extractedData);

        const uploaded =
            await uploadFile(file.buffer, getFolder(type));

        const document = await documentRepository.create({
            productId,

            userId:
                user.id,

            fileType:
                type,

            fileName:
                file.originalname,

            fileUrl:
                uploaded.secure_url,

            publicId:
                uploaded.public_id,

            provider:
                "cloudinary",

            fileSize:
                file.size,
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

const listDocuments = async (user, query) => {
    const { skip, take, page, limit } = pagination(query);
    const where = {
        ...(user.role !== "ADMIN" && { userId: user.id }),
        ...(query.productId && { productId: query.productId }),
        ...(query.type && { fileType: query.type }),
        ...(query.search && {
            OR: [
                { fileName: { contains: query.search, mode: "insensitive" } },
                { vendorName: { contains: query.search, mode: "insensitive" } },
                { product: { name: { contains: query.search, mode: "insensitive" } } },
            ],
        }),
    };
    const [documents, total] = await Promise.all([
        documentRepository.findMany({ where, skip, take }),
        documentRepository.count(where),
    ]);

    return {
        data: documents,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
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

    if (!file) {
        throw new ApiError(400, "A replacement file is required.");
    }

    if (!hasValidFileSignature(file)) {
        throw new ApiError(400, "The replacement file's contents do not match its declared type.");
    }

    const extracted = await extractMetadata(file, document.fileType);

    const uploaded = await uploadFile(
        file.buffer,
        getFolder(document.fileType)
    );

    const updated = await documentRepository.update(id, {
            fileName:
                file.originalname,

            fileUrl:
                uploaded.secure_url,

            publicId:
                uploaded.public_id,

            fileSize:
                file.size,
            ...extracted,
            ...extracted,
        });

    await deleteImage(document.publicId);

    return updated;
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

    listDocuments,

    getDocument,

    deleteDocument,

    replaceDocument,

    getDocumentStatistics,

};
