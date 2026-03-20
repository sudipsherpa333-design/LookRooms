import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: any;
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: true
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
