import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemSettings extends Document {
  defaultServiceFee: number;
  maintenanceMode: boolean;
  notificationSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  };
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const systemSettingsSchema = new Schema<ISystemSettings>({
  defaultServiceFee: {
    type: Number,
    required: true,
    default: 5.0, // Default 5% service fee
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  notificationSettings: {
    emailEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: true },
    pushEnabled: { type: Boolean, default: true },
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Ensure only one settings document exists
systemSettingsSchema.pre('save', async function(this: any, next: any) {
  if (this.isNew) {
    const count = await mongoose.models.SystemSettings.countDocuments();
    if (count > 0) {
      return next(new Error('Only one SystemSettings document can exist'));
    }
  }
  next();
});

export const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
