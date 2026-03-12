import mongoose from "mongoose";

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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

listingSchema.pre("validate", function () {
  const doc = this as any;
  if (doc.landlordId && !doc.homeowner) doc.homeowner = doc.landlordId;
  if (doc.homeowner && !doc.landlordId) doc.landlordId = doc.homeowner;
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
  if (doc.roomType && !doc.propertyType) doc.propertyType = doc.roomType;
  if (doc.waterSource && !doc.amenities?.waterSource) {
    doc.amenities = doc.amenities || {};
    doc.amenities.waterSource = doc.waterSource;
  }
  if (doc.hasInverter !== undefined && !doc.amenities?.electricityBackup?.inverter?.available) {
    doc.amenities = doc.amenities || {};
    doc.amenities.electricityBackup = doc.amenities.electricityBackup || {};
    doc.amenities.electricityBackup.inverter = doc.amenities.electricityBackup.inverter || {};
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

listingSchema.index({ "location.city": 1, propertyType: 1, price: 1, status: 1 });
listingSchema.index({ homeowner: 1, status: 1, createdAt: -1 });
listingSchema.index({ "location.coordinates": "2dsphere", price: 1 });

export const Listing = mongoose.model("Listing", listingSchema);
