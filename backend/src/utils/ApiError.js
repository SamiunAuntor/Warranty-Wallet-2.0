const { errorCodeForStatus } = require("../constants/errorCodes");

class ApiError extends Error {
    constructor(statusCode, message, code = errorCodeForStatus(statusCode), details = undefined) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.code = code;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;
