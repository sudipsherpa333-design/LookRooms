import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "homeowner", "admin", "agent"],
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
        documentNumber: String,
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
        accountNumber: String,
        accountHolder: String,
        esewaId: String,
        khaltiPhone: String,
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

    // Legacy fields for backward compatibility
    kycDocumentType: String,
    kycDocumentUrl: String,
    kycIdNumber: String,
    resetToken: String,
    resetTokenExpiry: Date,
    recoveryCode: String,
    savedPaymentTokens: [{
      gateway: { type: String, enum: ['esewa', 'khalti'] },
      token: { type: String },
      maskedInfo: { type: String }, // e.g. "eSewa: 98XXXXX123"
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

const listingSchema = new mongoose.Schema(
  {
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    whatsappNumber: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },

    propertyType: {
      type: String,
      enum: [
        "Single Room",
        "Double Room",
        "Triple Room",
        "Studio Apartment",
        "1BHK",
        "2BHK",
        "3BHK",
        "Whole House",
        "Flat/Apartment",
        "Hostel Bed",
        "Commercial Space",
        "Office Space",
      ],
      required: true,
      default: "Single Room",
    },

    price: { type: Number, required: true, min: 0 },
    priceNegotiable: { type: Boolean, default: false },
    securityDeposit: { type: Number, min: 0 },
    maintenanceCharges: { type: Number, min: 0 },
    electricityCharges: {
      type: String,
      enum: ["included", "separate", "metered"],
    },
    waterCharges: { type: String, enum: ["included", "separate"] },

    location: {
      address: { type: String, required: true },
      street: String,
      area: { type: String, required: true, index: true },
      city: {
        type: String,
        enum: ["Kathmandu", "Lalitpur", "Bhaktapur", "Kirtipur"],
        required: true,
        index: true,
      },
      wardNo: Number,
      landmark: String,
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      googlePlaceId: String,
      nearbyColleges: [
        {
          name: String,
          distance: Number,
        },
      ],
      nearbyOffices: [
        {
          name: String,
          distance: Number,
        },
      ],
      nearbyMarkets: [String],
    },

    roomDetails: {
      numberOfRooms: Number,
      floor: Number,
      totalFloors: Number,
      roomSize: Number,
      facing: String,
      attachedBathroom: Boolean,
      balcony: Boolean,
      windows: Number,
      furnishing: {
        type: String,
        enum: ["Full Furnished", "Semi Furnished", "Unfurnished"],
      },
      furnitureList: [String],
      bathroomType: { type: String, enum: ["attached", "common", "both"] },
      kitchenType: { type: String, enum: ["attached", "common", "none"] },
    },

    amenities: {
      waterSource: {
        type: String,
        enum: ["Melamchi", "Boring", "Well", "Tanker", "Municipal", "Multiple"],
        required: true,
        default: "Municipal",
      },
      waterTiming: String,
      waterTank: Boolean,
      waterFilter: Boolean,

      electricityBackup: {
        inverter: { available: Boolean, capacity: String },
        generator: { available: Boolean, fuelType: String },
        solar: { available: Boolean, panelCount: Number },
        backupHours: Number,
      },

      internet: {
        type: mongoose.Schema.Types.Mixed,
      },
      sunExposure: {
        type: String,
        enum: ["Full Day", "Morning", "Afternoon", "None"],
      },
      ventilation: String,
      heating: [String],
      cooling: [String],

      parking: {
        bike: { available: Boolean, covered: Boolean, count: Number },
        car: { available: Boolean, covered: Boolean, count: Number },
        cycle: { available: Boolean, secure: Boolean },
        type: { type: String, enum: ["Open", "Covered", "Garage", "Street"] },
      },

      security: {
        guard: Boolean,
        cctv: Boolean,
        intercom: Boolean,
        secureDoors: Boolean,
        fireSafety: Boolean,
      },

      commonAreas: [
        {
          type: String,
          shared: Boolean,
          description: String,
        },
      ],

      additional: [
        {
          name: String,
          available: Boolean,
          charges: Number,
        },
      ],
    },

    rules: {
      genderPreference: {
        type: String,
        enum: [
          "Male Only",
          "Female Only",
          "Any",
          "Family Only",
          "Couple Friendly",
        ],
      },
      occupationPreference: {
        students: Boolean,
        working: Boolean,
        families: Boolean,
        anyone: Boolean,
      },
      foodPreference: {
        type: String,
        enum: [
          "Veg Only",
          "Non-Veg Allowed",
          "Eggetarian Only",
          "No Restriction",
        ],
      },
      smoking: { allowed: Boolean, area: String },
      drinking: { allowed: Boolean, area: String },
      pets: {
        type: mongoose.Schema.Types.Mixed,
      },
      visitors: { allowed: Boolean, timings: String },
      overnightGuests: { allowed: Boolean, priorNotice: Boolean },
      curfew: String,
      noiseLevel: String,
      cleaning: {
        responsibility: String,
        schedule: String,
      },
      additionalRules: [String],
    },

    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        isPrimary: { type: Boolean, default: false },
        caption: String,
        order: Number,
      },
    ],
    videos: [
      {
        url: String,
        thumbnail: String,
        title: String,
      },
    ],
    virtualTour: String,
    floorPlan: String,

    availableFrom: { type: Date, default: Date.now, index: true },
    minimumStay: Number,
    maximumStay: Number,
    availableFor: [String],
    totalRooms: Number,
    availableRooms: Number,

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "active",
        "rented",
        "occupied",
        "unavailable",
        "rejected",
        "archived",
      ],
      default: "draft",
      index: true,
    },
    locked: { type: Boolean, default: false },
    lockExpiration: Date,
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: String,

    homeownerControls: {
      autoAcceptInquiries: { type: Boolean, default: false },
      requireScreening: { type: Boolean, default: true },
      screeningQuestions: [
        {
          question: String,
          required: Boolean,
          options: [String],
        },
      ],
      viewingInstructions: String,
      preferredContactMethod: {
        type: String,
        enum: ["chat", "phone", "email", "whatsapp"],
        default: "chat",
      },
      instantBooking: { type: Boolean, default: false },
      advanceBookingDays: Number,
      showExactLocation: { type: Boolean, default: true },
    },

    metrics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      inquiries: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      reports: { type: Number, default: 0 },
      viewHistory: [
        {
          date: Date,
          count: Number,
        },
      ],
    },

    promotion: {
      isFeatured: { type: Boolean, default: false },
      featuredUntil: Date,
      isUrgent: { type: Boolean, default: false },
      urgentUntil: Date,
      badge: String,
      promotedAt: Date,
    },

    metaTitle: String,
    metaDescription: String,
    keywords: [String],

    lockStatus: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockExpiresAt: { type: Date },

    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: Date,
    expiresAt: Date,
    lastActiveAt: Date,

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    ratingBreakdown: {
      cleanliness: Number,
      ownerResponse: Number,
      waterSupply: Number,
      electricity: Number,
      location: Number,
      valueForMoney: Number,
      security: Number
    },
    shareCount: { type: Number, default: 0 },
    totalShareClicks: { type: Number, default: 0 },

    // AI Quality & Market Data
    qualityScore: { type: Number, default: 0 },
    qualityBreakdown: {
      photos:       { score: Number, feedback: String },
      title:        { score: Number, feedback: String },
      description:  { score: Number, feedback: String },
      pricing:      { score: Number, feedback: String },
      amenities:    { score: Number, feedback: String },
      contactInfo:  { score: Number, feedback: String }
    },
    isQualityApproved: { type: Boolean, default: false },
    qualityCheckedAt:  { type: Date },
    boostScore:        { type: Number, default: 0 },
    marketData: {
      avgAreaPrice:    Number,
      pricePercentile: Number,
      demandLevel:     String,
      suggestedPrice:  Number,
      priceHistory:    [{ price: Number, changedAt: Date }],
      lastMarketUpdate:Date
    },

    // Legacy fields for backward compatibility
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    address: String,
    area: String,
    city: String,
    roomType: String,
    waterSource: String,
    hasInverter: Boolean,
    sunExposure: String,
    genderPreference: String,
    foodPreference: String,
    listedBy: { type: String, enum: ['owner', 'agent'], default: 'owner' },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    actualOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    agentServiceFee: { type: Number },
    agentFeeLabel: { type: String },
    agentFeeNote: { type: String },
    isAgentListing: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Pre-validate hook to sync legacy fields with new schema structure before validation
