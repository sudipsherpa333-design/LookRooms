import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Home, User, ShieldCheck, Sparkles } from 'lucide-react';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to LookRooms',
    description: 'The smartest way to find and manage rentals in Nepal.',
    icon: <Sparkles className="w-12 h-12 text-emerald-500" />,
    color: 'bg-emerald-50'
  },
  {
    id: 'role',
    title: 'Who are you?',
    description: 'Are you looking for a room or do you have one to rent?',
    icon: <User className="w-12 h-12 text-blue-500" />,
    color: 'bg-blue-50'
  },
  {
    id: 'trust',
    title: 'Trust & Safety',
    description: 'We verify every listing and user to keep you safe from scams.',
    icon: <ShieldCheck className="w-12 h-12 text-purple-500" />,
    color: 'bg-purple-50'
  },
  {
    id: 'ready',
    title: 'Ready to start?',
    description: 'Let\'s find your perfect match!',
    icon: <Home className="w-12 h-12 text-orange-500" />,
    color: 'bg-orange-50'
  }
];

export const OnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full"
      >
        <div className={`h-2 transition-all duration-500 ${steps[currentStep].color.replace('bg-', 'bg-opacity-20 bg-')}`} style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        
        <div className="p-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <div className={`p-6 rounded-full mb-6 ${steps[currentStep].color}`}>
                {steps[currentStep].icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                {steps[currentStep].title}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-2 pb-8">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-8 bg-emerald-600' : 'w-2 bg-gray-200'
              }`} 
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
