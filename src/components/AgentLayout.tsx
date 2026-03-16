import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CalendarCheck, 
  Wallet, 
  BarChart3, 
  UserCircle, 
  Star, 
  CreditCard, 
  Settings 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AgentLayout = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'agent') {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/agent/dashboard', icon: LayoutDashboard },
    { name: 'My Listings', path: '/agent/listings', icon: Building2 },
    { name: 'CRM (Leads)', path: '/agent/crm', icon: Users },
    { name: 'Bookings', path: '/agent/bookings', icon: CalendarCheck },
    { name: 'Fee Management', path: '/agent/fees', icon: Wallet },
    { name: 'Analytics', path: '/agent/analytics', icon: BarChart3 },
    { name: 'Agency Profile', path: '/agent/profile', icon: UserCircle },
    { name: 'Reviews', path: '/agent/reviews', icon: Star },
    { name: 'Subscription', path: '/agent/subscription', icon: CreditCard },
    { name: 'Settings', path: '/agent/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-indigo-600">Agent Portal</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AgentLayout;
