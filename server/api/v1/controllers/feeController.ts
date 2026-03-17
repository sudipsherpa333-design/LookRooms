import { Request, Response } from 'express';
import { Listing } from '../../../models/index.js';
import { FeeRule } from '../../../models/FeeRule.js';
import { calculateServiceFee } from '../../../utils/feeCalculator.js';

export const getFeePreview = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  try {
    const listing = await (Listing as any).findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const serviceFee = await calculateServiceFee(listing.propertyType || listing.roomType);
    
    res.json({
      roomType: listing.propertyType || listing.roomType,
      roomTypeLabel: listing.propertyType || listing.roomType,
      monthlyRent: listing.price,
      depositAmount: listing.securityDeposit || 0,
      serviceFee: serviceFee,
      feeLabel: 'Platform connection fee',
      breakdown: {
        platformFee: `Rs ${serviceFee.toLocaleString()} (one-time, paid to LookRooms)`,
        rentPayment: `Rs ${listing.price.toLocaleString()}/month paid directly to landlord`,
        whenCharged: "Pay now to send your booking request",
        refundPolicy: "Full refund if landlord rejects or no response in 48hrs"
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fee preview' });
  }
};
