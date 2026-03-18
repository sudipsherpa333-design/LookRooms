import { Listing, Payment, Application } from "../models/index.js";

export const calculateServiceFee = (propertyType: string): number => {
  switch (propertyType) {
    case "Single Room":
      return 500;
    case "Double Room":
      return 1000;
    case "Flat/Apartment":
    case "1BHK":
      return 1500;
    case "2BHK":
      return 2000;
    default:
      return 1000;
  }
};

export const lockListing = async (listingId: string, userId: string) => {
  await Listing.findByIdAndUpdate(listingId, {
    lockStatus: 'locked',
    lockedBy: userId,
    lockExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });
};

export const unlockListing = async (listingId: string) => {
  await Listing.findByIdAndUpdate(listingId, {
    lockStatus: 'available',
    lockedBy: null,
    lockExpiresAt: null,
  });
};

export const cleanupExpiredLocks = async () => {
  try {
    const now = new Date();
    const expiredListings = await Listing.find({
      lockStatus: 'locked',
      lockExpiresAt: { $lt: now },
    });

    for (const listing of expiredListings) {
      await unlockListing(listing._id.toString());
      // Also update pending payments to failed if they expired
      await Payment.updateMany(
        { listingId: listing._id, status: "pending", createdAt: { $lt: new Date(now.getTime() - 15 * 60 * 1000) } },
        { status: "failed" }
      );
    }
  } catch (error) {
    console.error("Error in cleanupExpiredLocks:", error);
  }
};
