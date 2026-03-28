const cloudinary = require("../services/cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBase64Image = async (base64, folder, publicId) => {
    try {
        const res = await cloudinary.uploader.upload(base64, {
            folder,
            public_id: publicId,
            resource_type: "image"
        });
        return res;
    } catch (err) {
        console.error("Cloudinary Error:", err);
        throw new Error("Cloudinary upload failed");
    }
};

module.exports = { uploadBase64Image };