listingSchema.pre("validate", function () {
  const doc = this as any;
  if (doc.landlordId && !doc.homeowner) {
    doc.homeowner = doc.landlordId;
  }
  if (doc.homeowner && !doc.landlordId) {
    doc.landlordId = doc.homeowner;
  }

  if (doc.address && !doc.location?.address) {
    doc.location = doc.location || {};
    doc.location.address = doc.address;
  }
  if (doc.area && !doc.location?.area) {
    doc.location = doc.location || {};
    doc.location.area = doc.area;
  }
  if (doc.city && !doc.location?.city) {
    doc.location = doc.location || {};
    doc.location.city = doc.city;
  }

  if (doc.roomType && !doc.propertyType) {
    doc.propertyType = doc.roomType;
  }

  if (doc.waterSource && !doc.amenities?.waterSource) {
    doc.amenities = doc.amenities || {};
    doc.amenities.waterSource = doc.waterSource;
  }

  if (
    doc.hasInverter !== undefined &&
    !doc.amenities?.electricityBackup?.inverter?.available
  ) {
    doc.amenities = doc.amenities || {};
    doc.amenities.electricityBackup = doc.amenities.electricityBackup || {};
    doc.amenities.electricityBackup.inverter =
      doc.amenities.electricityBackup.inverter || {};
    doc.amenities.electricityBackup.inverter.available = doc.hasInverter;
  }

  if (doc.sunExposure && !doc.amenities?.sunExposure) {
    doc.amenities = doc.amenities || {};
    doc.amenities.sunExposure = doc.sunExposure;
  }

  if (doc.genderPreference && !doc.rules?.genderPreference) {
    doc.rules = doc.rules || {};
    doc.rules.genderPreference = doc.genderPreference;
  }

  if (doc.foodPreference && !doc.rules?.foodPreference) {
    doc.rules = doc.rules || {};
    doc.rules.foodPreference = doc.foodPreference;
  }

  if (doc.hasInternet !== undefined && !doc.amenities?.internet?.available) {
    doc.amenities = doc.amenities || {};
    doc.amenities.internet = doc.amenities.internet || {};
    doc.amenities.internet.available = doc.hasInternet;
  }

  if (doc.hasParking !== undefined && !doc.amenities?.parking?.bike?.available) {
    doc.amenities = doc.amenities || {};
    doc.amenities.parking = doc.amenities.parking || {};
    doc.amenities.parking.bike = doc.amenities.parking.bike || {};
    doc.amenities.parking.bike.available = doc.hasParking;
  }

  if (doc.smokingAllowed !== undefined && !doc.rules?.smoking?.allowed) {
    doc.rules = doc.rules || {};
    doc.rules.smoking = doc.rules.smoking || {};
    doc.rules.smoking.allowed = doc.smokingAllowed;
  }

  if (doc.petsAllowed !== undefined && !doc.rules?.pets?.allowed) {
    doc.rules = doc.rules || {};
    doc.rules.pets = doc.rules.pets || {};
    doc.rules.pets.allowed = doc.petsAllowed;
  }

  if (doc.furnishing && !doc.roomDetails?.furnishing) {
    doc.roomDetails = doc.roomDetails || {};
    doc.roomDetails.furnishing = doc.furnishing;
  }
  if (doc.bathroomType && !doc.roomDetails?.bathroomType) {
    doc.roomDetails = doc.roomDetails || {};
    doc.roomDetails.bathroomType = doc.bathroomType.toLowerCase();
  }
  if (doc.kitchenType && !doc.roomDetails?.kitchenType) {
    doc.roomDetails = doc.roomDetails || {};
    doc.roomDetails.kitchenType = doc.kitchenType === 'Private' ? 'attached' : doc.kitchenType === 'Shared' ? 'common' : 'none';
  }
  if (doc.floor !== undefined && doc.roomDetails?.floor === undefined) {
    doc.roomDetails = doc.roomDetails || {};
    doc.roomDetails.floor = doc.floor === 'Ground' ? 0 : parseInt(doc.floor, 10) || 1;
  }
});

