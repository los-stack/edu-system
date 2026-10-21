require('dotenv').config(); 

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const cloudinaryCredentials = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET
];
const hasCloudinaryCredentials = cloudinaryCredentials.every(Boolean);
const hasPartialCloudinaryCredentials = cloudinaryCredentials.some(Boolean);
const useLocalUploads = process.env.LOCAL_UPLOADS === 'true';
const usingLocalUploads = !hasCloudinaryCredentials
    && useLocalUploads
    && process.env.NODE_ENV !== 'production';

let storage;

if (hasCloudinaryCredentials) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            const ext = path.extname(file.originalname).slice(1).toLowerCase();
            const rawExtensions = ['zip', 'rar', '7z', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'odt', 'rtf'];
            const isRaw = rawExtensions.includes(ext);

            return {
                folder: 'eplatform_files',
                resource_type: isRaw ? 'raw' : 'auto',
                public_id: `${Date.now()}_${randomUUID()}`
            };
        }
    });
} else if (usingLocalUploads) {
    const uploadsDirectory = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadsDirectory, { recursive: true });

    storage = multer.diskStorage({
        destination: uploadsDirectory,
        filename: (req, file, callback) => {
            callback(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
        }
    });
} else {
    const reason = hasPartialCloudinaryCredentials
        ? 'Cloudinary requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
        : 'Configure Cloudinary credentials or set LOCAL_UPLOADS=true for local development.';
    throw new Error(reason);
}

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadCloud = {
    single: (fieldName) => (req, res, next) => {
        upload.single(fieldName)(req, res, (error) => {
            if (!error && usingLocalUploads && req.file) {
                req.file.path = `/uploads/${req.file.filename}`;
            }
            next(error);
        });
    }
};

module.exports = { cloudinary, uploadCloud };