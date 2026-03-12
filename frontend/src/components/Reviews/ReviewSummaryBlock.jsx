import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewSummaryBlock({ listing, onSeeAll }) {
  const { averageRating, reviewCount, ratingBreakdown } = listing;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-5xl font-bold text-stone-900 flex items-center gap-2">
          <Star className="w-10 h-10 text-amber-400 fill-amber-400" />
          {averageRating.toFixed(1)}
        </div>
        <div className="text-stone-500">
          <p className="font-bold text-stone-900">{reviewCount} reviews</p>
          <button onClick={onSeeAll} className="text-emerald-600 font-medium hover:underline">
            See all reviews
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(ratingBreakdown).map(([category, rating]) => (
          <div key={category} className="flex items-center justify-between text-sm">
            <span className="text-stone-600 capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(rating / 5) * 100}%` }} />
              </div>
              <span className="font-bold text-stone-900">{rating.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
