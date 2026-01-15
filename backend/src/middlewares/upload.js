const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const AppError = require('../utils/appError');

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ALLOWED_ALL_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

/**
 * Configure storage
 */
const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(config.upload.path, subfolder);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  });
};

/**
 * File filter factory
 */
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        AppError.badRequest(
          `Invalid file type. Allowed types: ${allowedTypes.map((t) => t.split('/')[1]).join(', ')}`
        ),
        false
      );
    }
  };
};

/**
 * Image upload configuration
 */
const uploadImage = multer({
  storage: createStorage('images'),
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES),
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
});

/**
 * Document upload configuration
 */
const uploadDocument = multer({
  storage: createStorage('documents'),
  fileFilter: createFileFilter(ALLOWED_DOCUMENT_TYPES),
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 5,
  },
});

/**
 * Any file upload configuration
 */
const uploadAny = multer({
  storage: createStorage('documents'),
  fileFilter: createFileFilter(ALLOWED_ALL_TYPES),
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
});

/**
 * Memory storage for processing
 */
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter: createFileFilter(ALLOWED_ALL_TYPES),
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
});

/**
 * Get public URL for uploaded file
 */
const getFileUrl = (filename, subfolder = 'documents') => {
  return `${config.urls.backend}/uploads/${subfolder}/${filename}`;
};

/**
 * Delete uploaded file
 */
const deleteFile = async (filepath) => {
  const fs = require('fs').promises;
  try {
    await fs.unlink(filepath);
    return true;
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
    return false;
  }
};

module.exports = {
  uploadImage,
  uploadDocument,
  uploadAny,
  uploadMemory,
  getFileUrl,
  deleteFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
};