listingSchema.index({ "location.area": 1, "location.city": 1, status: 1, price: 1 });
listingSchema.index({ "location.coordinates": "2dsphere" });
listingSchema.index({ homeowner: 1, status: 1 });
listingSchema.index({ propertyType: 1, price: 1 });

export const Listing = mongoose.model("Listing", listingSchema);

const applicationSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  homeowner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: [
      "pending",
      "under_review",
      "accepted",
      "rejected",
      "cancelled",
      "completed",
    ],
    default: "pending",
  },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid", "failed"],
    default: "unpaid",
  },

  message: String,

  personalInfo: {
    fullName: String,
    phone: String,
    email: String,
    currentAddress: String,
    occupation: String,
    workplace: String,
    idType: String,
    idNumber: String,
  },

  preferences: {
    moveInDate: Date,
    stayDuration: String,
    numberOfOccupants: Number,
    vehicleInfo: {
      hasBike: Boolean,
      hasCar: Boolean,
      hasCycle: Boolean,
    },
  },

  screeningAnswers: [
    {
      questionId: String,
      question: String,
      answer: String,
    },
  ],

  documents: [
    {
      type: String,
      url: String,
      verified: Boolean,
    },
  ],

  appliedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  respondedAt: Date,
  viewingScheduled: Date,
  viewingConfirmed: Boolean,

  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  lastMessageAt: Date,

  decisionReason: String,
  decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  decisionAt: Date,
});

