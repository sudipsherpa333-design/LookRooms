import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, MessageSquare, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import RetryPaymentButton from '../components/Payment/RetryPaymentButton';

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const gateway = searchParams.get('gateway');
      const pidx = searchParams.get('pidx');
      const data = searchParams.get('data'); // esewa v2 base64

      if (!gateway) {
        setStatus('failed');
        return;
      }

      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ gateway, pidx, data })
        });
        const result = await res.json();
        if (result.success) {
          setStatus('success');
          setPaymentData(result);
        } else {
          setStatus('failed');
          // Fetch payment details to show retry button
          const historyRes = await fetch('/api/payment/history?limit=1', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const history = await historyRes.json();
          if (history.payments?.[0]) {
            setPaymentData(history.payments[0]);
          }
        }
      } catch (error) {
        console.error('Verification Error:', error);
        setStatus('failed');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
        <div className="p-8 text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
              <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Verifying Payment</h2>
              <p className="text-stone-400 text-sm font-medium mt-2">Please do not close this window...</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tighter mb-2">Request Sent!</h2>
              <p className="text-stone-500 text-sm font-medium mb-8">Your service fee was processed successfully. The landlord has 48 hours to respond.</p>
              
              <div className="bg-stone-50 rounded-2xl p-4 mb-8 text-left space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-bold uppercase">Transaction ID</span>
                  <span className="text-stone-900 font-mono font-bold">{paymentData?.transactionId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-bold uppercase">Service Fee Paid</span>
                  <span className="text-emerald-600 font-black">Rs. {paymentData?.serviceFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400 font-bold uppercase">Monthly Rent</span>
                  <span className="text-stone-900 font-bold">Rs. {paymentData?.monthlyRent?.toLocaleString()} (Pay to Landlord)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-stone-100 text-stone-900 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-200 transition-all">
                  <Download className="w-4 h-4" />
                  Receipt
                </button>
                <Link to="/applications" className="flex items-center justify-center gap-2 bg-stone-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20">
                  My Applications
                </Link>
              </div>
            </motion.div>
          )}

          {status === 'failed' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-6"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tighter mb-2">Payment Failed</h2>
              <p className="text-stone-500 text-sm font-medium mb-8">Something went wrong with your transaction.</p>

              {paymentData && (
                <RetryPaymentButton 
                  paymentId={paymentData._id || paymentData.id}
                  retryExpiry={paymentData.retryExpiry}
                  retryCount={paymentData.retryCount}
                  paymentMethod={paymentData.paymentMethod}
                  onRetrySuccess={() => window.location.reload()}
                />
              )}

              <div className="mt-8 pt-8 border-t border-stone-100 flex flex-col gap-3">
                <Link to="/" className="flex items-center justify-center gap-2 text-stone-400 hover:text-stone-900 transition-colors font-bold text-xs uppercase tracking-widest">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
                <button className="flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-bold text-xs uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
