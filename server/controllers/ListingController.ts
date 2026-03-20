import { Request, Response } from 'express';
import { Listing } from '../models/Listing';
import asyncHandler from 'express-async-handler';

export const getAllListings = asyncHandler(async (req: Request, res: Response) => {
  const { city, area, minPrice, maxPrice, propertyType, roomType, amenities } = req.query;

  const query: any = { status: 'available' };

  if (city) query['location.city'] = city;
  if (area) query['location.area'] = area;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (propertyType) query.propertyType = propertyType;
  if (roomType) query.roomType = roomType;
  if (amenities) {
    const amenitiesArray = (amenities as string).split(',');
    query.amenities = { $all: amenitiesArray };
  }

  const listings = await Listing.find(query).populate('owner', 'name avatar trustScore');

  res.status(200).json({
    status: 'success',
    results: listings.length,
    data: {
      listings
    }
  });
});

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await Listing.findById(req.params.id).populate('owner', 'name avatar trustScore phone');

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Increment views
  listing.views += 1;
  await listing.save();

  res.status(200).json({
    status: 'success',
    data: {
      listing
    }
  });
});

export const createListing = asyncHandler(async (req: any, res: Response) => {
  req.body.owner = req.user.id;
  const newListing = await Listing.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      listing: newListing
    }
  });
});

export const updateListing = asyncHandler(async (req: any, res: Response) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to update this listing');
  }

  const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      listing: updatedListing
    }
  });
});

export const deleteListing = asyncHandler(async (req: any, res: Response) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to delete this listing');
  }

  await Listing.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
