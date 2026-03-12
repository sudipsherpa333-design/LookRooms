import React, { useState } from 'react';
import { Share2, MessageCircle, Facebook, Twitter, Copy, X, Instagram } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface ShareRoomButtonProps {
  roomId: string;
  roomTitle: string;
}

export default function ShareRoomButton({ roomId, roomTitle }: ShareRoomButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = `${window.location.origin}/room/${roomId}`;

  const trackShare = async (platform: string) => {
    try {
      await axios.post('/api/analytics/track-share', { roomId, platform });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  const handleShare = (platform: string, url: string) => {
    trackShare(platform);
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } else {
      window.open(url, '_blank', 'width=600,height=400');
    }
    setIsOpen(false);
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500', url: `https://wa.me/?text=${encodeURIComponent(`Check out this room: ${roomTitle} - ${shareUrl}`)}` },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'Messenger', icon: MessageCircle, color: 'text-blue-400', url: `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}` },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-500', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this room: ${roomTitle}`)}` },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-600', url: `https://www.instagram.com/` }, // Instagram doesn't support direct share links
    { name: 'Copy Link', icon: Copy, color: 'text-stone-500', url: '#' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-[#12121a] border border-[#1e1e2e] p-4 rounded-2xl shadow-xl w-64 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-white">Share this room</h4>
            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => handleShare(option.name.toLowerCase(), option.url)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1e1e2e] transition-colors"
                title={option.name}
              >
                <option.icon className={`w-6 h-6 ${option.color}`} />
                <span className="text-[10px] text-stone-400">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#6366f1] text-white p-4 rounded-full shadow-lg hover:bg-[#4f46e5] transition-all hover:scale-105"
        >
          <Share2 className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
