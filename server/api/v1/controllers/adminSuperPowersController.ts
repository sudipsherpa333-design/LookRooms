import { Request, Response } from 'express';
import { User, Listing, Payment } from '../../../models/index.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const adminAiAssistant = async (req: Request, res: Response) => {
  const { query } = req.body;

  try {
    // In a real app, we'd translate the query to Mongoose calls.
    // For now, we'll use AI to summarize platform health.
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    const activeBookings = await Listing.countDocuments({ status: 'rented' });
    
    const prompt = `You are an admin assistant for LookRooms.
    Current Stats:
    - Total Users: ${userCount}
    - Total Listings: ${listingCount}
    - Active Bookings: ${activeBookings}
    
    User Query: ${query}
    
    Provide a helpful response based on these stats and general platform knowledge.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    res.json({ response: response.text });
  } catch (error) {
    res.status(500).json({ error: "Admin assistant failed" });
  }
};

export const fraudDetection = async (req: Request, res: Response) => {
  try {
    // Simple fraud detection: find users with same phone or suspicious activity
    const suspiciousUsers = await User.find({
      $or: [
        { trustScore: { $lt: 40 } },
        { accountStatus: 'suspended' }
      ]
    }).limit(50);

    res.json(suspiciousUsers);
  } catch (error) {
    res.status(500).json({ error: "Fraud detection failed" });
  }
};

export const revenueIntelligence = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    res.json(payments[0] || { totalRevenue: 0, count: 0 });
  } catch (error) {
    res.status(500).json({ error: "Revenue intelligence failed" });
  }
};
