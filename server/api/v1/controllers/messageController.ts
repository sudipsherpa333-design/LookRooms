import { Request, Response } from "express";
import { Message, Conversation } from "../../../models/index.js";
import { scanFile } from "../../../middleware/uploadMiddleware.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const isClean = await scanFile(req.file);
    if (!isClean) return res.status(400).json({ error: "File contains a virus" });

    // Upload to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "lookrooms/messages",
    });

    res.json({ fileUrl: result.secure_url, fileName: req.file.originalname, fileSize: req.file.size });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, text, image, messageType } = req.body;
    const userId = req.user?.id;

    if (!userId || userId !== senderId) return res.status(401).json({ error: "Unauthorized" });

    const message = new Message({
      conversationId,
      sender: senderId,
      text,
      image,
      messageType: messageType || "text",
      readBy: [senderId],
      deliveredTo: [senderId],
    });

    await message.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    const populatedMessage = await message.populate("sender", "name avatar");
    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId, isDeleted: false })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await Message.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId, deliveredTo: userId } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this message" });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
};
