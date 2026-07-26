const multer = require("multer");
const ApiError = require("../utils/ApiError");

const {
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    MAX_FILES_PER_UPLOAD,
} = require("../modules/document/document.constant");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (
        !ALLOWED_FILE_TYPES.includes(
            file.mimetype
        )
    ) {
        return cb(
            new ApiError(400, "Unsupported file type. Use PDF, JPG, PNG, or WebP."),
            false
        );
    }

    cb(null, true);
};

const upload = multer({
    storage,

    limits: {
        fileSize: MAX_FILE_SIZE,
    },

    fileFilter,
});

module.exports = {
    single: upload.single("file"),

    multiple: upload.array(
        "files",
        MAX_FILES_PER_UPLOAD
    ),
};
