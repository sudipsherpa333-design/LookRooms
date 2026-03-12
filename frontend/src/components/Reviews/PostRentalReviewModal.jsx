import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Star } from 'lucide-react';

export default function PostRentalReviewModal({ isOpen, onClose, booking, onSubmit }) {
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const categories = step === 1 
    ? ['Cleanliness', 'Owner Response', 'Water Supply', 'Electricity', 'Location', 'Value for Money', 'Security']
    : ['Kept Room Clean', 'Paid Rent on Time', 'Behaviour', 'Property Care', 'Communication'];

  const handleRating = (category, value) => {
    setRatings({ ...ratings, [category]: value });
  };

  const handleSubmit = () => {
    onSubmit({ ratings, comment, isAnonymous });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="mb-4">
          <div className="text-xs font-bold text-stone-500 mb-1">Step {step} of 2</div>
          <div className="h-2 bg-stone-100 rounded-full">
            <div className={`h-2 bg-emerald-600 rounded-full transition-all ${step === 2 ? 'w-full' : 'w-1/2'}`} />
          </div>
        </div>
        <Dialog.Title className="text-lg font-bold mb-4">
          {step === 1 ? `How was your stay at ${booking.listing.title}?` : "How was the tenant?"}
        </Dialog.Title>
        
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat} className="flex items-center justify-between">
              <span className="text-sm text-stone-700">{cat}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`w-5 h-5 cursor-pointer ${ratings[cat] >= star ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`}
                    onClick={() => handleRating(cat, star)}
                  />
                ))}
              </div>
            </div>
          ))}
          {step === 1 && (
            <>
              <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-3 border border-stone-200 rounded-xl text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                Submit anonymously
              </label>
            </>
          )}
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-stone-600">Skip</button>
          <button onClick={step === 1 ? () => setStep(2) : handleSubmit} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
            {step === 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
