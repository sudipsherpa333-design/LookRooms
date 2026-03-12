import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export default function PendingReviewPrompt({ booking, onLeaveReview }) {
  const daysLeft = 14 - differenceInDays(new Date(), new Date(booking.checkoutDate));

  if (daysLeft < 0) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Clock className="w-6 h-6 text-emerald-600" />
        <div>
          <p className="font-bold text-emerald-900">You stayed at {booking.listing.title} — Share your experience!</p>
          <p className="text-sm text-emerald-700">Review expires in {daysLeft} days</p>
        </div>
      </div>
      <button onClick={onLeaveReview} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium">
        Leave Review
      </button>
    </div>
  );
}