export const Application = mongoose.model("Application", applicationSchema);

const savedSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  filters: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const SavedSearch = mongoose.model("SavedSearch", savedSearchSchema);

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  roomListing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  image: { type: String },
  messageType: { type: String, enum: [
    'text','image','file','audio',
    'template','system','location', 'reaction'
  ], default: "text" },
  audioUrl:     String,
  audioDuration:Number,
  fileUrl:      String,
  fileName:     String,
  fileSize:     Number,
  templateType: String,
  isTranslated: Boolean,
  originalText: String,
  translatedText:String,
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDeleted: { type: Boolean, default: false },
  reactions: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reaction: String,
    emoji: String
  }]
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);

const contactLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  contactMethod: { type: String, default: "whatsapp" },
  platform: { type: String, default: "whatsapp" },
  timestamp: { type: Date, default: Date.now },
});

export const ContactLog = mongoose.model("ContactLog", contactLogSchema);

const viewedListingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
  viewedAt: { type: Date, default: Date.now },
});
viewedListingSchema.index({ userId: 1, viewedAt: -1 });
export const ViewedListing = mongoose.model("ViewedListing", viewedListingSchema);

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  amount: { type: Number, required: true },
  serviceFee: { type: Number },
  totalAmount: { type: Number },
  paymentMethod: { type: String, enum: ['esewa', 'khalti'], required: true },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String, unique: true, sparse: true },
  pidx: { type: String }, // Khalti payment index
  refId: { type: String }, // eSewa ref ID
  gatewayResponse: { type: Object }, // raw gateway response
  idempotencyKey: { type: String, unique: true, sparse: true },
  retryCount: { type: Number, default: 0 },
  retryExpiry: { type: Date }, // 10 min from first failure
  retryHistory: [{ timestamp: Date, status: String, gateway: String }],
  oneTapToken: { type: String }, // saved token for one-tap
  refund: {
    status: { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' },
    reason: { type: String },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refundDate: { type: Date },
    refundTxnId: { type: String },
    gatewayRefundResponse: { type: Object }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['payment', 'booking', 'refund', 'general', 'other'] },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }, // optional link to payment
  adminReply: { type: String },
  repliedAt: { type: Date },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

const feeRuleSchema = new mongoose.Schema({
  minAmount: { type: Number },
  maxAmount: { type: Number },
  feeType: { type: String, enum: ['flat', 'percentage'] },
  feeValue: { type: Number },
  label: { type: String }, // e.g. "Service Fee"
  isActive: { type: Boolean, default: true }
});

