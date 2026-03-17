import express, { Request, Response, NextFunction } from "express";
import { User, Listing, Application, Payment, ContactLog, SupportTicket } from "../../../models/index.js";
import { authMiddleware, adminMiddleware } from "../../../middleware/authMiddleware.js";
import { getAllPayments, processRefund, getPaymentAnalytics } from "../controllers/adminPaymentController.js";
import { getSystemSettings, updateSystemSettings } from "../controllers/adminSettingsController.js";

const router = express.Router();

// Use standard middleware
router.use(authMiddleware);
router.use(adminMiddleware);

// System Settings
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);

// Payment Management
router.get("/payments/all", getAllPayments);
router.post("/payments/refund/:paymentId", processRefund);
router.get("/payments/analytics", getPaymentAnalytics);


// User Management
router.get("/users", async (req, res) => {
  try {
    const users = await (User as any).find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/users/verification-requests", async (req, res) => {
  try {
    const users = await User.find({ verificationLevel: "pending" }).select(
      "-password",
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verification requests" });
  }
});

router.post("/users/:id/verify-documents", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationLevel: "verified",
        verifiedAt: new Date(),
        "documents.$[].status": "verified",
        "documents.$[].verifiedAt": new Date(),
        "documents.$[].verifiedBy": req.user?.id,
      },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to verify user" });
  }
});

router.post("/users/:id/reject-documents", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        verificationLevel: "rejected",
        "documents.$[].status": "rejected",
        "documents.$[].rejectionReason": req.body.reason,
      },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject user" });
  }
});

router.post("/users/batch-verify", async (req, res) => {
  const { userIds } = req.body;
  if (!Array.isArray(userIds)) {
    return res.status(400).json({ error: "userIds must be an array" });
  }
  try {
    await User.updateMany(
      { _id: { $in: userIds } },
      {
        verificationLevel: "verified",
        verifiedAt: new Date(),
        "documents.$[].status": "verified",
        "documents.$[].verifiedAt": new Date(),
        "documents.$[].verifiedBy": req.user?.id,
      },
    );
    res.json({ message: "Users verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to batch verify users" });
  }
});

router.post("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["user", "homeowner", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user role" });
  }
});

router.post("/users/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!["active", "suspended", "banned"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus: status },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Listing Management
router.get("/listings/pending", async (req, res) => {
  try {
    const listings = await Listing.find({ status: "pending" })
      .populate("homeowner", "name phone verificationLevel")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending listings" });
  }
});

router.post("/listings/:id/approve", async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        status: "active",
        verificationStatus: "verified",
        verifiedAt: new Date(),
        verifiedBy: req.user?.id,
      },
      { new: true },
    );
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve listing" });
  }
});

router.post("/listings/:id/reject", async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        verificationStatus: "rejected",
        rejectionReason: req.body.reason,
      },
      { new: true },
    );
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject listing" });
  }
});

router.delete("/listings/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

// Analytics
router.get("/analytics/overview", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLandlords = await User.countDocuments({ role: "homeowner" });
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: "active" });
    const occupiedListings = await Listing.countDocuments({ status: "occupied" });
    const totalApplications = await Application.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: "paid" });
    const pendingListings = await Listing.countDocuments({ status: "pending" });
    const pendingKyc = await User.countDocuments({
      verificationLevel: "pending",
    });

    const now = new Date();
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyRevenue = await Payment.aggregate([
      { $match: { status: "paid", createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "paid", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const revenueData = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const gatewayBreakdown = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalLandlords,
      totalListings,
      activeListings,
      occupiedListings,
      totalApplications,
      totalPayments,
      pendingListings,
      pendingKyc,
      totalRevenue: revenueData[0]?.total || 0,
      dailyRevenue: dailyRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      gatewayBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics overview" });
  }
});

// Payment Monitoring
router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name phone")
      .populate("ownerId", "name phone")
      .populate("listingId", "title")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Chat Monitoring (WhatsApp Logs)
router.get("/chat-logs", async (req, res) => {
  try {
    const logs = await ContactLog.find()
      .populate("userId", "name phone")
      .populate("ownerId", "name phone")
      .populate("listingId", "title")
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat logs" });
  }
});

// Booking Management
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Application.find()
      .populate("applicant", "name phone")
      .populate("homeowner", "name phone")
      .populate("listing", "title")
      .sort({ appliedAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

export default router;
