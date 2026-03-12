import express, { Request, Response, NextFunction } from "express";
import { User, Listing, Application, MaintenanceRequest } from "../../../models/index.js";
import { Types } from "mongoose";

const router = express.Router();

// Middleware to mock auth and get userId from headers for now
router.use((req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = { id: userId };
  next();
});

// Dashboard
router.get("/dashboard/overview", async (req, res) => {
  try {
    const listings = await Listing.find({ homeowner: req.user?.id });
    const activeCount = listings.filter((l) => l.status === "active").length;
    const pendingCount = listings.filter((l) => l.status === "pending").length;

    res.json({
      totalListings: listings.length,
      activeListings: activeCount,
      pendingListings: pendingCount,
      totalViews: listings.reduce((acc, l) => acc + (l.metrics?.views || 0), 0),
      totalInquiries: listings.reduce(
        (acc, l) => acc + (l.metrics?.inquiries || 0),
        0,
      ),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard overview" });
  }
});

// Listings Management
router.get("/listings", async (req, res) => {
  try {
    const listings = await Listing.find({ homeowner: req.user?.id }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

router.post("/listings", async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (user?.role !== 'homeowner' && user?.role !== 'admin') {
      return res.status(403).json({ error: "Only homeowners can create listings" });
    }
    const {
      address,
      area,
      city,
      roomType,
      waterSource,
      hasInverter,
      sunExposure,
      genderPreference,
      foodPreference,
      hasInternet,
      hasParking,
      smokingAllowed,
      petsAllowed,
      ...rest
    } = req.body;

    const mappedData = {
      ...rest,
      propertyType: roomType || rest.propertyType,
      location: {
        ...rest.location,
        address: address || rest.location?.address,
        area: area || rest.location?.area,
        city: city || rest.location?.city,
      },
      amenities: {
        ...rest.amenities,
        waterSource: waterSource || rest.amenities?.waterSource,
        sunExposure: sunExposure || rest.amenities?.sunExposure,
        electricityBackup: {
          ...rest.amenities?.electricityBackup,
          inverter: {
            ...rest.amenities?.electricityBackup?.inverter,
            available: hasInverter !== undefined ? hasInverter : rest.amenities?.electricityBackup?.inverter?.available,
          }
        },
        internet: {
          available: hasInternet !== undefined ? hasInternet : rest.amenities?.internet?.available || false,
        },
        parking: {
          bike: {
            available: hasParking !== undefined ? hasParking : rest.amenities?.parking?.bike?.available || false,
          }
        }
      },
      rules: {
        ...rest.rules,
        genderPreference: genderPreference || rest.rules?.genderPreference,
        foodPreference: foodPreference || rest.rules?.foodPreference,
        smoking: {
          allowed: smokingAllowed !== undefined ? smokingAllowed : rest.rules?.smoking?.allowed || false,
        },
        pets: {
          allowed: petsAllowed !== undefined ? petsAllowed : rest.rules?.pets?.allowed || false,
        }
      }
    };

    const listing = new Listing({
      homeowner: req.user?.id,
      ...mappedData,
      status: "pending",
    });
    await listing.save();
    res.json(listing);
  } catch (error: any) {
    console.error("Error creating listing:", error);
    res.status(500).json({ error: "Failed to create listing", details: error.message });
  }
});

router.get("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      homeowner: req.user?.id,
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

router.put("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, homeowner: req.user?.id },
      req.body,
      { new: true },
    );
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to update listing" });
  }
});

router.delete("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({
      _id: req.params.id,
      homeowner: req.user?.id,
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

// Applications Management
router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find({ homeowner: req.user?.id })
      .populate("applicant", "name email phone avatar bio renterProfile verificationLevel documents")
      .populate("listing", "title location");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.put("/applications/:id/accept", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const application = await Application.findOne({ _id: req.params.id, homeowner: userId });
    if (!application) return res.status(404).json({ error: "Application not found" });

    // Duplicate booking protection: Check if any other application is already accepted/completed for this listing
    const existingAccepted = await Application.findOne({
      listing: application.listing,
      status: { $in: ["accepted", "completed"] },
      _id: { $ne: application._id }
    });
    
    if (existingAccepted) {
      return res.status(400).json({ error: "This listing already has an accepted or completed booking." });
    }

    application.status = "accepted";
    application.decisionAt = new Date();
    application.decisionBy = new Types.ObjectId(userId) as any;
    application.paymentStatus = "pending";
    await application.save();

    // Temporarily lock listing or update status if needed
    // The requirement says "listing temporarily locked for that user"
    // We can interpret this as the listing status being updated or just the application status.
    // Let's mark the listing as 'unavailable' or similar if we want to prevent others from applying?
    // Actually, the requirement says "listing temporarily locked for that user"
    // and "listing status becomes occupied" only AFTER payment.
    // So for now, we just update the application.

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: "Failed to accept application" });
  }
});

router.put("/applications/:id/reject", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, homeowner: userId },
      {
        status: "rejected",
        decisionReason: req.body.reason,
        decisionAt: new Date(),
        decisionBy: new Types.ObjectId(userId) as any,
      },
      { new: true },
    );
    if (!application)
      return res.status(404).json({ error: "Application not found" });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject application" });
  }
});

// Maintenance Management
router.get("/maintenance", async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ homeownerId: req.user?.id })
      .populate("tenantId", "name email phone avatar")
      .populate("listingId", "title location")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
});

router.put("/maintenance/:id", async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update: any = { status, adminNotes };
    if (status === 'resolved') {
      update.resolvedAt = new Date();
    }
    const request = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id, homeownerId: req.user?.id },
      update,
      { new: true }
    );
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to update maintenance request" });
  }
});

// Tenant Management
router.get("/tenants", async (req, res) => {
  try {
    const applications = await Application.find({
      homeowner: req.user?.id,
      status: { $in: ["accepted", "completed"] }
    }).populate("applicant", "name email phone avatar renterProfile")
      .populate("listing", "title location");
    
    // Group by applicant to get unique tenants
    const tenants = applications.map(app => {
      const applicant = app.applicant as any;
      return {
        ...(applicant.toObject ? applicant.toObject() : applicant),
        listing: app.listing,
        applicationId: app._id,
        status: app.status,
        paymentStatus: app.paymentStatus
      };
    });

    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenants" });
  }
});

export default router;
