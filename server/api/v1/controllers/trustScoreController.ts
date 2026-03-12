import { Request, Response } from "express";
import { UserTrustScore } from "../../../models/UserTrustScore.js";
import asyncHandler from "express-async-handler";

export const getTrustScore = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const trustScore = await UserTrustScore.findOne({ userId });
  if (!trustScore) {
    res.status(404).json({ error: "Trust score not found" });
    return;
  }
  res.json(trustScore);
});

export const recalculateTrustScore = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  // Logic to recalculate score based on all data...
  // Update trustLevel based on thresholds...
  res.json({ success: true });
});
