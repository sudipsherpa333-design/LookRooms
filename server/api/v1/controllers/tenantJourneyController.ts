import { Request, Response } from 'express';
import { Listing } from '../../../models/index.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getNeighborhoodGuide = async (req: Request, res: Response) => {
  const { area, city } = req.query;

  try {
    const prompt = `Generate a neighborhood guide for ${area}, ${city}, Nepal.
    Include:
    1. Markets (e.g. Bhat-Bhateni, local markets)
    2. Hospitals
    3. Transportation (bus routes)
    4. Schools/Colleges
    5. Food & Cafes
    6. Electricity/Water situation
    
    Return JSON: { "areaName": string, "markets": string[], "hospitals": string[], "transport": string, "schools": string[], "food": string[], "utilities": string }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const aiResult = JSON.parse(response.text || "{}");
    res.json(aiResult);
  } catch (error) {
    res.status(500).json({ error: "Guide generation failed" });
  }
};

export const compareRooms = async (req: Request, res: Response) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: "No IDs provided" });

  try {
    const idList = (ids as string).split(',');
    const listings = await Listing.find({ _id: { $in: idList } });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: "Comparison failed" });
  }
};
