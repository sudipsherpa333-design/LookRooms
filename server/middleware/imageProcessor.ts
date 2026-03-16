import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export const processListingImages = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || !(req.files as any).length) return next();

  try {
    const files = req.files as Express.Multer.File[];
    
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const buffer = await sharp(file.buffer)
          .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        
        return {
          ...file,
          buffer,
          mimetype: 'image/webp',
          originalname: file.originalname.replace(/\.[^/.]+$/, "") + ".webp"
        };
      })
    );

    (req as any).files = processedFiles;
    next();
  } catch (error) {
    logger.error(`Image processing failed: ${error}`);
    next(error);
  }
};
