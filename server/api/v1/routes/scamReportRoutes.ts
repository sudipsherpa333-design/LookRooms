import express from "express";
import { reportScam } from "../controllers/scamReportController.js";

const router = express.Router();

router.post("/report", reportScam);

export default router;
