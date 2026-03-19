import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { MessageSquare, X, Send, HelpCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactSupportForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
    paymentId: ''
  });

  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
    }

    if (isOpen) {
      axiosInstance.get('/payment/history?limit=5')
      .then(res => setRecentPayments(res.data.payments || []))
      .catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/support/contact', formData);
      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
          setFormData(prev => ({ ...prev, subject: '', message: '', paymentId: '' }));
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-stone-900 text-white rounded-full shadow-2xl shadow-stone-900/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <HelpCircle className="w-7 h-7" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <div>
                  <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">Support Center</h2>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">We're here to help</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {success ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">Ticket Submitted</h3>
                    <p className="text-stone-500 text-sm font-medium mt-2">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Name</label>
                        <input
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm font-bold appearance-none"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="payment">Payment Issue</option>
                        <option value="booking">Booking Problem</option>
                        <option value="refund">Refund Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {formData.category === 'payment' && recentPayments.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Related Payment</label>
                        <select
                          value={formData.paymentId}
                          onChange={e => setFormData({ ...formData, paymentId: e.target.value })}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm font-bold appearance-none"
                        >
                          <option value="">Select a payment</option>
                          {recentPayments.map(p => (
                            <option key={p._id} value={p._id}>
                              Rs. {p.amount} - {new Date(p.createdAt).toLocaleDateString()}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Subject</label>
                      <input
                        required
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Message</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl focus:ring-2 focus:ring-stone-900 outline-none transition-all text-sm font-bold resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20 active:scale-[0.98]"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Or email us at <span className="text-stone-900">support@roomfinder.com.np</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