export const FeeRule = mongoose.model("FeeRule", feeRuleSchema);

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String },
  channels: {
    inApp: { sent: { type: Boolean, default: false }, deliveredAt: Date },
    email: { sent: { type: Boolean, default: false }, deliveredAt: Date, error: String },
    push:  { sent: { type: Boolean, default: false }, deliveredAt: Date, error: String },
    sms:   { sent: { type: Boolean, default: false }, deliveredAt: Date, error: String }
  },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.model("Notification", notificationSchema);

export * from "./models/agent/Agent.js";
export * from "./models/agent/AgentLead.js";
export * from "./models/agent/AgentReview.js";


const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  reviewerRole: { type: String, enum: ['tenant', 'landlord'] },
  ratings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    ownerResponse: { type: Number, min: 1, max: 5 },
    waterSupply: { type: Number, min: 1, max: 5 },
    electricity: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
    security: { type: Number, min: 1, max: 5 },
    overallExperience: { type: Number, min: 1, max: 5 }
  },
  tenantRatings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    rentPaymentTime: { type: Number, min: 1, max: 5 },
    behaviour: { type: Number, min: 1, max: 5 },
    propertyCaretaking: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 }
  },
  comment: { type: String, maxLength: 1000 },
  isPublic: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending','published','flagged','removed'], default: 'pending' },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ownerReply: { type: String },
  ownerRepliedAt: { type: Date },
  flaggedReason: { type: String },
  averageRating: { type: Number },
  
  // Advanced Review Features
  photoUrls:      [{ type: String }],
  stayDuration:   { type: Number },
  isPhotoVerified:{ type: Boolean, default: false },
  aiSummaryUsed:  { type: Boolean, default: false },
  dispute: {
    status:     { type: String, enum: ['none', 'pending', 'resolved', 'dismissed'], default: 'none' },
    reason:     String,
    evidence:   [String],
    resolution: String,
    resolvedAt: Date
  },
  incentiveGiven: { type: Boolean, default: false },
  incentiveAmount:{ type: Number }
}, { timestamps: true });
export const Review = mongoose.model("Review", reviewSchema);

const shareTrackingSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  platform: { type: String, enum: ['whatsapp','facebook','messenger','twitter','copy_link','instagram'] },
  ipAddress: { type: String },
  userAgent: { type: String },
  clickCount: { type: Number, default: 0 },
}, { timestamps: true });
export const ShareTracking = mongoose.model("ShareTracking", shareTrackingSchema);

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String },
  targetType: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object },
  ipAddress: { type: String },
}, { timestamps: true });
export const AdminLog = mongoose.model("AdminLog", adminLogSchema);

const maintenanceRequestSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  homeownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  images: [String],
  category: { type: String, enum: ['plumbing', 'electrical', 'appliance', 'structural', 'other'], default: 'other' },
  adminNotes: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: true });

export const MaintenanceRequest = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);

const propertySchema = new mongoose.Schema({
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  address:     String,
  totalRooms:  Number,
  sharedPhotos:[String],
  amenities:   [String],
  rooms:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }]
}, { timestamps: true });

export const Property = mongoose.model("Property", propertySchema);

const boostSchema = new mongoose.Schema({
  listingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tier:        { type: String, enum: ['basic', 'premium', 'superboost'], required: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  cost:        Number,
  paymentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  impressions: { type: Number, default: 0 },
  extraViews:  { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

export const Boost = mongoose.model("Boost", boostSchema);

const subscriptionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:         { type: String, enum: ['tenant_premium', 'landlord_premium'], required: true },
  status:       { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate:    { type: Date, default: Date.now },
  endDate:      { type: Date, required: true },
  autoRenew:    { type: Boolean, default: true },
  paymentMethod:{ type: String },
  amount:       { type: Number },
  invoices:     [{ date: Date, amount: Number, url: String }]
}, { timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

const bookingSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'locked', 'confirmed', 'rejected', 'expired', 'cancelled', 'completed'], 
    default: 'pending' 
  },
  moveInDate: Date,
  stayDuration: Number,
  serviceFeePaid: { type: Boolean, default: false },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  agreementUrl: String,
  tenantSignature: String,
  landlordSignature: String,
  idempotencyKey: { type: String, unique: true, sparse: true }
}, { timestamps: true });

bookingSchema.index({ listingId: 1, tenantId: 1, status: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
