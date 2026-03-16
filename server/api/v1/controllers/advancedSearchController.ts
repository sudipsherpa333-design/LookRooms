import { Request, Response } from 'express';
import { Listing } from '../../../models/index.js';
import redis from '../../../utils/redis.js';

export const advancedSearch = async (req: Request, res: Response) => {
  const cacheKey = `search:${JSON.stringify(req.query)}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const {
      q,
      city,
      roomType,
      minPrice,
      maxPrice,
      amenities,
      furnished,
      petsAllowed,
      minArea,
      maxArea,
      lat,
      lng,
      radius = 5, // km
      sort = 'relevance',
      page = 1,
      limit = 20,
      searchPolygon
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const pipeline: any[] = [];

    // 1. Full-text search (if q is provided)
    if (q) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { area: { $regex: q, $options: 'i' } },
            { address: { $regex: q, $options: 'i' } }
          ]
        }
      });
    }

    // 2. Geo-spatial search
    if (lat && lng && !searchPolygon) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          distanceField: "distanceKm",
          maxDistance: Number(radius) * 1000,
          spherical: true,
          distanceMultiplier: 0.001
        }
      });
    }

    // 3. Filters
    const matchStage: any = { status: 'active' };
    
    if (searchPolygon) {
      try {
        const polygonCoords = JSON.parse(searchPolygon as string);
        // MongoDB expects [lng, lat]
        const mongoPolygon = polygonCoords.map((coord: [number, number]) => [coord[1], coord[0]]);
        // Close the polygon if not closed
        if (mongoPolygon.length > 0 && (mongoPolygon[0][0] !== mongoPolygon[mongoPolygon.length - 1][0] || mongoPolygon[0][1] !== mongoPolygon[mongoPolygon.length - 1][1])) {
          mongoPolygon.push(mongoPolygon[0]);
        }
        
        if (mongoPolygon.length >= 4) {
          matchStage['location.coordinates'] = {
            $geoWithin: {
              $geometry: {
                type: "Polygon",
                coordinates: [mongoPolygon]
              }
            }
          };
        }
      } catch (e) {
        console.error("Invalid searchPolygon format", e);
      }
    }
    
    if (city) matchStage['location.city'] = city;
    if (roomType) matchStage.propertyType = roomType;
    if (minPrice || maxPrice) {
      matchStage.price = {};
      if (minPrice) matchStage.price.$gte = Number(minPrice);
      if (maxPrice) matchStage.price.$lte = Number(maxPrice);
    }
    if (furnished) matchStage['roomDetails.furnishing'] = furnished;
    if (petsAllowed === 'true') matchStage['rules.pets.allowed'] = true;
    
    if (amenities) {
      const amenitiesList = (amenities as string).split(',');
      matchStage['amenities.additional.name'] = { $all: amenitiesList };
    }

    pipeline.push({ $match: matchStage });

    // 4. Sorting
    const sortStage: any = {};
    if (sort === 'price_asc') sortStage.price = 1;
    else if (sort === 'price_desc') sortStage.price = -1;
    else if (sort === 'newest') sortStage.createdAt = -1;
    else if (sort === 'rating') sortStage.averageRating = -1;
    else sortStage.createdAt = -1; // default

    pipeline.push({ $sort: sortStage });

    // 5. Facets for filters
    pipeline.push({
      $facet: {
        listings: [
          { $skip: skip },
          { $limit: Number(limit) }
        ],
        facets: [
          {
            $group: {
              _id: null,
              priceRanges: { $push: "$price" },
              roomTypes: { $addToSet: "$propertyType" },
              cities: { $addToSet: "$location.city" }
            }
          }
        ],
        totalCount: [{ $count: "count" }]
      }
    });

    const result = await Listing.aggregate(pipeline);
    
    const listings = result[0].listings;
    const facets = result[0].facets[0] || {};
    const total = result[0].totalCount[0]?.count || 0;

    const response = {
      listings,
      facets: {
        priceRanges: facets.priceRanges ? {
          min: Math.min(...facets.priceRanges),
          max: Math.max(...facets.priceRanges),
          avg: facets.priceRanges.reduce((a: any, b: any) => a + b, 0) / facets.priceRanges.length
        } : null,
        roomTypes: facets.roomTypes,
        cities: facets.cities
      },
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 120); // 2 minutes

    res.json(response);

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

export const autocomplete = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const suggestions = await Listing.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { 'location.area': { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } }
      ]
    } as any)
    .limit(10)
    .select('title location.area location.city')
    .lean();

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: "Autocomplete failed" });
  }
};
