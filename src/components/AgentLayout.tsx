import React from 'react';
import { Outlet } from 'react-router-dom';
import { SupportFAB } from './Support/SupportFAB';

export default function AgentLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="text-xl font-bold mb-6">Agent Portal</h2>
        {/* Agent Navigation */}
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
        <SupportFAB />
      </main>
    </div>
  );
}
