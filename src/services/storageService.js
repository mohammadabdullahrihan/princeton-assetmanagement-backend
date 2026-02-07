const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Select provider based on environment
const storageType = process.env.STORAGE_TYPE || 'local';
const provider = storageType === 's3' 
  ? require('./storageProviders/s3StorageProvider') 
  : require('./storageProviders/localStorageProvider');

// Multer Disk Storage (Still needed for temporary handling or local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/postscript', // AI
    'image/vnd.adobe.photoshop', // PSD
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/svg+xml'
  ];
  
  if (allowedTypes.includes(file.mimetype) || 
      file.originalname.match(/\.(ai|psd|pdf|png|jpg|jpeg|svg)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Allowed: AI, PSD, PDF, PNG, JPG, SVG'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter,
});

/**
 * Storage Service Abstraction Layer
 */
const storageService = {
  upload,
  
  getFileMetadata: (file) => {
    return {
      url: provider.getPublicUrl(file.filename),
      format: path.extname(file.originalname).replace('.', '').toUpperCase(),
      size: file.size,
      originalName: file.originalname,
      uploadedAt: new Date()
    };
  },

  deleteFile: async (filePath) => {
    // If it's a full URL (S3), or a relative path (Local)
    return await provider.delete(filePath);
  }
};

module.exports = storageService;
