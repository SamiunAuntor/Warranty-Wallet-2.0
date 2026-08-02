const cloudinary = require("../config/cloudinary");

const streamifier = require("streamifier");

const uploadFile = (buffer, folder) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                folder,
                resource_type: "auto",
                use_filename: true,
                unique_filename: true,
                overwrite: false,
            },

            (error, result) => {

                if (error) return reject(error);

                resolve(result);

            }

        );

        streamifier.createReadStream(buffer).pipe(stream);

    });

};

module.exports = {

    uploadFile,

};
