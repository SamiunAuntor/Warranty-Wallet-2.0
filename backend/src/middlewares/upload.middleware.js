const multer = require("multer");

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
            new Error("Unsupported file type"),
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