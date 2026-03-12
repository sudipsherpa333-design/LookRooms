import express from "express";
import {
  createOrGetConversation,
  getUserConversations,
  getConversationById,
} from "../controllers/conversationController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrGetConversation);
router.get("/", getUserConversations);
router.get("/:id", getConversationById);

export default router;
