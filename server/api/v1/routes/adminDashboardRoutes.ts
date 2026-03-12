import express from "express";
import { getStatsOverview } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/stats/overview", getStatsOverview);

export default router;
