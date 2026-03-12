import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Filter,
  MessageSquare,
  User,
  Home
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function MaintenanceRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/homeowner/maintenance", {
        headers: { "x-user-id": user?.id || user?._id || "" }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      toast.error("Failed to fetch maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes: string) => {
    try {
      const res = await fetch(`/api/homeowner/maintenance/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user?.id || user?._id || "" 
        },
        body: JSON.stringify({ status, adminNotes: notes })
      });
      if (res.ok) {
        toast.success("Request updated");
        fetchRequests();
      }
    } catch (error) {
      toast.error("Failed to update request");
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-stone-900">Maintenance</h1>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
              {requests.filter(r => r.status === 'open').length} New
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["all", "open", "in-progress", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
            <Wrench className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">No maintenance requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        request.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                        request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {request.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        request.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                        request.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900">{request.title}</h3>
                  </div>
                  <Wrench className="w-5 h-5 text-stone-400" />
                </div>

                <p className="text-sm text-stone-600 mb-4 line-clamp-2">
                  {request.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <User className="w-4 h-4" />
                    <span className="truncate">{request.tenantId?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Home className="w-4 h-4" />
                    <span className="truncate">{request.listingId?.title}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {request.status === 'open' && (
                    <button
                      onClick={() => updateStatus(request._id, 'in-progress', 'Working on it')}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Start Work
                    </button>
                  )}
                  {request.status === 'in-progress' && (
                    <button
                      onClick={() => updateStatus(request._id, 'resolved', 'Fixed')}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
