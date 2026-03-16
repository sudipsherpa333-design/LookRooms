import { Request, Response } from "express";
import { ScamReport } from "../../../models/ScamReport.js";
import { BookingStatus } from "../../../models/BookingStatus.js";
import { UserTrustScore } from "../../../models/UserTrustScore.js";
import asyncHandler from "express-async-handler";

export const reportScam = asyncHandler(async (req: Request, res: Response) => {
  const { reportedUserId, listingId, bookingId, reportType, description, evidenceUrls } = req.body;
  const reportedBy = req.user?.id;

  const report = new ScamReport({
    reportedBy,
    reportedUser: reportedUserId,
    listingId,
    bookingId,
    reportType,
    description,
    evidenceUrls
  });
  await report.save();

  // Reports are now handled by an Admin Review Queue.
  // Trust score is updated only after admin moderation.
  
  // Update booking status to reflect it's under review
  await BookingStatus.findOneAndUpdate({ bookingId }, { currentStatus: 'scam_reported', isFlagged: true });

  // Emit socket event for admin dashboard
  req.app.get('io').emit('newScamReport', { reportId: report._id });

  res.status(201).json({ 
    reportId: report._id, 
    message: 'Report submitted. Our moderation team will review the evidence and take action within 24 hours.' 
  });
});
