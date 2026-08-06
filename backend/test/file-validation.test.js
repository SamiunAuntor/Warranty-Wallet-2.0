const assert = require("node:assert/strict");
const test = require("node:test");

const { hasValidFileSignature } = require("../src/utils/fileValidation");

const file = (mimetype, bytes) => ({ mimetype, buffer: Buffer.from(bytes) });

test("accepts supported files with matching signatures", () => {
    assert.equal(hasValidFileSignature(file("application/pdf", "%PDF-1.7")), true);
    assert.equal(hasValidFileSignature(file("image/jpeg", [0xff, 0xd8, 0xff, 0xe0])), true);
    assert.equal(
        hasValidFileSignature(file("image/png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])),
        true,
    );
});

test("accepts WebP only when both RIFF and WEBP markers are present", () => {
    assert.equal(hasValidFileSignature(file("image/webp", "RIFF1234WEBPdata")), true);
    assert.equal(hasValidFileSignature(file("image/webp", "RIFF1234NOPEdata")), false);
    assert.equal(hasValidFileSignature(file("image/webp", "NOPE1234WEBPdata")), false);
});

test("rejects a supported MIME type with spoofed contents", () => {
    assert.equal(hasValidFileSignature(file("application/pdf", "not a pdf")), false);
    assert.equal(hasValidFileSignature(file("image/jpeg", "%PDF-1.7")), false);
    assert.equal(hasValidFileSignature(file("image/png", [0x89, 0x50, 0x00])), false);
});

test("rejects unsupported types and missing buffers", () => {
    assert.equal(hasValidFileSignature(file("text/plain", "hello")), false);
    assert.equal(hasValidFileSignature({ mimetype: "application/pdf" }), false);
    assert.equal(hasValidFileSignature(null), false);
});

test("does not accept a signature that appears later in the file", () => {
    assert.equal(hasValidFileSignature(file("application/pdf", "prefix%PDF-1.7")), false);
    assert.equal(hasValidFileSignature(file("image/webp", "xxxxRIFF1234WEBP")), false);
});
