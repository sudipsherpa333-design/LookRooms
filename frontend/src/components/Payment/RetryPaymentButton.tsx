import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

interface RetryPaymentButtonProps {
  paymentId: string;
  retryExpiry: string;
  retryCount: number;
  paymentMethod: string;
  onRetrySuccess: (data: any) => void;
}

export default function RetryPaymentButton({ paymentId, retryExpiry, retryCount, paymentMethod, onRetrySuccess }: RetryPaymentButtonProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiry = new Date(retryExpiry).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [retryExpiry]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(`/payment/retry/${paymentId}`);
      if (data.success) {
        onRetrySuccess(data);
      } else {
        alert(data.error || 'Retry failed');
      }
    } catch (error: any) {
      console.error('Retry Error:', error);
      alert(error.response?.data?.error || 'Retry failed');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = timeLeft <= 0;
  const maxRetriesReached = retryCount >= 3;

  if (isExpired || maxRetriesReached) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-black text-red-900 uppercase tracking-tighter">Retry window expired</h4>
          <p className="text-red-700 text-xs font-medium leading-relaxed">
            Please contact support if you've already been charged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-stone-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>Expires in {formatTime(timeLeft)}</span>
        </div>
        <span>Attempt {retryCount + 1} of 3</span>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleRetry}
        disabled={loading}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${loading ? 'bg-stone-100 text-stone-400' : 'bg-emerald-600 text-white shadow-emerald-600/20'}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
        ) : (
          <>
            <RotateCcw className="w-4 h-4" />
            Retry with {paymentMethod}
          </>
        )}
      </motion.button>
    </div>
  );
}
