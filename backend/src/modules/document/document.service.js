const documentRepository = require("./document.repository");
const productRepository = require("../product/product.repository");

const { uploadFile } = require("../../services/upload.service");
const deleteImage = require("../../utils/deleteCloudinaryFile");

const ApiError = require("../../utils/ApiError");
const { hasValidFileSignature } = require("../../utils/fileValidation");

const {
    DOCUMENT_TYPE,
    MAX_FILES_PER_UPLOAD,
    MAX_SUPPORTING_DOCUMENTS_PER_PRODUCT,
    MAX_PRODUCT_IMAGES_PER_PRODUCT,
    MAX_CLAIM_FILES_PER_PRODUCT,
} = require("./document.constant");
const { pagination } = require("../../utils/query");
const aiService = require("../ai/ai.service");
const { getDocumentFolder } = require("./document.storage");

const EXTRACTABLE_TYPES = new Set([
    DOCUMENT_TYPE.INVOICE,
    DOCUMENT_TYPE.RECEIPT,
    DOCUMENT_TYPE.WARRANTY_CARD,
]);

const SUPPORTING_DOCUMENT_TYPES = [
    DOCUMENT_TYPE.INVOICE,
    DOCUMENT_TYPE.WARRANTY_CARD,
    DOCUMENT_TYPE.RECEIPT,
    DOCUMENT_TYPE.OTHER,
];

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

    if ([DOCUMENT_TYPE.CLAIM_EVIDENCE, DOCUMENT_TYPE.CLAIM_CONDITION].includes(type)) {
        const claimFileCount = await documentRepository.countByTypes(productId, [DOCUMENT_TYPE.CLAIM_EVIDENCE, DOCUMENT_TYPE.CLAIM_CONDITION]);
        if (claimFileCount + files.length > MAX_CLAIM_FILES_PER_PRODUCT) {
            throw new ApiError(409, `Each asset can store up to ${MAX_CLAIM_FILES_PER_PRODUCT} claim evidence files.`);
        }
    } else if (type === DOCUMENT_TYPE.PRODUCT_IMAGE) {
        const imageCount = await documentRepository.countByType(productId, DOCUMENT_TYPE.PRODUCT_IMAGE);
        if (imageCount + files.length > MAX_PRODUCT_IMAGES_PER_PRODUCT) {
            throw new ApiError(409, `Each asset can have up to ${MAX_PRODUCT_IMAGES_PER_PRODUCT} condition photos.`);
        }
    } else {
        const documentCount = await documentRepository.countByTypes(productId, SUPPORTING_DOCUMENT_TYPES);
        if (documentCount + files.length > MAX_SUPPORTING_DOCUMENTS_PER_PRODUCT) {
            throw new ApiError(409, `Each asset can have up to ${MAX_SUPPORTING_DOCUMENTS_PER_PRODUCT} purchase documents.`);
        }
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

        const uploaded = await uploadFile(file.buffer, getDocumentFolder({
            mimetype: file.mimetype,
            productId,
            type,
        }));

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

            ...extracted,
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

    if (document._count?.claims > 0) {
        throw new ApiError(409, "Evidence attached to a claim cannot be deleted. Add a corrected file instead.");
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

    if (document._count?.claims > 0) {
        throw new ApiError(409, "Evidence attached to a claim cannot be replaced. Add a corrected file instead.");
    }

    if (!hasValidFileSignature(file)) {
        throw new ApiError(400, "The replacement file's contents do not match its declared type.");
    }

    const extracted = await extractMetadata(file, document.fileType);

    const uploaded = await uploadFile(
        file.buffer,
        getDocumentFolder({
            mimetype: file.mimetype,
            productId: document.productId,
            type: document.fileType,
        })
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
