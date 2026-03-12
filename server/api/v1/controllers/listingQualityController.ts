import { Request, Response } from 'express';
import { Listing } from '../../../models/index.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const checkListingQuality = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const breakdown: any = {
      photos: { score: 0, feedback: "" },
      title: { score: 0, feedback: "" },
      description: { score: 0, feedback: "" },
      pricing: { score: 0, feedback: "" },
      amenities: { score: 0, feedback: "" }
    };

    // 1. Photos check
    const photoCount = listing.images.length;
    breakdown.photos.score = Math.min(100, photoCount * 20);
    breakdown.photos.feedback = photoCount >= 5 ? "Great number of photos!" : `Add ${5 - photoCount} more photos to improve visibility.`;

    // 2. Title check
    const titleLen = listing.title.length;
    breakdown.title.score = titleLen >= 20 && titleLen <= 80 ? 100 : 50;
    breakdown.title.feedback = titleLen < 20 ? "Title is too short." : titleLen > 80 ? "Title is too long." : "Title length is optimal.";

    // 3. Description check
    const descWords = listing.description.split(' ').length;
    breakdown.description.score = Math.min(100, (descWords / 100) * 100);
    breakdown.description.feedback = descWords >= 100 ? "Detailed description!" : "Add more details about the room and surroundings.";

    // 4. Amenities check
    const amenityCount = Object.keys(listing.amenities || {}).length;
    breakdown.amenities.score = Math.min(100, amenityCount * 10);
    breakdown.amenities.feedback = amenityCount >= 10 ? "Excellent amenities listed!" : "List more amenities to attract tenants.";

    // 5. AI Analysis
    const prompt = `Rate this rental listing for clarity and appeal:
    Title: ${listing.title}
    Description: ${listing.description}
    Property Type: ${listing.propertyType}
    Price: Rs ${listing.price}
    
    Return JSON: { "titleScore": number, "descScore": number, "suggestions": string[], "improvedTitle": string, "improvedDescription": string }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const aiResult = JSON.parse(response.text || "{}");
    
    const totalScore = Math.round(
      (breakdown.photos.score + breakdown.title.score + breakdown.description.score + breakdown.amenities.score + (aiResult.titleScore || 0) + (aiResult.descScore || 0)) / 6
    );

    listing.qualityScore = totalScore;
    listing.qualityBreakdown = breakdown;
    listing.isQualityApproved = totalScore >= 70;
    listing.qualityCheckedAt = new Date();
    
    await listing.save();

    res.json({
      score: totalScore,
      breakdown,
      aiSuggestions: aiResult.suggestions,
      improvedContent: {
        title: aiResult.improvedTitle,
        description: aiResult.improvedDescription
      }
    });

  } catch (error) {
    console.error("Quality check error:", error);
    res.status(500).json({ error: "Quality check failed" });
  }
};
