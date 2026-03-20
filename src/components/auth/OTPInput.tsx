import React, { useState, useRef } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
}

export const OTPInput = ({ length = 6, value, onChange }: OTPInputProps) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = value.split('');
    newOtp[index] = val.substring(val.length - 1);
    onChange(newOtp.join(''));

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      {new Array(length).fill('').map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          ref={(el) => { inputs.current[index] = el; }}
          className="w-12 h-12 text-center border rounded-lg text-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      ))}
    </div>
  );
};

export default OTPInput;
