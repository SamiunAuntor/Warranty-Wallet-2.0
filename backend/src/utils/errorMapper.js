const DATABASE_UNAVAILABLE_CODES = new Set([
    "P1000",
    "P1001",
    "P1002",
    "P1008",
    "P1017",
    "P2024",
    "P2028",
]);

const FIREBASE_AUTH_CODES = new Set([
    "auth/argument-error",
    "auth/id-token-expired",
    "auth/id-token-revoked",
    "auth/invalid-id-token",
    "auth/user-disabled",
]);

const isPrismaError = (error) => (
    error?.name?.startsWith("PrismaClient") || /^P\d{4}$/.test(error?.code || "")
);

const mapError = (error) => {
    if (error?.type?.startsWith("Stripe") || error?.rawType) {
        const paymentError = error?.code === "card_declined"
            || error?.code === "authentication_required"
            || error?.statusCode === 402;
        return {
            statusCode: paymentError ? 402 : (error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 502),
            message: paymentError
                ? "Stripe could not complete the payment. Please follow the payment link or use another payment method."
                : "Stripe could not update your subscription. Please try again.",
        };
    }

    if (error?.statusCode) {
        return {
            statusCode: error.statusCode,
            message: error.message,
        };
    }

    if (error?.name === "MulterError") {
        return {
            statusCode: 400,
            message: error.code === "LIMIT_FILE_SIZE"
                ? "The uploaded file is too large."
                : "The uploaded files are invalid.",
        };
    }

    if (error?.code === "P2002") {
        return {
            statusCode: 409,
            message: "An account or record with these details already exists.",
        };
    }

    if (error?.code === "P2003") {
        return {
            statusCode: 409,
            message: "This operation conflicts with related data.",
        };
    }

    if (error?.code === "P2025") {
        return {
            statusCode: 404,
            message: "The requested record was not found.",
        };
    }

    if (DATABASE_UNAVAILABLE_CODES.has(error?.code)
        || error?.name === "PrismaClientInitializationError") {
        return {
            statusCode: 503,
            message: "The database is temporarily unavailable. Please try again.",
        };
    }

    if (isPrismaError(error)) {
        return {
            statusCode: 500,
            message: "A database operation failed. Please try again.",
        };
    }

    if (FIREBASE_AUTH_CODES.has(error?.code) || error?.codePrefix === "auth") {
        return {
            statusCode: 401,
            message: "Your authentication session is invalid or expired. Please sign in again.",
        };
    }

    return {
        statusCode: 500,
        message: "Internal Server Error",
    };
};

module.exports = mapError;
