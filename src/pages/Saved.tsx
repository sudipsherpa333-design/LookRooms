import React from 'react';

export default function Saved() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Saved Listings</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-slate-500">You haven't saved any listings yet.</p>
      </div>
    </div>
  );
}
