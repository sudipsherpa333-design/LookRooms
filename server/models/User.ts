import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { 
      type: String, 
      unique: true, 
      required: true,
      set: (val: string) => val ? encrypt(val) : val,
      get: (val: string) => val ? decrypt(val) : val
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "homeowner", "admin"],
      default: "user",
      index: true,
    },
    avatar: { type: String, default: "default-avatar-url" },
    bio: { type: String, default: "" },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    occupation: {
      type: String,
      enum: ["Student", "Working Professional", "Business", "Other"],
    },
    verificationLevel: {
      type: String,
      enum: [
        "unverified",
        "phone",
        "email",
        "document",
        "full",
        "pending",
        "rejected",
        "verified",
      ],
      default: "unverified",
    },
    trustScore: { type: Number, min: 0, max: 100, default: 0 },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isDocumentVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    documents: [
      {
        type: {
          type: String,
          enum: [
            "citizenship",
            "passport",
            "license",
            "utility",
            "Citizenship",
            "Passport",
            "Driving License",
          ],
        },
        documentNumber: {
          type: String,
          set: (val: string) => val ? encrypt(val) : val,
          get: (val: string) => val ? decrypt(val) : val
        },
        frontImage: { url: String, publicId: String },
        backImage: { url: String, publicId: String },
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
        submittedAt: Date,
        verifiedAt: Date,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rejectionReason: String,
      },
    ],
    renterProfile: {
      bio: String,
      preferences: {
        budget: { min: Number, max: Number },
        budgetAmount: Number,
        preferredAreas: [String],
        preferredCities: [String],
        roomType: [String],
        amenities: [String],
        moveInDate: Date,
        stayDuration: String,
      },
      lifestyle: {
        smoking: Boolean,
        drinking: Boolean,
        foodPreference: {
          type: String,
          enum: ["veg", "non-veg", "eggetarian"],
        },
        pets: Boolean,
        sleepSchedule: String,
        workFromHome: Boolean,
        socialHabits: String,
      },
      roommatePreferences: {
        lookingFor: {
          type: String,
          enum: ["roommate", "room+roommate", "none"],
        },
        genderPreference: String,
        ageRange: { min: Number, max: Number },
        occupationPreference: [String],
        languagePreference: [String],
      },
      savedSearches: [
        { type: mongoose.Schema.Types.ObjectId, ref: "SavedSearch" },
      ],
      favoriteListings: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
      ],
      applications: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
      ],
    },
    homeownerProfile: {
      whatsappNumber: String,
      propertyCount: { type: Number, default: 0 },
      totalListings: { type: Number, default: 0 },
      activeListings: { type: Number, default: 0 },
      rentedListings: { type: Number, default: 0 },
      properties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
      responseRate: { type: Number, default: 0 },
      averageResponseTime: Number,
      totalViews: { type: Number, default: 0 },
      totalInquiries: { type: Number, default: 0 },
      conversionRate: Number,
      subscription: {
        plan: {
          type: String,
          enum: ["free", "basic", "premium", "enterprise"],
          default: "free",
        },
        startDate: Date,
        endDate: Date,
        autoRenew: { type: Boolean, default: true },
        features: [String],
      },
      payoutInfo: {
        bankName: String,
        accountNumber: {
          type: String,
          set: (val: string) => val ? encrypt(val) : val,
          get: (val: string) => val ? decrypt(val) : val
        },
        accountHolder: String,
        esewaId: {
          type: String,
          set: (val: string) => val ? encrypt(val) : val,
          get: (val: string) => val ? decrypt(val) : val
        },
        khaltiPhone: {
          type: String,
          set: (val: string) => val ? encrypt(val) : val,
          get: (val: string) => val ? decrypt(val) : val
        },
      },
      businessName: String,
      panNumber: String,
      registeredAddress: String,
    },
    adminProfile: {
      permissions: [
        {
          type: String,
          enum: [
            "manage_users",
            "manage_listings",
            "manage_reports",
            "manage_system",
            "view_analytics",
          ],
        },
      ],
      department: String,
      accessLevel: { type: Number, min: 1, max: 5, default: 1 },
      lastLogin: Date,
      loginHistory: [
        {
          ip: String,
          userAgent: String,
          timestamp: Date,
        },
      ],
      assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "banned", "deactivated"],
      default: "active",
    },
    suspensionReason: String,
    lastActive: Date,
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    tenantRating: { type: Number, default: 0 },
    landlordRating: { type: Number, default: 0 },
    totalReviewsGiven: { type: Number, default: 0 },
    totalReviewsReceived: { type: Number, default: 0 },
    trustBadge: { type: String, enum: ['none','verified','trusted','superhost','top-tenant'], default: 'none' },
    referralCode: { type: String, unique: true, sparse: true },
    referralCount: { type: Number, default: 0 },
    kycDocumentType: String,
    kycDocumentUrl: String,
    kycIdNumber: {
      type: String,
      set: (val: string) => val ? encrypt(val) : val,
      get: (val: string) => val ? decrypt(val) : val
    },
    resetToken: String,
    resetTokenExpiry: Date,
    recoveryCode: String,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshTokens: [{
      token: String,
      createdAt: { type: Date, default: Date.now },
      userAgent: String,
      ip: String
    }],
    lastIp: String,
    savedPaymentTokens: [{
      gateway: { type: String, enum: ['esewa', 'khalti'] },
      token: { type: String },
      maskedInfo: { type: String },
      savedAt: { type: Date, default: Date.now }
    }]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

userSchema.index({ role: 1, verificationLevel: 1 });
userSchema.index({ "renterProfile.preferences.preferredAreas": 1 });

export const User = mongoose.model("User", userSchema);
