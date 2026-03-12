import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Send, User, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSupportDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', page: 1 });
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        status: filters.status,
        category: filters.category,
        page: filters.page.toString()
      });
      const res = await fetch(`/api/support/admin/tickets?${query}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-user-id': JSON.parse(localStorage.getItem('user') || '{}').id
        }
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/admin/tickets/${selectedTicket._id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-user-id': JSON.parse(localStorage.getItem('user') || '{}').id
        },
        body: JSON.stringify({ reply })
      });
      if (res.ok) {
        setReply('');
        fetchTickets();
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-stone-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Tickets List */}
      <div className="lg:col-span-1 bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/30 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50">
          <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter mb-4">Support Tickets</h2>
          <div className="flex gap-2">
            <select 
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}
              className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-tighter outline-none"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="p-6 animate-pulse bg-stone-50/50 m-2 rounded-xl h-24" />)
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-stone-400 font-bold uppercase tracking-widest text-xs">No tickets found</div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full p-6 text-left transition-all hover:bg-stone-50 flex flex-col gap-2 ${selectedTicket?._id === ticket._id ? 'bg-stone-50 border-r-4 border-stone-900' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">{ticket.category}</span>
                  {getStatusIcon(ticket.status)}
                </div>
                <h3 className="text-sm font-black text-stone-900 line-clamp-1">{ticket.subject}</h3>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{ticket.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 bg-stone-200 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-stone-500" />
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">{ticket.userId?.name || ticket.name}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail & Reply */}
      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/30 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedTicket ? (
            <motion.div
              key={selectedTicket._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-stone-900 uppercase tracking-tighter">{selectedTicket.subject}</h2>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Ticket ID: {selectedTicket._id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedTicket.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      await fetch(`/api/support/admin/tickets/${selectedTicket._id}/status`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'x-user-id': JSON.parse(localStorage.getItem('user') || '{}').id
                        },
                        body: JSON.stringify({ status: newStatus })
                      });
                      fetchTickets();
                    }}
                    className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-[10px] font-black uppercase tracking-tighter outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* User Message */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-stone-400" />
                  </div>
                  <div className="bg-stone-50 rounded-3xl p-6 flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-stone-900 uppercase">{selectedTicket.name}</span>
                      <span className="text-[10px] font-bold text-stone-400 uppercase">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed font-medium">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Admin Reply History */}
                {selectedTicket.adminReply && (
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 bg-stone-900 rounded-2xl flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-stone-900 text-white rounded-3xl p-6 flex-1">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black uppercase">Support Team</span>
                        <span className="text-[10px] font-bold opacity-50 uppercase">{new Date(selectedTicket.repliedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed font-medium">{selectedTicket.adminReply}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50/50">
                <div className="relative">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full pl-6 pr-16 py-4 bg-white border border-stone-200 rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none transition-all resize-none shadow-sm"
                    rows={2}
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !reply.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {sending ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-black uppercase tracking-widest text-xs">Select a ticket to view details</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
