import React from 'react';

interface PaymentGatewaySelectorProps {
  listingId: string;
  onGatewaySelect: (gateway: 'esewa' | 'khalti') => Promise<void>;
}

const PaymentGatewaySelector = ({ listingId, onGatewaySelect }: PaymentGatewaySelectorProps) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Select Payment Method</h3>
      <p className="text-slate-500">Payment options for {listingId} will be displayed here.</p>
      <button onClick={() => onGatewaySelect('esewa')}>Pay with eSewa</button>
      <button onClick={() => onGatewaySelect('khalti')}>Pay with Khalti</button>
    </div>
  );
};

export default PaymentGatewaySelector;
