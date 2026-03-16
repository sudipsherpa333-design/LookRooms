import React from 'react';

const AgentFees = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">Configure your default service fees for different property types.</p>
        {/* Fee configuration form goes here */}
      </div>
    </div>
  );
};

export default AgentFees;
