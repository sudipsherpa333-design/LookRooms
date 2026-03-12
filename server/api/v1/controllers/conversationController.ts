import { Request, Response } from "express";
import { Conversation, User, Listing, Message } from "../../../models/index.js";

export const createOrGetConversation = async (req: Request, res: Response) => {
  try {
    const { seekerId, ownerId, roomId } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [seekerId, ownerId] },
      ...(roomId ? { roomListing: roomId } : {})
    }).populate("participants", "name avatar role isOnline lastSeen").populate("roomListing");

    if (!conversation) {
      conversation = new Conversation({
        participants: [seekerId, ownerId],
        roomListing: roomId || undefined
      });
      await conversation.save();
      conversation = await conversation.populate("participants", "name avatar role isOnline lastSeen");
      if (roomId) {
        conversation = await conversation.populate("roomListing");
      }
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to create or fetch conversation" });
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const conversations = await Conversation.find({ participants: userId, isArchived: false })
      .populate("participants", "name avatar role isOnline lastSeen")
      .populate("lastMessage")
      .populate("roomListing", "title price images area city")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id)
      .populate("participants", "name avatar role isOnline lastSeen")
      .populate("roomListing", "title price images area city");

    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};
