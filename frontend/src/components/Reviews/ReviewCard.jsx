import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, MessageSquare } from 'lucide-react';

export default function ReviewCard({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-6 border-b border-stone-100">
      <div className="flex items-center gap-3 mb-3">
        <img src={review.reviewerId.avatar} alt={review.reviewerId.name} className="w-10 h-10 rounded-full" />
        <div>
          <h4 className="font-bold text-stone-900">{review.reviewerId.name}</h4>
          <p className="text-xs text-stone-500">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
        {review.isVerified && <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">✅ Verified Stay</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        {Object.entries(review.ratings).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between text-xs text-stone-600">
            <span>{key}</span>
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < val ? 'fill-amber-400' : ''}`} />)}
            </div>
          </div>
        ))}
      </div>

      <p className={`text-sm text-stone-700 ${isExpanded ? '' : 'line-clamp-3'}`}>
        {review.comment}
      </p>
      {review.comment.length > 150 && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-emerald-600 font-medium mt-1">
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}

      <div className="flex items-center gap-4 mt-4">
        <button className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900">
          <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpfulVotes.length})
        </button>
        <button className="ml-auto text-stone-400 hover:text-red-500">
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {review.ownerReply && (
        <div className="mt-4 bg-emerald-50 p-4 rounded-xl">
          <p className="text-xs font-bold text-emerald-800 mb-1">Owner Reply</p>
          <p className="text-sm text-emerald-900">{review.ownerReply}</p>
        </div>
      )}
    </div>
  );
}
