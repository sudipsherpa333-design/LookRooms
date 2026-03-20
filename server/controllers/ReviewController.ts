import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Listing } from '../models/Listing';
import { User } from '../models/User';
import asyncHandler from 'express-async-handler';

export const submitReview = asyncHandler(async (req: any, res: Response) => {
  const { target, targetType, rating, comment, cleanliness, communication, location, behavior } = req.body;

  const newReview = await Review.create({
    reviewer: req.user.id,
    target,
    targetType,
    rating,
    comment,
    cleanliness,
    communication,
    location,
    behavior
  });

  // Recalculate average rating for target
  if (targetType === 'Listing') {
    const stats = await Review.aggregate([
      { $match: { target: new mongoose.Types.ObjectId(target), targetType: 'Listing' } },
      { $group: { _id: '$target', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Listing.findByIdAndUpdate(target, {
        rating: stats[0].avgRating,
        numReviews: stats[0].numReviews
      });
    }
  } else if (targetType === 'User') {
    const stats = await Review.aggregate([
      { $match: { target: new mongoose.Types.ObjectId(target), targetType: 'User' } },
      { $group: { _id: '$target', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      // Update trust score based on reviews
      const user = await User.findById(target);
      if (user) {
        user.trustScore = Math.min(100, Math.max(0, 50 + (stats[0].avgRating - 3) * 10));
        await user.save();
      }
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});

export const getListingReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ target: req.params.listingId, targetType: 'Listing' })
    .populate('reviewer', 'name avatar');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

export const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ target: req.params.userId, targetType: 'User' })
    .populate('reviewer', 'name avatar');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

import mongoose from 'mongoose';
