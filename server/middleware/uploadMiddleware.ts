import multer from 'multer';
import { Request } from 'express';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images and documents are allowed!'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Placeholder for virus scanning
export const scanFile = async (file: Express.Multer.File) => {
  // In a real production environment, integrate with ClamAV or a cloud-based virus scanner
  console.log(`Scanning file: ${file.originalname} for viruses...`);
  return true; // Mocked: assume file is clean
};
