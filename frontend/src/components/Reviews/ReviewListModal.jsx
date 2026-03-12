import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReviewCard from './ReviewCard';
import axios from 'axios';

export default function ReviewListModal({ isOpen, onClose, listingId }) {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen) fetchReviews();
  }, [isOpen, page]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/reviews/listing/${listingId}?page=${page}&limit=10`);
      setReviews(prev => [...prev, ...data]);
      setHasMore(data.length === 10);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full h-[80vh] overflow-hidden flex flex-col shadow-xl">
        <Dialog.Title className="text-lg font-bold mb-4">All Reviews</Dialog.Title>
        
        <div id="scrollableDiv" className="flex-1 overflow-y-auto">
          <InfiniteScroll
            dataLength={reviews.length}
            next={() => setPage(prev => prev + 1)}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            scrollableTarget="scrollableDiv"
          >
            {reviews.map(review => <ReviewCard key={review._id} review={review} />)}
          </InfiniteScroll>
        </div>
        
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-stone-100 rounded-xl">Close</button>
      </div>
    </Dialog>
  );
}
