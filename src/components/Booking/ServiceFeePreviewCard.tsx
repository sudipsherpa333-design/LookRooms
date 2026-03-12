import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface FeePreview {
  roomType: string;
  roomTypeLabel: string;
  monthlyRent: number;
  serviceFee: number;
  feeLabel: string;
  breakdown: {
    platformFee: string;
    rentPayment: string;
    whenCharged: string;
    refundPolicy: string;
  };
}

export const ServiceFeePreviewCard: React.FC<{ listingId: string }> = ({ listingId }) => {
  const [preview, setPreview] = useState<FeePreview | null>(null);

  useEffect(() => {
    axios.get(`/api/fee/preview/${listingId}`).then(res => setPreview(res.data));
  }, [listingId]);

  if (!preview) return null;

  return (
    <div className="border border-stone-200 rounded-2xl p-4 bg-white shadow-sm">
      <h3 className="font-bold text-lg mb-2">💳 Booking Fee Summary</h3>
      <p>Room Type: {preview.roomTypeLabel}</p>
      <p>Monthly Rent: Rs {preview.monthlyRent.toLocaleString()} (pay to owner)</p>
      <div className="bg-emerald-50 p-3 rounded-xl my-3">
        <p className="font-bold text-emerald-800">LookRooms Service Fee: Rs {preview.serviceFee.toLocaleString()}</p>
        <p className="text-sm text-emerald-700">✅ Pay only if accepted</p>
      </div>
      <p className="text-sm text-stone-600">ℹ️ {preview.breakdown.platformFee}</p>
      <p className="text-sm text-stone-600">{preview.breakdown.rentPayment}</p>
      <p className="text-sm text-stone-600">🔄 {preview.breakdown.refundPolicy}</p>
    </div>
  );
};
