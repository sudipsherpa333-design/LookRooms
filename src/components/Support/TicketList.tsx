import React from 'react';
import { Clock, CheckCircle, MessageSquare } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  createdAt: string;
}

const mockTickets: Ticket[] = [
  { id: 'TKT-101', subject: 'Issue with payment', status: 'open', createdAt: '2026-03-19' },
  { id: 'TKT-102', subject: 'Listing verification', status: 'resolved', createdAt: '2026-03-15' },
];

export const TicketList: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100">
      <h3 className="text-xl font-black text-stone-900 uppercase tracking-tight mb-6">My Tickets</h3>
      <div className="space-y-4">
        {mockTickets.map(ticket => (
          <div key={ticket.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {ticket.status === 'resolved' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-stone-900">{ticket.subject}</p>
                <p className="text-xs text-stone-500">{ticket.id} • {ticket.createdAt}</p>
              </div>
            </div>
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {ticket.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
