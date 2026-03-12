import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  X,
  Image as ImageIcon,
  Send
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";

export default function MyMaintenance() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    listingId: "",
    title: "",
    description: "",
    priority: "medium",
    category: "other"
  });

  useEffect(() => {
    fetchRequests();
    fetchMyListings(); // To get listings where user is a tenant
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/user/maintenance", {
        headers: { "x-user-id": user?.id || user?._id || "" }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      const res = await fetch("/api/user/applications", {
        headers: { "x-user-id": user?.id || user?._id || "" }
      });
      if (res.ok) {
        const data = await res.json();
        // Only show listings where application is accepted or completed
        setApplications(data.filter((app: any) => app.status === 'accepted' || app.status === 'completed'));
      }
    } catch (error) {
      console.error("Failed to fetch applications");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.listingId) {
      toast.error("Please select a property");
      return;
    }

    try {
      const res = await fetch("/api/user/maintenance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user?.id || user?._id || "" 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Request submitted successfully");
        setShowAddModal(false);
        setFormData({
          listingId: "",
          title: "",
          description: "",
          priority: "medium",
          category: "other"
        });
        fetchRequests();
      }
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">Maintenance</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">No requests yet</h3>
            <p className="text-stone-500 text-sm mb-6">Report any issues with your rental property</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
            >
              New Request
            </button>
          </div>
        ) : (
          requests.map((request) => (
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
                        request.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                        request.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {request.status}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900">{request.title}</h3>
                  </div>
                  <Wrench className="w-5 h-5 text-stone-400" />
                </div>
                <p className="text-sm text-stone-600 mb-4">{request.description}</p>
                <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 p-2 rounded-lg">
                  <span className="font-medium">Property:</span>
                  <span className="truncate">{request.listingId?.title}</span>
                </div>
                {request.adminNotes && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Landlord Note</p>
                    <p className="text-xs text-emerald-800">{request.adminNotes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Maintenance Request"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">
              Select Property
            </label>
            <select
              value={formData.listingId}
              onChange={(e) => setFormData({ ...formData, listingId: e.target.value })}
              className="w-full p-3 bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none"
              required
            >
              <option value="">Choose a property...</option>
              {applications.map((app) => (
                <option key={app.listing._id} value={app.listing._id}>
                  {app.listing.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none"
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="appliance">Appliance</option>
              <option value="structural">Structural</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">
              Issue Title
            </label>
            <input
              type="text"
              placeholder="e.g. Leaking kitchen sink"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">
              Description
            </label>
            <textarea
              placeholder="Provide more details about the issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none h-32 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1 ml-1">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    formData.priority === p
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Submit Request
          </button>
        </form>
      </Modal>
    </div>
  );
}
