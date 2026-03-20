import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
const IV_LENGTH = 16;

if (ENCRYPTION_KEY.length !== 32) {
  console.error('CRITICAL: ENCRYPTION_KEY must be exactly 32 characters long.');
}

function encrypt(text: string, isSearchable: boolean = false): string {
  if (!text) return text;
  // For searchable fields, we use a deterministic IV derived from the text itself
  // This allows for searching but is less secure than random IVs
  const iv = isSearchable 
    ? crypto.createHash('md5').update(text).digest() 
    : crypto.randomBytes(IV_LENGTH);
    
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return text; // Not encrypted or wrong format
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Decryption failed:', err instanceof Error ? err.message : String(err));
    return text; // Return original text if decryption fails
  }
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'tenant' | 'landlord' | 'admin';
  phone: string;
  avatar?: string;
  isVerified: boolean;
  verificationLevel: number;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'none';
  kycIdNumber?: string;
  documentNumber?: string;
  payoutInfo?: {
    bankName?: string;
    accountNumber?: string;
    esewaId?: string;
    khaltiId?: string;
  };
  savedListings: mongoose.Types.ObjectId[];
  favorites: mongoose.Types.ObjectId[];
  trustScore: number;
  refreshToken?: string;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['tenant', 'landlord', 'admin'], default: 'tenant' },
  phone: { 
    type: String, 
    required: true,
    unique: true,
    get: decrypt,
    set: (v: string) => encrypt(v, true)
  },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationLevel: { type: Number, default: 0 },
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'none'], default: 'none' },
  kycIdNumber: { 
    type: String,
    get: decrypt,
    set: encrypt
  },
  documentNumber: { 
    type: String,
    get: decrypt,
    set: encrypt
  },
  payoutInfo: {
    bankName: { type: String },
    accountNumber: { 
      type: String,
      get: decrypt,
      set: encrypt
    },
    esewaId: { 
      type: String,
      get: decrypt,
      set: encrypt
    },
    khaltiId: { 
      type: String,
      get: decrypt,
      set: encrypt
    }
  },
  savedListings: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
  trustScore: { type: Number, default: 50 },
  refreshToken: { type: String, select: false }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password!, 12);
  next();
});

userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password!);
};

export const User = mongoose.model<IUser>('User', userSchema);
