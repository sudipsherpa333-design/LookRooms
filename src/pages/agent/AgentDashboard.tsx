import React from 'react';
import { Building2, Users, CalendarCheck, Wallet, TrendingUp } from 'lucide-react';

const AgentDashboard = () => {
  const stats = [
    { name: 'Active Listings', value: '12', icon: Building2, change: '+2', changeType: 'positive' },
    { name: 'Total Leads', value: '48', icon: Users, change: '+12%', changeType: 'positive' },
    { name: 'Pending Bookings', value: '5', icon: CalendarCheck, change: '-1', changeType: 'negative' },
    { name: 'Estimated Earnings', value: 'Rs 45,000', icon: Wallet, change: '+15%', changeType: 'positive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Add New Listing
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className={`w-4 h-4 mr-1 ${stat.changeType === 'positive' ? 'text-emerald-500' : 'text-red-500'}`} />
                <span className={stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    T{i}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Tenant {i}</p>
                    <p className="text-sm text-gray-500">Interested in 2BHK Apartment</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  New
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bookings</h2>
          <div className="space-y-4">
            <div className="p-4 border border-gray-100 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">Room Viewing - Baneshwor</p>
                <p className="text-sm text-gray-500">Tomorrow, 10:00 AM</p>
              </div>
              <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
