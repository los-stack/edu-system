require('dotenv').config(); 

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const rawExtensions = ['zip', 'rar', '7z', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'odt', 'rtf'];
        
        const isRaw = rawExtensions.includes(ext);

        return {
            folder: 'eplatform_files',
            resource_type: isRaw ? 'raw' : 'auto',
            public_id: isRaw ? `${Date.now()}_${file.originalname}` : `${Date.now()}_${Math.floor(Math.random() * 1000)}`
        };
    }
});

const uploadCloud = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

module.exports = { cloudinary, uploadCloud };