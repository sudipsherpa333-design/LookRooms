import React from 'react';

const AgentBookings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">Manage your property viewings and bookings here.</p>
        {/* Calendar or list of bookings goes here */}
      </div>
    </div>
  );
};

export default AgentBookings;
