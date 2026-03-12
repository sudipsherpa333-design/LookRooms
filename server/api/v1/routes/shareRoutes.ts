import express from "express";
import { trackShare, trackClick } from "../controllers/shareController.js";

const router = express.Router();

router.post("/track", trackShare);
router.post("/click/:shareId", trackClick);

export default router;
