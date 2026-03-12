import express from "express";
import { getTrustScore, recalculateTrustScore } from "../controllers/trustScoreController.js";

const router = express.Router();

router.get("/score/:userId", getTrustScore);
router.post("/recalculate/:userId", recalculateTrustScore);

export default router;
