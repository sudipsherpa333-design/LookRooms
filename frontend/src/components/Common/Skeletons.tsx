import React from 'react';

export const ListingSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="aspect-[4/3] bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="h-6 bg-gray-200 rounded-md w-2/3" />
        <div className="h-6 bg-gray-200 rounded-md w-1/4" />
      </div>
      <div className="h-4 bg-gray-200 rounded-md w-1/2" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded-full w-16" />
        <div className="h-6 bg-gray-200 rounded-full w-16" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
      ))}
    </div>
    <div className="h-96 bg-gray-50 rounded-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-64 bg-gray-100 rounded-2xl" />
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
  </div>
);
