/**
 * backend/src/utils/uploadMiddleware.ts
 * Middleware for handling file uploads
 */
import multer from 'multer';
import { Request as ExpressRequest } from 'express';

// Configure multer memory storage
const storage = multer.memoryStorage();

// File size limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Define allowed file types with their mime types
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};

// File filter for validation
const fileFilter = (req: ExpressRequest, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  // Allow all types if no type specified
  if (!req.query.fileType) {
    return callback(null, true);
  }

  const fileType = req.query.fileType as string;
  const allowedTypes = ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];

  if (!allowedTypes) {
    return callback(null, false);
  }

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});

// Export middleware for various scenarios
export const uploadSingle = (fieldName: string = 'file') => upload.single(fieldName);
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => upload.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string, maxCount: number }[]) => upload.fields(fields); 