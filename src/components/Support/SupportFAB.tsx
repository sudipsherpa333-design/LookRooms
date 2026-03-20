import React, { useState } from 'react';
import { LifeBuoy, X, MessageSquare, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const SupportFAB = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 bg-white rounded-3xl shadow-2xl border border-stone-100 p-6 w-72"
          >
            <h4 className="font-black text-stone-900 uppercase tracking-tighter mb-4">Need Help?</h4>
            <div className="space-y-3">
              <Link to="/support" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium text-sm">Open a Ticket</span>
              </Link>
              <a href="tel:+1234567890" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition-colors">
                <Phone className="w-5 h-5" />
                <span className="font-medium text-sm">Call Support</span>
              </a>
              <a href="mailto:support@lookrooms.com" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 transition-colors">
                <Mail className="w-5 h-5" />
                <span className="font-medium text-sm">Email Us</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center hover:bg-emerald-700 transition-colors"
      >
        {isOpen ? <X className="w-7 h-7" /> : <LifeBuoy className="w-7 h-7" />}
      </motion.button>
    </div>
  );
};
