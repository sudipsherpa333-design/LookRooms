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

  await BookingStatus.findOneAndUpdate({ bookingId }, { currentStatus: 'scam_reported', isFlagged: true });
  await UserTrustScore.findOneAndUpdate({ userId: reportedUserId }, { $inc: { scamReportsReceived: 1, trustScore: -20 } });

  // Emit socket event
  req.app.get('io').emit('newScamReport', { reportId: report._id });

  res.status(201).json({ reportId: report._id, message: 'Report submitted. Admin will review within 24 hours.' });
});
