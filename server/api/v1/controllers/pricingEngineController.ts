import { Request, Response } from 'express';
import { Listing } from '../../../models/index.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMarketPriceIntelligence = async (req: Request, res: Response) => {
  const { city, roomType, area } = req.query;

  try {
    const similarListings = await Listing.find({
      'location.city': city,
      propertyType: roomType,
      'location.area': area,
      status: 'active'
    }).select('price');

    if (similarListings.length === 0) {
      return res.json({ message: "Not enough data for this area yet." });
    }

    const prices = similarListings.map(l => l.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const prompt = `Given these market stats for ${roomType} in ${area}, ${city}:
    Average Price: Rs ${avg}
    Min Price: Rs ${min}
    Max Price: Rs ${max}
    Number of similar listings: ${similarListings.length}
    
    Suggest an optimal price range for max bookings.
    Return JSON: { "minSuggested": number, "maxSuggested": number, "optimal": number, "reasoning": string, "demandLevel": "low"|"medium"|"high"|"very_high" }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const aiResult = JSON.parse(response.text || "{}");

    res.json({
      marketStats: { avg, min, max, count: similarListings.length },
      aiIntelligence: aiResult
    });

  } catch (error) {
    res.status(500).json({ error: "Market intelligence failed" });
  }
};
