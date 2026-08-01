const { MAX_FILE_SIZE_MB } = require("../modules/document/document.constant");
const mapError = require("../utils/errorMapper");

module.exports = (err, req, res, next) => {
    const mapped = mapError(err);

    if (err?.name === "MulterError") {
        mapped.message = err.code === "LIMIT_FILE_SIZE"
            ? `File size exceeds the ${MAX_FILE_SIZE_MB} MB limit.`
            : err.code === "LIMIT_UNEXPECTED_FILE"
                ? "Too many files or an unexpected upload field was provided."
                : mapped.message;
    }

    if (mapped.statusCode >= 500) {
        console.error(err);
    }

    res.status(mapped.statusCode).json({
        success: false,
        message: mapped.message,
    });
};
