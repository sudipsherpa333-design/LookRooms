import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';

export default function ShareableRoomCard({ listing }) {
  const cardRef = useRef(null);

  const downloadCard = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current);
      const link = document.createElement('a');
      link.download = `${listing.title.replace(/\s+/g, '-')}-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      <div ref={cardRef} className="bg-white p-6 rounded-2xl shadow-lg border border-stone-200 w-80">
        <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover rounded-xl mb-4" />
        <h2 className="font-bold text-lg">{listing.title}</h2>
        <p className="text-stone-500 text-sm">{listing.area}</p>
        <p className="font-bold text-emerald-600 text-lg mt-2">Rs. {listing.price}/month</p>
        <div className="mt-4 flex justify-center">
          <QRCodeSVG value={`https://lookrooms.com/room/${listing._id}`} size={80} />
        </div>
      </div>
      <button onClick={downloadCard} className="w-full py-2 bg-emerald-600 text-white rounded-xl font-medium">
        Download & Share
      </button>
    </div>
  );
}
