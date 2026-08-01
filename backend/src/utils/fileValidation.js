const SIGNATURES = {
    "application/pdf": Buffer.from("%PDF"),
    "image/jpeg": Buffer.from([0xff, 0xd8, 0xff]),
    "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
};

const hasValidFileSignature = (file) => {
    if (!file?.buffer) return false;

    if (file.mimetype === "image/webp") {
        return file.buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
            file.buffer.subarray(8, 12).toString("ascii") === "WEBP";
    }

    const signature = SIGNATURES[file.mimetype];
    return Boolean(signature && file.buffer.subarray(0, signature.length).equals(signature));
};

module.exports = { hasValidFileSignature };
