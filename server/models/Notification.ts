import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  shortMessage: { type: String },
  data: {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingRequest' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceFeePayment' },
    agreementId: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalAgreement' },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actionUrl: { type: String },
    imageUrl: { type: String },
    amount: { type: Number },
    metadata: { type: Object }
  },
  channels: {
    inApp: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      read: { type: Boolean, default: false },
      readAt: { type: Date }
    },
    email: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      opened: { type: Boolean, default: false },
      openedAt: { type: Date },
      clicked: { type: Boolean, default: false },
      clickedAt: { type: Date },
      bounced: { type: Boolean, default: false },
      messageId: { type: String }
    },
    push: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      clicked: { type: Boolean, default: false }
    },
    sms: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: { type: Date },
      delivered: { type: Boolean, default: false }
    }
  },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  category: { type: String, enum: ['booking', 'payment', 'chat', 'listing', 'review', 'agreement', 'trust', 'kyc', 'growth', 'system'] },
  isArchived: { type: Boolean, default: false },
  expiresAt: { type: Date },
  scheduledFor: { type: Date },
  retryCount: { type: Number, default: 0 },
  lastError: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.model("Notification", notificationSchema);
