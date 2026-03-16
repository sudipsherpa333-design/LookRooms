import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toEmail: { type: String },
  subject: { type: String },
  templateName: { type: String },
  messageId: { type: String },
  provider: { type: String, enum: ['nodemailer', 'sendgrid'] },
  status: { type: String, enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'] },
  attempts: { type: Number, default: 0 },
  lastAttemptAt: { type: Date },
  error: { type: String },
  openedAt: { type: Date },
  clickedAt: { type: Date },
  bouncedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const EmailLog = mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);
