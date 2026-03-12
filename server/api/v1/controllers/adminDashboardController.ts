import { Request, Response } from "express";
import { User, Listing, Review, Payment, Application, ShareTracking, AdminLog } from "../../../models/index.js";
import asyncHandler from "express-async-handler";

export const getStatsOverview = asyncHandler(async (req: Request, res: Response) => {
  const [totalUsers, totalListings, totalBookings, totalRevenue, totalReviews, totalPayments, totalShares] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Application.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Review.countDocuments(),
    Payment.countDocuments(),
    ShareTracking.countDocuments()
  ]);

  res.json({
    totalUsers,
    totalListings,
    totalBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalReviews,
    totalPayments,
    totalShares
  });
});
