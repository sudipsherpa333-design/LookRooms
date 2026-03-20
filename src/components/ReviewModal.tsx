import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

export const ReviewModal = ({ bookingId, onClose, onSubmitSuccess }: any) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        bookingId,
        comment,
      };

      if (user?.role === 'user') {
        payload.ratings = {
          cleanliness: rating,
          ownerResponse: rating,
          location: rating,
          valueForMoney: rating,
          overallExperience: rating,
        };
      } else {
         payload.tenantRatings = {
          communication: rating,
          cleanliness: rating,
          behaviour: rating,
        };
      }

      await axiosInstance.post('/reviews/submit', payload, {
        headers: {
          'x-user-id': user?.id || user?._id || '',
        },
      });

      onSubmitSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <h3 className="text-xl font-bold text-stone-900">Leave a Review</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2 text-center">
            <label className="block text-sm font-medium text-stone-700">Overall Rating</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">Share your experience</label>
            <textarea
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 text-sm min-h-[120px] resize-none"
              placeholder="What was it like?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
