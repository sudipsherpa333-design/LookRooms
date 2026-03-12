import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartFeePreviewProps {
  listingId: string;
}

export default function SmartFeePreview({ listingId }: SmartFeePreviewProps) {
  const [feeData, setFeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await fetch(`/api/payment/fee-preview/${listingId}`);
        const data = await res.json();
        setFeeData(data);
      } catch (error) {
        console.error('Failed to fetch fee preview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFee();
  }, [listingId]);

  if (loading) return <div className="animate-pulse h-24 bg-stone-100 rounded-2xl" />;
  if (!feeData) return null;

  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
      <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Price Breakdown</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-stone-500 font-medium">Room Price</span>
          <span className="text-stone-900 font-bold">Rs. {feeData.listingPrice.toLocaleString()}</span>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-center text-sm bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-700 font-bold">{feeData.feeLabel}</span>
            <div className="group relative">
              <Info className="w-3.5 h-3.5 text-emerald-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                {feeData.note}
              </div>
            </div>
          </div>
          <span className="text-emerald-700 font-black">Rs. {feeData.serviceFee.toLocaleString()}</span>
        </motion.div>

        <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
          <span className="text-stone-900 font-black uppercase tracking-tighter">Total Amount</span>
          <span className="text-emerald-600 font-black text-lg">Rs. {feeData.totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
