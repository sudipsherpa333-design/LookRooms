import React, { useState } from 'react';
import { X, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminRefundFormProps {
  payment: any;
  onClose: () => void;
  onRefundSuccess: () => void;
}

export default function AdminRefundForm({ payment, onClose, onRefundSuccess }: AdminRefundFormProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payment/refund/${payment._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-user-id': JSON.parse(localStorage.getItem('user') || '{}').id
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        onRefundSuccess();
      } else {
        alert(data.error || 'Refund failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">Process Refund</h2>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Transaction: {payment.transactionId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-stone-400 font-bold uppercase">Customer</span>
              <span className="text-stone-900 font-bold">{payment.userId?.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400 font-bold uppercase">Amount</span>
              <span className="text-emerald-600 font-black">Rs. {payment.totalAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-400 font-bold uppercase">Gateway</span>
              <span className="text-stone-900 font-bold uppercase">{payment.paymentMethod}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-700 text-[10px] font-bold uppercase tracking-tighter leading-relaxed">
              This action will initiate a refund through the payment gateway. This cannot be undone.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Reason for Refund</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Booking cancelled by owner"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm font-bold resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Confirm Refund
          </button>
        </form>
      </motion.div>
    </div>
  );
}
