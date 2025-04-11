/**
 * backend/src/routes/uploadRoutes.ts
 * API routes for file upload and management
 */
import express from 'express';
import { expressjwt, Request as JWTRequest } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import multer from 'multer';
import UserModel from '../models/UserModel';
import FileModel from '../models/FileModel';
import { uploadSingle, uploadMultiple } from '../utils/uploadMiddleware';
import { uploadBlob, getBlobInfo, deleteBlob, listBlobs } from '../utils/blobStorage';

const router = express.Router();

// JWT validation middleware
const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AZURE_AUTHORITY}/discovery/v2.0/keys`
  }),
  audience: process.env.AZURE_CLIENT_ID,
  issuer: process.env.AZURE_AUTHORITY,
  algorithms: ['RS256']
});

// Middleware to extract user ID from token
const extractUserId = async (req: JWTRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const email = req.auth?.email || req.auth?.preferred_username;
    
    if (!email) {
      return res.status(400).json({ error: 'Missing email in token' });
    }
    
    const user = await UserModel.getUserByEmail(email as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.body.userId = user.id;
    next();
  } catch (error) {
    console.error('Error extracting user ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Error handler for multer errors
const handleMulterError = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large',
        message: 'File size exceeds the 10MB limit'
      });
    }
    return res.status(400).json({ 
      error: err.code,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      error: 'Upload error',
      message: err.message
    });
  }
  
  next();
};

// Upload a single file
router.post('/file', checkJwt, extractUserId, (req, res, next) => {
  uploadSingle('file')(req, res, (err) => {
    handleMulterError(err, req, res, next);
    
    if (!err) next();
  });
}, async (req: JWTRequest & { file?: Express.Multer.File }, res) => {
  try {
    const { userId } = req.body;
    const { category, relatedEntityId } = req.query;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Upload to blob storage
    const result = await uploadBlob(
      file.buffer,
      file.originalname,
      file.mimetype
    );
    
    // Store file metadata in database
    const fileRecord = await FileModel.createFile({
      userId,
      fileName: file.originalname,
      blobName: result.blobName,
      url: result.url,
      contentType: file.mimetype,
      size: file.size,
      category: category as string,
      relatedEntityId: relatedEntityId as string
    });
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        blobName: fileRecord.blobName,
        url: fileRecord.url,
        size: fileRecord.size,
        contentType: fileRecord.contentType,
        category: fileRecord.category,
        relatedEntityId: fileRecord.relatedEntityId,
        createdAt: fileRecord.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files
router.post('/files', checkJwt, extractUserId, (req, res, next) => {
  uploadMultiple('files', 5)(req, res, (err) => {
    handleMulterError(err, req, res, next);
    
    if (!err) next();
  });
}, async (req: JWTRequest & { files?: Express.Multer.File[] }, res) => {
  try {
    const { userId } = req.body;
    const { category, relatedEntityId } = req.query;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadResults = [];
    
    // Upload each file
    for (const file of files) {
      const result = await uploadBlob(
        file.buffer,
        file.originalname,
        file.mimetype
      );
      
      // Store file metadata in database
      const fileRecord = await FileModel.createFile({
        userId,
        fileName: file.originalname,
        blobName: result.blobName,
        url: result.url,
        contentType: file.mimetype,
        size: file.size,
        category: category as string,
        relatedEntityId: relatedEntityId as string
      });
      
      uploadResults.push({
        id: fileRecord.id,
        fileName: fileRecord.fileName,
        blobName: fileRecord.blobName,
        url: fileRecord.url,
        size: fileRecord.size,
        contentType: fileRecord.contentType,
        category: fileRecord.category,
        relatedEntityId: fileRecord.relatedEntityId,
        createdAt: fileRecord.createdAt
      });
    }
    
    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadResults
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Get file info
router.get('/file/:blobName', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { blobName } = req.params;
    
    const blobInfo = await getBlobInfo(blobName);
    
    res.json(blobInfo);
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// List all files (can be filtered by prefix)
router.get('/files', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { prefix } = req.query;
    
    const blobs = await listBlobs(prefix as string);
    
    res.json(blobs);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Delete a file
router.delete('/file/:id', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const fileId = req.params.id;
    
    // Get file metadata to check ownership and get blob name
    const fileRecord = await FileModel.getFileById(fileId);
    
    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Check if user owns the file
    if (fileRecord.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this file' });
    }
    
    // Delete from blob storage
    await deleteBlob(fileRecord.blobName);
    
    // Delete metadata from database
    await FileModel.deleteFile(fileId);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get files by user
router.get('/user-files', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const { category } = req.query;
    
    let files;
    if (category) {
      files = await FileModel.getFilesByCategory(userId, category as string);
    } else {
      files = await FileModel.getFilesByUserId(userId);
    }
    
    res.json(files);
  } catch (error) {
    console.error('Error fetching user files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get files by related entity (e.g., task, project)
router.get('/entity-files/:entityId', checkJwt, extractUserId, async (req: JWTRequest, res) => {
  try {
    const { userId } = req.body;
    const { entityId } = req.params;
    
    const files = await FileModel.getFilesByRelatedEntity(entityId);
    
    // Filter files to only return those owned by the user
    const userFiles = files.filter(file => file.userId === userId);
    
    res.json(userFiles);
  } catch (error) {
    console.error('Error fetching entity files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

export default router; 