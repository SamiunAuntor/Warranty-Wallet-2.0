const { MAX_FILE_SIZE_MB } = require("../modules/document/document.constant");

module.exports = (err, req, res, next) => {
    const isUploadError = err.name === "MulterError";
    const statusCode = err.statusCode || (isUploadError ? 400 : 500);
    const message = err.code === "LIMIT_FILE_SIZE"
        ? `File size exceeds the ${MAX_FILE_SIZE_MB} MB limit.`
        : err.code === "LIMIT_UNEXPECTED_FILE"
            ? "Too many files or an unexpected upload field was provided."
        : err.message;

    res.status(statusCode).json({
        success: false,
        message: message || "Internal Server Error",
        stack:
            process.env.NODE_ENV === "development"
                ? err.stack
                : undefined,
    });
};
