import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart3, DollarSign, Users, Home, Calendar, ShieldAlert, Star, Megaphone, Zap, BrainCircuit, Settings } from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/admin/overview', icon: BarChart3 },
  { name: 'Revenue', path: '/admin/revenue', icon: DollarSign },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Listings', path: '/admin/listings', icon: Home },
  { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
  { name: 'Trust & Safety', path: '/admin/trust', icon: ShieldAlert },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Viral & Sharing', path: '/admin/viral', icon: Megaphone },
  { name: 'Real-Time', path: '/admin/realtime', icon: Zap },
  { name: 'Predictions', path: '/admin/predictions', icon: BrainCircuit },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f1f5f9] flex">
      <aside className="w-64 bg-[#12121a] border-r border-[#1e1e2e] p-4 flex flex-col">
        <div className="text-xl font-bold text-[#6366f1] mb-8 px-4">LookRooms Admin</div>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-[#6366f1]/10 text-[#6366f1] border-l-2 border-[#6366f1]' : 'text-[#94a3b8] hover:bg-[#1e1e2e]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
