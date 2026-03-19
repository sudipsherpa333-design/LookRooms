import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronRight, 
  Search,
  MapPin,
  ShieldCheck,
  MessageSquare
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";

export default function TenantManagement() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchTenants();
  }, [user]);

  const fetchTenants = async () => {
    try {
      const res = await axiosInstance.get("/homeowner/tenants", {
        headers: { "x-user-id": user?.id || user?._id || "" }
      });
      setTenants(res.data);
    } catch (error) {
      toast.error("Failed to fetch tenants");
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.listing?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-xl font-bold text-stone-900 mb-4">Tenants</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 rounded-2xl text-sm transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {filteredTenants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">No active tenants found</p>
          </div>
        ) : (
          filteredTenants.map((tenant, index) => (
            <motion.div
              key={tenant.applicationId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={tenant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenant.name)}&background=random`}
                    alt={tenant.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 truncate">{tenant.name}</h3>
                      {tenant.renterProfile?.verificationLevel === 'verified' && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-stone-500 truncate">{tenant.listing?.title}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    tenant.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {tenant.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <a
                    href={`tel:${tenant.phone}`}
                    className="flex items-center gap-2 p-3 bg-stone-50 rounded-2xl text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-xs font-medium">Call</span>
                  </a>
                  <button
                    className="flex items-center gap-2 p-3 bg-stone-50 rounded-2xl text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-medium">Message</span>
                  </button>
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Email</span>
                    <span className="text-stone-900 font-medium">{tenant.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Status</span>
                    <span className="text-stone-900 font-medium capitalize">{tenant.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
