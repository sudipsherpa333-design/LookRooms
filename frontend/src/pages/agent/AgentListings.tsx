import React from 'react';

const AgentListings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Add New Listing
        </button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">Manage your property portfolio here.</p>
        {/* Table of listings goes here */}
      </div>
    </div>
  );
};

export default AgentListings;
