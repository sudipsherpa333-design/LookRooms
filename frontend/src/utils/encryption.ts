import CryptoJS from 'crypto-js';

// @ts-ignore
const SECRET_KEY = import.meta.env?.VITE_ENCRYPTION_KEY || 'default-secret-key-for-chat-123';

export const encryptMessage = (text: string, conversationId: string): string => {
  if (!text) return text;
  try {
    const key = `${SECRET_KEY}-${conversationId}`;
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return text;
  }
};

export const decryptMessage = (encryptedText: string, conversationId: string): string => {
  if (!encryptedText) return encryptedText;
  try {
    const key = `${SECRET_KEY}-${conversationId}`;
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails (e.g., it wasn't encrypted), return original
    return decryptedText || encryptedText;
  } catch (error) {
    // If it's not valid AES, just return the original text
    return encryptedText;
  }
};
