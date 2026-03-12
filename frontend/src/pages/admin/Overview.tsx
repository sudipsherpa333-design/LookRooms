import React from 'react';
import { BarChart3, Users, Home, Calendar, Star, ShieldAlert, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const kpiData = [
  { title: 'Total Revenue', value: 'Rs 8,42,000', change: '+23%', icon: DollarSign, color: 'text-emerald-500' },
  { title: 'Total Users', value: '2,847', change: '+12%', icon: Users, color: 'text-blue-500' },
  { title: 'Active Listings', value: '1,234', change: '+8%', icon: Home, color: 'text-indigo-500' },
  { title: 'Bookings', value: '319', change: '+31%', icon: Calendar, color: 'text-amber-500' },
  { title: 'Avg Rating', value: '4.7', change: '+0.2', icon: Star, color: 'text-emerald-500' },
  { title: 'Scam Reports', value: '7', change: '-3', icon: ShieldAlert, color: 'text-red-500' },
];

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={i} className="bg-[#12121a] border border-[#1e1e2e] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              <span className={`text-xs font-medium ${kpi.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{kpi.change}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="text-xs text-[#94a3b8]">{kpi.title}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#12121a] border border-[#1e1e2e] p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold mb-6">Revenue & Bookings Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#12121a', border: 'none' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#12121a] border border-[#1e1e2e] p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Live Activity</h3>
            <button onClick={() => window.location.href = '/listings'} className="text-xs text-[#6366f1] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            <p className="text-[#94a3b8] text-sm">Live events will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
