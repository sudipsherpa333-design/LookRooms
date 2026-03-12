import express, { Request, Response, NextFunction } from "express";
import { submitReview, getListingReviews } from "../controllers/reviewController.js";

const router = express.Router();

// Middleware to mock auth and get userId from headers
const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = { id: userId };
  next();
};

router.post("/submit", authMiddleware, submitReview);
router.get("/listing/:listingId", getListingReviews);

export default router;
