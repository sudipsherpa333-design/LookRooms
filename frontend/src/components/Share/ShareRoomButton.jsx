import React, { useState } from 'react';
import axios from 'axios';
import { Share2, Copy, MessageCircle, Facebook, Twitter, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareRoomButton({ listing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareCount, setShareCount] = useState(listing.shareCount || 0);

  const handleShare = async (platform) => {
    try {
      const { data } = await axios.post('/api/share/track', { 
        listingId: listing._id, 
        platform 
      });
      
      setShareCount(prev => prev + 1);
      
      if (platform === 'copy_link') {
        navigator.clipboard.writeText(data.shareUrl);
        toast.success('Link copied to clipboard!');
      } else {
        window.open(data.shareUrl, '_blank');
      }
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full shadow-sm hover:bg-stone-50"
      >
        <Share2 className="w-4 h-4" />
        <span>Share ({shareCount})</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-200 p-2 z-10">
          <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-2 w-full p-2 hover:bg-stone-50 rounded-lg"><MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp</button>
          <button onClick={() => handleShare('facebook')} className="flex items-center gap-2 w-full p-2 hover:bg-stone-50 rounded-lg"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</button>
          <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 w-full p-2 hover:bg-stone-50 rounded-lg"><Twitter className="w-4 h-4 text-sky-500" /> Twitter</button>
          <button onClick={() => handleShare('copy_link')} className="flex items-center gap-2 w-full p-2 hover:bg-stone-50 rounded-lg"><Copy className="w-4 h-4" /> Copy Link</button>
        </div>
      )}
    </div>
  );
}
