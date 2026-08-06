const assert = require("node:assert/strict");
const test = require("node:test");

const ApiError = require("../src/utils/ApiError");
const { ERROR_CODE, errorCodeForStatus } = require("../src/constants/errorCodes");

test("assigns stable default codes from HTTP status", () => {
    assert.equal(new ApiError(400, "Invalid input").code, ERROR_CODE.VALIDATION_FAILED);
    assert.equal(new ApiError(401, "Sign in").code, ERROR_CODE.UNAUTHORIZED);
    assert.equal(new ApiError(403, "Denied").code, ERROR_CODE.FORBIDDEN);
    assert.equal(new ApiError(404, "Missing").code, ERROR_CODE.NOT_FOUND);
    assert.equal(new ApiError(409, "Conflict").code, ERROR_CODE.CONFLICT);
    assert.equal(new ApiError(500, "Failure").code, ERROR_CODE.INTERNAL_ERROR);
});

test("supports a domain-specific code and structured details", () => {
    const error = new ApiError(
        409,
        "Claim cannot return to submitted state.",
        "CLAIM_TRANSITION_INVALID",
        { current: "RESOLVED", requested: "SUBMITTED" },
    );

    assert.equal(error.success, false);
    assert.equal(error.statusCode, 409);
    assert.equal(error.code, "CLAIM_TRANSITION_INVALID");
    assert.deepEqual(error.details, { current: "RESOLVED", requested: "SUBMITTED" });
});

test("unknown statuses fall back to the internal error code", () => {
    assert.equal(errorCodeForStatus(418), ERROR_CODE.INTERNAL_ERROR);
    assert.equal(errorCodeForStatus(undefined), ERROR_CODE.INTERNAL_ERROR);
});

test("error-code constants cannot be mutated", () => {
    assert.equal(Object.isFrozen(ERROR_CODE), true);
    assert.throws(() => {
        "use strict";
        ERROR_CODE.NEW_CODE = "NEW_CODE";
    }, TypeError);
});
