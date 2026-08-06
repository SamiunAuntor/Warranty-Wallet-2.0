const test = require("node:test");
const assert = require("node:assert/strict");

const mapError = require("../src/utils/errorMapper");

test("maps Prisma uniqueness failures without exposing raw query details", () => {
    const error = Object.assign(
        new Error("Very long Prisma query and database details"),
        {
            name: "PrismaClientKnownRequestError",
            code: "P2002",
        }
    );

    assert.deepEqual(mapError(error), {
        statusCode: 409,
        code: "DATABASE_CONFLICT",
        message: "An account or record with these details already exists.",
    });
});

test("maps unavailable Prisma connections to a concise retryable response", () => {
    const error = Object.assign(new Error("Connection internals"), {
        name: "PrismaClientInitializationError",
        code: "P1001",
    });

    assert.deepEqual(mapError(error), {
        statusCode: 503,
        code: "DATABASE_UNAVAILABLE",
        message: "The database is temporarily unavailable. Please try again.",
    });
});

test("maps Prisma transaction pool timeouts to a retryable response", () => {
    const error = Object.assign(new Error("Unable to start a transaction in the given time"), {
        name: "PrismaClientKnownRequestError",
        code: "P2028",
    });

    assert.deepEqual(mapError(error), {
        statusCode: 503,
        code: "DATABASE_UNAVAILABLE",
        message: "The database is temporarily unavailable. Please try again.",
    });
});

test("maps invalid Firebase sessions to an authentication response", () => {
    const error = Object.assign(new Error("Decoded Firebase token internals"), {
        code: "auth/id-token-expired",
    });

    assert.deepEqual(mapError(error), {
        statusCode: 401,
        code: "AUTH_SESSION_INVALID",
        message: "Your authentication session is invalid or expired. Please sign in again.",
    });
});

test("maps Stripe payment failures to a readable response", () => {
    const error = {
        type: "StripeCardError",
        code: "authentication_required",
        statusCode: 402,
        message: "A very long provider error",
    };

    assert.deepEqual(mapError(error), {
        statusCode: 402,
        code: "PAYMENT_FAILED",
        message: "Stripe could not complete the payment. Please follow the payment link or use another payment method.",
    });
});

test("preserves explicit application error codes and safe details", () => {
    const error = Object.assign(new Error("The selected transition is invalid."), {
        statusCode: 409,
        code: "CLAIM_TRANSITION_INVALID",
        details: { current: "RESOLVED", requested: "SUBMITTED" },
    });

    assert.deepEqual(mapError(error), {
        statusCode: 409,
        code: "CLAIM_TRANSITION_INVALID",
        message: "The selected transition is invalid.",
        details: { current: "RESOLVED", requested: "SUBMITTED" },
    });
});

test("maps unknown failures to a stable internal error code", () => {
    assert.deepEqual(mapError(new Error("private stack details")), {
        statusCode: 500,
        code: "INTERNAL_ERROR",
        message: "Internal Server Error",
    });
});
