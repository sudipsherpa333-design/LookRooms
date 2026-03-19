import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock, MoreVertical } from 'lucide-react';
import AdminRefundForm from './AdminRefundForm';
import axiosInstance from '../../api/axiosInstance';

export default function AdminPaymentsTable() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', gateway: '', page: 1 });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        status: filters.status,
        gateway: filters.gateway,
        page: filters.page.toString()
      });
      const res = await axiosInstance.get(`/admin/payment/all?${query}`, {
        headers: { 
          'x-user-id': JSON.parse(localStorage.getItem('user') || '{}').id
        }
      });
      const data = res.data;
      setPayments(data.payments || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter"><CheckCircle className="w-3 h-3" /> Success</span>;
      case 'failed':
        return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter"><XCircle className="w-3 h-3" /> Failed</span>;
      case 'refunded':
        return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter"><RefreshCw className="w-3 h-3" /> Refunded</span>;
      default:
        return <span className="flex items-center gap-1 bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Payment Transactions</h2>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Manage and monitor all platform payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white border border-stone-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-all">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/30 overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              placeholder="Search by User or ID..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-stone-900 outline-none transition-all"
            />
          </div>
          <select 
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold uppercase tracking-tighter outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="pending">Pending</option>
          </select>
          <select 
            value={filters.gateway}
            onChange={e => setFilters({...filters, gateway: e.target.value, page: 1})}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold uppercase tracking-tighter outline-none focus:ring-2 focus:ring-stone-900"
          >
            <option value="">All Gateways</option>
            <option value="esewa">eSewa</option>
            <option value="khalti">Khalti</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Listing</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Gateway</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4"><div className="h-10 bg-stone-50 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-400 font-bold uppercase tracking-widest">No transactions found</td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-stone-900">{payment.userId?.name}</span>
                        <span className="text-[10px] text-stone-400 font-medium">{payment.userId?.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-stone-600 line-clamp-1">{payment.listingId?.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-emerald-600">Rs. {payment.totalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{payment.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">{new Date(payment.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {payment.status === 'success' && (
                          <button 
                            onClick={() => { setSelectedPayment(payment); setShowRefundModal(true); }}
                            className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-amber-100 transition-all"
                          >
                            Refund
                          </button>
                        )}
                        <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-stone-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Page {filters.page} of {totalPages}</span>
          <div className="flex gap-2">
            <button 
              disabled={filters.page === 1}
              onClick={() => setFilters({...filters, page: filters.page - 1})}
              className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              disabled={filters.page === totalPages}
              onClick={() => setFilters({...filters, page: filters.page + 1})}
              className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showRefundModal && selectedPayment && (
        <AdminRefundForm 
          payment={selectedPayment} 
          onClose={() => setShowRefundModal(false)} 
          onRefundSuccess={() => { setShowRefundModal(false); fetchPayments(); }} 
        />
      )}
    </div>
  );
}
