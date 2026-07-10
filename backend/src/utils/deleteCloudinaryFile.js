const cloudinary = require("../config/cloudinary");

const deleteImage = async (publicId) => {
    return cloudinary.uploader.destroy(
        publicId
    );
};

module.exports = deleteImage;