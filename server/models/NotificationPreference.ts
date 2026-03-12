import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  categories: {
    booking: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, sms: { type: Boolean, default: true } },
    payment: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, sms: { type: Boolean, default: true } },
    chat: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: false }, push: { type: Boolean, default: true }, sms: { type: Boolean, default: false } },
    listing: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: true }, push: { type: Boolean, default: false }, sms: { type: Boolean, default: false } },
    review: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: true }, push: { type: Boolean, default: false }, sms: { type: Boolean, default: false } },
    agreement: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, sms: { type: Boolean, default: false } },
    trust: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, sms: { type: Boolean, default: true } },
    kyc: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, sms: { type: Boolean, default: true } },
    growth: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: false }, push: { type: Boolean, default: false }, sms: { type: Boolean, default: false } },
    system: { inApp: { type: Boolean, default: true }, email: { type: Boolean, default: true }, push: { type: Boolean, default: false }, sms: { type: Boolean, default: false } }
  },
  emailDigest: {
    enabled: { type: Boolean, default: true },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'weekly' },
    dayOfWeek: { type: Number, default: 1 },
    timeOfDay: { type: String, default: '09:00' }
  },
  quietHours: {
    enabled: { type: Boolean, default: true },
    start: { type: String, default: '22:00' },
    end: { type: String, default: '08:00' },
    timezone: { type: String, default: 'Asia/Kathmandu' }
  },
  pushToken: { type: String },
  pushTokenWeb: { type: String },
  emailBounced: { type: Boolean, default: false },
  unsubscribeToken: { type: String },
  unsubscribedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export const NotificationPreference = mongoose.model("NotificationPreference", notificationPreferenceSchema);
