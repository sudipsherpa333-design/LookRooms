import React from 'react';

const statusConfig = {
  inquiry_sent: { label: 'Inquiry Sent', color: 'bg-blue-100 text-blue-800' },
  in_discussion: { label: 'In Discussion', color: 'bg-yellow-100 text-yellow-800' },
  visit_scheduled: { label: 'Visit Scheduled', color: 'bg-orange-100 text-orange-800' },
  visit_done: { label: 'Visit Done', color: 'bg-orange-100 text-orange-800' },
  deal_in_progress: { label: 'Negotiating', color: 'bg-yellow-100 text-yellow-800' },
  booked: { label: 'Booked ✅', color: 'bg-emerald-100 text-emerald-800' },
  scam_reported: { label: '🚨 Scam Reported', color: 'bg-red-100 text-red-800' },
  admin_hold: { label: '🔒 Under Review', color: 'bg-stone-100 text-stone-800' },
  completed: { label: 'Completed ✅', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
};

export default function BookingStatusBar({ status }) {
  const config = statusConfig[status] || { label: status, color: 'bg-stone-100' };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${config.color}`}>
      {config.label}
    </div>
  );
}
