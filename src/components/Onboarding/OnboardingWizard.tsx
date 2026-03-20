import React from 'react';

export const OnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
        <p className="mb-6">Let's get you started.</p>
        <button onClick={onComplete} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
          Get Started
        </button>
      </div>
    </div>
  );
};
