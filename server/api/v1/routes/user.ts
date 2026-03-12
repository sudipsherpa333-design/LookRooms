import express, { Request, Response, NextFunction } from "express";
import { User, Listing, Application, SavedSearch, ContactLog, ViewedListing, MaintenanceRequest } from "../../../models/index.js";

const router = express.Router();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

// Middleware to mock auth and get userId from headers for now
router.use((req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = { id: userId };
  next();
});

// Profile Management
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.post("/profile/preferences", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "renterProfile.preferences": req.body },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

router.post("/profile/lifestyle", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "renterProfile.lifestyle": req.body },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update lifestyle" });
  }
});

// Roommate Features
router.get("/roommate/matches", async (req, res) => {
  res.json({ message: "Not implemented yet" });
});

router.post("/roommate/profile", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "renterProfile.roommatePreferences": req.body },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update roommate profile" });
  }
});

// Listings Interaction
router.get("/favorites", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "renterProfile.favoriteListings",
    );
    res.json(user?.renterProfile?.favoriteListings || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

router.post("/favorites/:listingId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { "renterProfile.favoriteListings": req.params.listingId } },
      { new: true },
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

router.delete("/favorites/:listingId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { "renterProfile.favoriteListings": req.params.listingId } },
      { new: true },
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// Applications
router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user.id,
    }).populate("listing");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.get("/applications/:listingId/check", async (req, res) => {
  try {
    const application = await Application.findOne({
      listing: req.params.listingId,
      applicant: req.user.id,
    });
    res.json({ applied: !!application });
  } catch (error) {
    res.status(500).json({ error: "Failed to check application status" });
  }
});

router.post("/applications/:listingId", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const existingApplication = await Application.findOne({
      listing: req.params.listingId,
      applicant: req.user.id,
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied to this listing" });
    }

    const application = new Application({
      listing: req.params.listingId,
      applicant: req.user.id,
      homeowner: listing.homeowner || listing.landlordId,
      ...req.body,
    });
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: "Failed to apply" });
  }
});

// KYC
router.post("/kyc/submit", async (req, res) => {
  const { documentType, documentUrl, idNumber } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        verificationLevel: "pending",
        kycDocumentType: documentType,
        kycDocumentUrl: documentUrl,
        kycIdNumber: idNumber,
        $push: {
          documents: {
            type: documentType,
            documentNumber: idNumber,
            frontImage: { url: documentUrl },
            status: "pending",
            submittedAt: new Date(),
          },
        },
      },
      { new: true },
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit KYC" });
  }
});

// WhatsApp Contact Logging
router.post("/contact-log", async (req, res) => {
  const { ownerId, listingId, contactMethod } = req.body;
  try {
    const log = new ContactLog({
      userId: req.user?.id,
      ownerId,
      listingId,
      contactMethod: contactMethod || "whatsapp",
      platform: "whatsapp",
    });
    await log.save();
    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ error: "Failed to log contact" });
  }
});

// Recently Viewed Listings
router.post("/viewed", async (req, res) => {
  const { listingId } = req.body;
  try {
    // Remove if already exists to update timestamp
    await ViewedListing.findOneAndDelete({ userId: req.user?.id, listingId });
    const view = new ViewedListing({ userId: req.user?.id, listingId });
    await view.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to log view" });
  }
});

router.get("/viewed", async (req, res) => {
  try {
    const views = await ViewedListing.find({ userId: req.user?.id })
      .sort({ viewedAt: -1 })
      .limit(5)
      .populate("listingId");
    res.json(views.map(v => v.listingId));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recently viewed" });
  }
});

// Maintenance Requests
router.post("/maintenance", async (req, res) => {
  try {
    const { listingId, title, description, priority, category, images } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const request = new MaintenanceRequest({
      listingId,
      tenantId: req.user.id,
      homeownerId: listing.homeowner,
      title,
      description,
      priority,
      category,
      images
    });
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit maintenance request" });
  }
});

router.get("/maintenance", async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ tenantId: req.user.id })
      .populate("listingId", "title location")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
});

export default router;
