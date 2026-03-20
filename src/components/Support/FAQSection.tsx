import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { q: 'How do I verify my listing?', a: 'Go to your dashboard, select the listing, and click "Verify". You will need to provide government ID.' },
  { q: 'How are service fees calculated?', a: 'Fees are based on room type: Rs 500 to Rs 2000.' },
  { q: 'Can I chat with the landlord?', a: 'Yes, once a booking request is accepted, you can use the real-time chat feature.' },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
      <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight mb-6">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-stone-100 pb-4">
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex justify-between items-center w-full text-left font-bold text-stone-900"
            >
              {faq.q}
              {openIndex === index ? <ChevronUp className="w-5 h-5 text-emerald-600" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.p 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-sm text-stone-500 mt-2 leading-relaxed"
                >
                  {faq.a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};
