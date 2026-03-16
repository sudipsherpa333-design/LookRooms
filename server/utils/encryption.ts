import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.warn("WARNING: ENCRYPTION_KEY is not set or invalid. Using insecure fallback.");
}
const IV_LENGTH = 16; // For AES

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (text: string): string => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
