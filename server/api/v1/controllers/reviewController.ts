import { Request, Response } from "express";
import { Review, Listing, User, Application } from "../../../models/index.js";
import asyncHandler from "express-async-handler";
import { aggregateRatings } from "../../../utils/ratingAggregator.js";
import { calculateTrustBadge } from "../../../utils/trustBadgeCalculator.js";

export const submitReview = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, ratings, tenantRatings, comment } = req.body;
  const reviewerId = req.user?.id;

  // 1. Verify booking exists and belongs to reviewer
  const booking = await Application.findById(bookingId);
  if (!booking || (booking.applicant.toString() !== reviewerId && booking.homeowner.toString() !== reviewerId)) {
    res.status(404).json({ error: "Booking not found or unauthorized" });
    return;
  }

  // 2. Check booking.status === 'completed' or 'accepted'
  if (booking.status !== 'completed' && booking.status !== 'accepted') {
    res.status(400).json({ error: "Booking must be accepted or completed to leave a review" });
    return;
  }

  // 3. Check review not already submitted
  const existingReview = await Review.findOne({ bookingId, reviewerId });
  if (existingReview) {
    res.status(400).json({ error: "Review already submitted for this booking" });
    return;
  }

  // 4. Calculate averageRating
  const { averageRating, breakdown } = aggregateRatings(ratings || tenantRatings || {});

  // 5. Save review
  const review = new Review({
    bookingId,
    reviewerId,
    revieweeId: booking.applicant.toString() === reviewerId ? booking.homeowner : booking.applicant,
    listingId: booking.listing,
    reviewerRole: booking.applicant.toString() === reviewerId ? 'tenant' : 'landlord',
    ratings,
    tenantRatings,
    comment,
    averageRating,
    status: 'published'
  });
  await review.save();

  // 6. Update listing and user ratings
  const listing = await Listing.findById(booking.listing);
  if (listing) {
      listing.reviewCount += 1;
      // Simplified rolling average update
      listing.averageRating = ((listing.averageRating * (listing.reviewCount - 1)) + averageRating) / listing.reviewCount;
      await listing.save();
  }

  const reviewee = await User.findById(review.revieweeId);
  if (reviewee) {
      if (review.reviewerRole === 'tenant') {
          reviewee.landlordRating = ((reviewee.landlordRating * reviewee.totalReviewsReceived) + averageRating) / (reviewee.totalReviewsReceived + 1);
      } else {
          reviewee.tenantRating = ((reviewee.tenantRating * reviewee.totalReviewsReceived) + averageRating) / (reviewee.totalReviewsReceived + 1);
      }
      reviewee.totalReviewsReceived += 1;
      reviewee.trustBadge = calculateTrustBadge(reviewee.landlordRating || reviewee.tenantRating, reviewee.totalReviewsReceived, true);
      await reviewee.save();
  }

  res.status(201).json({ success: true, reviewId: review._id });
});

export const getListingReviews = asyncHandler(async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const reviews = await Review.find({ listingId, status: 'published' }).populate('reviewerId', 'name avatar');
  res.json(reviews);
});
