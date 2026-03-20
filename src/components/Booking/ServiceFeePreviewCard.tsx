import React from 'react';

export const ServiceFeePreviewCard = ({ listingId }: { listingId: string }) => {
  return (
    <div className="p-4 border rounded-lg bg-slate-50">
      <h3 className="font-semibold mb-2">Service Fees</h3>
      <p className="text-slate-500">Fee details for listing {listingId} will be displayed here.</p>
    </div>
  );
};
