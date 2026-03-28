const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../services/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folderName = 'onway/riders/misc';

        switch (file.fieldname) {
            case 'riderImage':
            case 'profileImage':
                folderName = 'onway/riders/profiles';
                break;
            case 'faceImage':
                folderName = 'onway/riders/faces';
                break;
            case 'driverLicense':
            case 'drivingLicense':
            case 'drivingLicenseFile':
                folderName = 'onway/riders/licenses';
                break;
            case 'nidImage':
                folderName = 'onway/riders/nid';
                break;
            case 'vehicleDocument':
            case 'vehicleRegistration':
            case 'vehicleRegistrationFile':
                folderName = 'onway/riders/vehicle-documents';
                break;
        }

        return {
            folder: folderName,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
            resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
        };
    },
});

const uploadRiderFiles = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, JPEG, PNG, WEBP, and PDF are allowed.'));
        }
    }
});

module.exports = uploadRiderFiles;
