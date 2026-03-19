import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

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
    axiosInstance.get(`/fee/preview/${listingId}`).then(res => setPreview(res.data));
  }, [listingId]);

  if (!preview) return null;

  return (
    <div className="border border-stone-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-stone-900">Booking Summary</h3>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">
          Platform Fee
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Property Type</span>
          <span className="font-semibold text-stone-900 capitalize">{preview.roomTypeLabel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Monthly Rent</span>
          <span className="font-semibold text-stone-900">Rs {preview.monthlyRent.toLocaleString()}</span>
        </div>
        <p className="text-[10px] text-stone-400 text-right italic">* To be paid directly to landlord</p>
      </div>

      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
        <div className="flex justify-between items-center mb-1">
          <span className="text-emerald-800 font-bold">Service Fee</span>
          <span className="text-emerald-800 font-bold text-lg">Rs {preview.serviceFee.toLocaleString()}</span>
        </div>
        <p className="text-xs text-emerald-700">One-time platform connection fee</p>
      </div>

      <div className="space-y-2 pt-2 border-t border-stone-100">
        <div className="flex gap-2 items-start text-xs text-stone-600">
          <span className="text-emerald-500 mt-0.5">✓</span>
          <p>{preview.breakdown.refundPolicy}</p>
        </div>
        <div className="flex gap-2 items-start text-xs text-stone-600">
          <span className="text-emerald-500 mt-0.5">✓</span>
          <p>Secure payment via Khalti/eSewa</p>
        </div>
      </div>
    </div>
  );
};
