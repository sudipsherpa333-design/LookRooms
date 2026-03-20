import React from 'react';

export default function Applications() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-slate-500">You have no active applications.</p>
      </div>
    </div>
  );
}
