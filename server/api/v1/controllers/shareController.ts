import { Request, Response } from "express";
import { ShareTracking, Listing } from "../../../models/index.js";
import asyncHandler from "express-async-handler";
import { generateShareUrl } from "../../../utils/shareUrlGenerator.js";

export const trackShare = asyncHandler(async (req: Request, res: Response) => {
  const { listingId, platform } = req.body;
  const sharedBy = req.user?.id;
  const ipAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const share = new ShareTracking({ listingId, sharedBy, platform, ipAddress, userAgent });
  await share.save();

  await Listing.findByIdAndUpdate(listingId, { $inc: { shareCount: 1 } });

  const shareUrl = generateShareUrl(listingId, platform, sharedBy);
  res.status(201).json({ shareId: share._id, shareUrl });
});

export const trackClick = asyncHandler(async (req: Request, res: Response) => {
  const { shareId } = req.params;
  await ShareTracking.findByIdAndUpdate(shareId, { $inc: { clickCount: 1 } });
  res.status(200).json({ success: true });
});
