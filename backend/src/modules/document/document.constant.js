const DOCUMENT_TYPE = {
    INVOICE: "INVOICE",

    WARRANTY_CARD: "WARRANTY_CARD",

    PRODUCT_IMAGE: "PRODUCT_IMAGE",

    RECEIPT: "RECEIPT",

    OTHER: "OTHER",
};

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const ALLOWED_FILE_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MAX_FILES_PER_UPLOAD = 5;

module.exports = {
    DOCUMENT_TYPE,

    ALLOWED_IMAGE_TYPES,

    ALLOWED_FILE_TYPES,

    MAX_FILE_SIZE,

    MAX_FILES_PER_UPLOAD,
};