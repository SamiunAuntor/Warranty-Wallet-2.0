const { DOCUMENT_TYPE } = require("./document.constant");

const ROOT_FOLDER = "WarrantyWallet";

const folderSegment = (value) => String(value).toLowerCase().replace(/[^a-z0-9_-]+/g, "-");

const getDocumentFolder = ({ mimetype, productId, type }) => {
    const mediaFolder = mimetype === "application/pdf" ? "pdfs" : "images";
    const purposeFolder = type === DOCUMENT_TYPE.PRODUCT_IMAGE
        ? "condition-photos"
        : folderSegment(type);

    return `${ROOT_FOLDER}/${mediaFolder}/${purposeFolder}/${folderSegment(productId)}`;
};

module.exports = { ROOT_FOLDER, getDocumentFolder };
