import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Active Bookings</h3>
          <p className="text-3xl font-bold text-indigo-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Saved Listings</h3>
          <p className="text-3xl font-bold text-indigo-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Messages</h3>
          <p className="text-3xl font-bold text-indigo-600">0</p>
        </div>
      </div>
    </div>
  );
}
