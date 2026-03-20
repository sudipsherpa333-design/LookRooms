import React, { useState } from "react";
import { Mail, MessageSquare, Send, ShieldCheck, LifeBuoy, ChevronRight, Phone, Clock, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import { TicketList } from "../components/Support/TicketList";
import { FAQSection } from "../components/Support/FAQSection";

export default function Support() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // In a real app, this would send data to the backend
      // await axiosInstance.post('/support/contact', formData);
      console.log("Ticket submitted:", formData);
      setSubmitted(true);
      toast.success("Support ticket sent successfully!");
    } catch (error) {
      toast.error("Failed to send ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-50 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-stone-100 max-w-md w-full text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <ShieldCheck className="w-12 h-12 text-emerald-600" />
          </motion.div>
          <h2 className="text-3xl font-black text-stone-900 mb-3 tracking-tighter uppercase">Message Received</h2>
          <p className="text-stone-500 mb-10 leading-relaxed">
            Thank you for reaching out. Our support team will review your request and get back to you at <span className="text-stone-900 font-bold underline decoration-emerald-500/30">{formData.email}</span> within 24 hours.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-xl shadow-stone-200 active:scale-[0.98]"
          >
            Back to Support
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <LifeBuoy className="w-3.5 h-3.5" />
            Support Center
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-stone-900 tracking-tighter uppercase mb-6">
            How can we <span className="text-emerald-600">help you?</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-2xl leading-relaxed">
            Experience seamless support with LookRooms. Whether you're a guest or a homeowner, we're here to ensure your journey is smooth.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Dashboard / Quick Links */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            <TicketList />
            <FAQSection />
          </motion.div>

          {/* Ticket Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Open a Ticket</h3>
                  <p className="text-stone-500 text-sm font-medium">We'll respond as quickly as possible</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      placeholder="Your Email Address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="technical">Technical Issue</option>
                      <option value="listing">Listing Issue</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      required
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                      placeholder="Subject of your inquiry"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Message Details</label>
                  <textarea 
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-6 py-6 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium resize-none"
                    placeholder="Describe your issue or question for LookRooms support..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
