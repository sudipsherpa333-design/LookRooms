import express from "express";
import { initBookingStatus, updateBookingStatus } from "../controllers/bookingStatusController.js";

const router = express.Router();

router.post("/init/:bookingId", initBookingStatus);
router.put("/update/:bookingId", updateBookingStatus);

export default router;
