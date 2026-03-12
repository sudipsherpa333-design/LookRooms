import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function StatusUpdatePanel({ bookingId, role, currentStatus, onUpdate }) {
  const allowedStatuses = {
    tenant: ['in_discussion', 'visit_done', 'booked', 'not_interested', 'no_deal', 'scam_reported'],
    landlord: ['in_discussion', 'visit_scheduled', 'visit_done', 'deal_in_progress', 'booked', 'no_deal', 'room_not_available', 'scam_reported']
  };

  const handleUpdate = async (newStatus) => {
    try {
      await axios.put(`/api/booking-status/update/${bookingId}`, { newStatus });
      toast.success('Status updated!');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
      <h3 className="font-bold text-stone-900 mb-2">Update Status</h3>
      {allowedStatuses[role]?.map(status => (
        <button 
          key={status}
          onClick={() => handleUpdate(status)}
          className="w-full text-left px-4 py-2 bg-stone-50 hover:bg-stone-100 rounded-xl text-sm font-medium"
        >
          {status.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
}
