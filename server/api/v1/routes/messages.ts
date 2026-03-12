import express from "express";
import {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  deleteMessage,
  uploadFile,
} from "../controllers/messageController.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { upload } from "../../../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", sendMessage);
router.post("/upload", upload.single("file"), uploadFile);
router.get("/:conversationId", getMessages);
router.put("/read/:conversationId", markMessagesAsRead);
router.delete("/:messageId", deleteMessage);

export default router;
