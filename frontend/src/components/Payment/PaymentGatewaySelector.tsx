import React, { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import SmartFeePreview from './SmartFeePreview';

interface PaymentGatewaySelectorProps {
  listingId: string;
  onGatewaySelect: (gateway: 'esewa' | 'khalti') => void;
  savedTokens?: any[];
}

export default function PaymentGatewaySelector({ listingId, onGatewaySelect, savedTokens = [] }: PaymentGatewaySelectorProps) {
  const [selected, setSelected] = useState<'esewa' | 'khalti' | null>(null);

  const gateways = [
    {
      id: 'esewa',
      name: 'eSewa',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.png',
      color: 'bg-[#60bb46]',
      hasToken: savedTokens.some(t => t.gateway === 'esewa')
    },
    {
      id: 'khalti',
      name: 'Khalti',
      logo: 'https://khalti.com/static/img/logo1.png',
      color: 'bg-[#5c2d91]',
      hasToken: savedTokens.some(t => t.gateway === 'khalti')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {gateways.map((gateway) => (
          <button
            key={gateway.id}
            onClick={() => setSelected(gateway.id as any)}
            className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${selected === gateway.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-stone-100 bg-white hover:border-stone-200'}`}
          >
            {selected === gateway.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-4 h-4" />
              </div>
            )}
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2 bg-white shadow-sm border border-stone-100`}>
              <img src={gateway.logo} alt={gateway.name} className="w-full h-full object-contain" />
            </div>
            
            <span className="font-bold text-stone-900">{gateway.name}</span>

            {gateway.hasToken && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                <Zap className="w-2.5 h-2.5 fill-current" />
                One-Tap
              </div>
            )}
          </button>
        ))}
      </div>

      <SmartFeePreview listingId={listingId} />

      <button
        disabled={!selected}
        onClick={() => selected && onGatewaySelect(selected)}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${selected ? 'bg-stone-900 text-white shadow-stone-900/20 active:scale-[0.98]' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
      >
        Confirm & Pay
      </button>
    </div>
  );
}
