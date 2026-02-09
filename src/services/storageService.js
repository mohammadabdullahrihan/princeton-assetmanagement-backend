const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Select provider based on environment
const storageType = process.env.STORAGE_TYPE || 'local';
const provider = storageType === 'imgbb'
  ? require('./storageProviders/imgbbStorageProvider')
  : storageType === 'google_drive'
  ? require('./storageProviders/googleDriveStorageProvider')
  : storageType === 's3' 
  ? require('./storageProviders/s3StorageProvider') 
  : require('./storageProviders/localStorageProvider');

// Use memory storage for cloud providers (imgbb, s3, google_drive)
// Use disk storage only for local development
const storage = (storageType === 'imgbb' || storageType === 'google_drive' || storageType === 's3')
  ? multer.memoryStorage()
  : multer.diskStorage({
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

  uploadFiles: async (files) => {
    if (storageType === 'imgbb') {
      const uploadedFiles = [];
      for (const file of files) {
        const result = await provider.upload(file);
        uploadedFiles.push({
          url: result.url,
          externalId: result.id,
          format: path.extname(file.originalname).replace('.', '').toUpperCase(),
          size: file.size,
          originalName: file.originalname,
          uploadedAt: new Date()
        });
      }
      return uploadedFiles;
    }
    
    if (storageType === 'google_drive') {
      const uploadedFiles = [];
      for (const file of files) {
        const result = await provider.upload(file);
        uploadedFiles.push({
          url: result.url,
          driveId: result.id,
          format: path.extname(file.originalname).replace('.', '').toUpperCase(),
          size: file.size,
          originalName: file.originalname,
          uploadedAt: new Date()
        });
      }
      return uploadedFiles;
    }
    return files.map(file => storageService.getFileMetadata(file));
  },

  deleteFile: async (filePath) => {
    // If it's a drive ID or local path
    return await provider.delete(filePath);
  }
};

module.exports = storageService;
