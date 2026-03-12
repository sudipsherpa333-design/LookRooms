import React, { useState } from "react";
import { Mail, MessageSquare, Send, ShieldCheck, LifeBuoy, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export default function Support() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to the backend
    console.log("Ticket submitted:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-stone-200 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Ticket Submitted!</h2>
          <p className="text-stone-600 mb-8">
            Thank you for reaching out. Our support team will get back to you at <strong>{formData.email}</strong> as soon as possible.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Submit Another Ticket
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <LifeBuoy className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900">Support Center</h1>
          </div>
          <p className="text-stone-600 text-lg">
            Need help with LookRooms? Submit a ticket or contact us directly.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                Email Support
              </h3>
              <p className="text-sm text-stone-600 mb-4">
                For general inquiries and account issues.
              </p>
              <a 
                href="mailto:lookrooms@gmail.com" 
                className="text-emerald-600 font-medium hover:underline flex items-center gap-1"
              >
                lookrooms@gmail.com
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold mb-2">Help Center</h3>
              <p className="text-emerald-100 text-sm mb-4">
                Check our FAQ for quick answers to common questions.
              </p>
              <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20">
                Browse FAQ
              </button>
            </div>
          </div>

          {/* Ticket Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
              <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
                Submit a Ticket
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">Email</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">Subject</label>
                  <input 
                    required
                    type="text" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="What can we help you with?"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-stone-700">Message</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Describe your issue in detail..."
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
