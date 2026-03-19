import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance";
import {
  Users,
  Home,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Search,
  MoreVertical,
  Trash2,
  Ban,
  Calendar,
  Eye,
  Heart,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import AdminPaymentsTable from "../components/Admin/AdminPaymentsTable";
import AdminSupportDashboard from "../components/Admin/AdminSupportDashboard";

interface Listing {
  id: string;
  _id?: string;
  title: string;
  price: number;
  area: string;
  status: string;
  createdAt: string;
  metrics?: {
    views: number;
    saves: number;
    inquiries: number;
  };
}

interface KycUser {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  role: string;
  verificationLevel: string;
  kycDocumentType: string;
  kycDocumentUrl: string;
  kycIdNumber: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalLandlords: 0,
    totalListings: 0,
    activeListings: 0,
    occupiedListings: 0,
    totalApplications: 0,
    totalPayments: 0,
    pendingListings: 0,
    pendingKyc: 0,
    totalRevenue: 0,
    gatewayBreakdown: []
  });
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [pendingKyc, setPendingKyc] = useState<KycUser[]>([]);
  const [allUsers, setAllUsers] = useState<KycUser[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "kyc" | "users" | "all_listings" | "payments" | "bookings" | "chat_logs" | "support_tickets" | "settings">("listings");
  const [selectedKyc, setSelectedKyc] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, listingsRes, kycRes, usersRes, allListingsRes, paymentsRes, bookingsRes, chatLogsRes, supportTicketsRes, settingsRes] = await Promise.all([
        axiosInstance.get("/admin/analytics/overview"),
        axiosInstance.get("/admin/listings/pending"),
        axiosInstance.get("/admin/users/verification-requests"),
        axiosInstance.get("/admin/users"),
        axiosInstance.get("/listings?status=all"),
        axiosInstance.get("/admin/payments"),
        axiosInstance.get("/admin/bookings"),
        axiosInstance.get("/admin/chat-logs"),
        axiosInstance.get("/support/admin/tickets"),
        axiosInstance.get("/admin/settings"),
      ]);
      const statsData = statsRes.data;
      const listingsData = listingsRes.data;
      const kycData = kycRes.data;
      const usersData = usersRes.data;
      const allListingsData = allListingsRes.data;
      const paymentsData = paymentsRes.data;
      const bookingsData = bookingsRes.data;
      const chatLogsData = chatLogsRes.data;
      const supportTicketsData = supportTicketsRes.data;
      const settingsData = settingsRes.data;

      setStats(statsData);
      setPendingListings(Array.isArray(listingsData) ? listingsData : []);
      setPendingKyc(Array.isArray(kycData) ? kycData : []);
      setAllUsers(Array.isArray(usersData) ? usersData : []);
      setAllListings(Array.isArray(allListingsData) ? allListingsData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setChatLogs(Array.isArray(chatLogsData) ? chatLogsData : []);
      setSupportTickets(Array.isArray(supportTicketsData) ? supportTicketsData : []);
      if (settingsData.success) {
        setSystemSettings(settingsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "active" | "rejected",
  ) => {
    try {
      const endpoint = status === "active" ? "approve" : "reject";
      await axiosInstance.post(`/admin/listings/${id}/${endpoint}`, {
        reason: "Admin decision",
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleKycStatusUpdate = async (
    id: string,
    status: "verified" | "rejected",
  ) => {
    try {
      const endpoint =
        status === "verified" ? "verify-documents" : "reject-documents";
      await axiosInstance.post(`/admin/users/${id}/${endpoint}`, {
        reason: "Admin decision",
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to update KYC status", error);
    }
  };

  const handleBatchVerify = async () => {
    if (selectedKyc.length === 0) return;
    if (!window.confirm(`Are you sure you want to verify ${selectedKyc.length} users?`)) return;
    
    setBatchActionLoading(true);
    try {
      const res = await axiosInstance.post("/admin/users/batch-verify", {
        userIds: selectedKyc,
      });
      if (res.status === 200 || res.status === 201) {
        setSelectedKyc([]);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to batch verify", error);
    } finally {
      setBatchActionLoading(false);
    }
  };

  const toggleKycSelection = (id: string) => {
    setSelectedKyc(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllKyc = () => {
    if (selectedKyc.length === pendingKyc.length) {
      setSelectedKyc([]);
    } else {
      setSelectedKyc(pendingKyc.map(u => u.id || u._id || ""));
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await axiosInstance.delete(`/admin/listings/${id}`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete listing", error);
    }
  };

  const filteredListings = allListings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone.includes(searchQuery)
  );

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingUser(userId);
    try {
      const res = await axiosInstance.post(`/admin/users/${userId}/role`, {
        role: newRole,
      });
      if (res.status === 200 || res.status === 201) {
        toast.success("Role updated successfully");
        fetchData();
      } else {
        toast.error(res.data.error || "Failed to update role");
      }
    } catch (error: any) {
      console.error("Failed to update role", error);
      toast.error(error.response?.data?.error || "An error occurred while updating role");
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    setUpdatingUser(userId);
    try {
      const res = await axiosInstance.post(`/admin/users/${userId}/status`, {
        status: newStatus,
      });
      if (res.status === 200 || res.status === 201) {
        toast.success("Account status updated");
        fetchData();
      } else {
        toast.error(res.data.error || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Failed to update status", error);
      toast.error(error.response?.data?.error || "An error occurred while updating status");
    } finally {
      setUpdatingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Admin Dashboard
            </h1>
            <p className="text-stone-500">Platform overview and moderation</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Total</span>
            </div>
            <p className="text-2xl font-bold text-stone-900">Rs. {stats.totalRevenue?.toLocaleString()}</p>
            <p className="text-xs text-stone-500 mt-1">Total Revenue</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Today</span>
            </div>
            <p className="text-2xl font-bold text-stone-900">Rs. {stats.dailyRevenue?.toLocaleString()}</p>
            <p className="text-xs text-stone-500 mt-1">Daily Revenue</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Month</span>
            </div>
            <p className="text-2xl font-bold text-stone-900">Rs. {stats.monthlyRevenue?.toLocaleString()}</p>
            <p className="text-xs text-stone-500 mt-1">Monthly Revenue</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Success</span>
            </div>
            <p className="text-2xl font-bold text-stone-900">{stats.totalPayments}</p>
            <p className="text-xs text-stone-500 mt-1">Successful Payments</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Users</p>
              <p className="text-lg font-bold text-stone-900">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Listings</p>
              <p className="text-lg font-bold text-stone-900">{stats.totalListings}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">KYC Pending</p>
              <p className="text-lg font-bold text-stone-900">{stats.pendingKyc}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Mod Queue</p>
              <p className="text-lg font-bold text-stone-900">{stats.pendingListings}</p>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        {stats.gatewayBreakdown?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.gatewayBreakdown.map((gb: any) => (
              <div key={gb._id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${gb._id === 'esewa' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase">{gb._id} Revenue</p>
                    <p className="text-lg font-bold text-stone-900">Rs. {gb.total?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400">Transactions</p>
                  <p className="text-sm font-bold text-stone-700">{gb.count}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200">
          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "listings" ? "border-emerald-600 text-emerald-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("listings"); setSearchQuery(""); }}
            >
              Approvals
            </button>
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "all_listings" ? "border-emerald-600 text-emerald-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("all_listings"); setSearchQuery(""); }}
            >
              Listings
            </button>
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "kyc" ? "border-purple-600 text-purple-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("kyc"); setSearchQuery(""); }}
            >
              KYC
            </button>
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "users" ? "border-blue-600 text-blue-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
            >
              Users
            </button>
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "payments" ? "border-amber-600 text-amber-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("payments"); setSearchQuery(""); }}
            >
              Payments
            </button>
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "bookings" ? "border-indigo-600 text-indigo-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("bookings"); setSearchQuery(""); }}
            >
              Bookings
            </button>
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "chat_logs" ? "border-pink-600 text-pink-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("chat_logs"); setSearchQuery(""); }}
            >
              Chat Logs
            </button>
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "support_tickets" ? "border-red-600 text-red-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("support_tickets"); setSearchQuery(""); }}
            >
              Support Tickets
            </button>
            <button
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === "settings" ? "border-slate-600 text-slate-700" : "border-transparent text-stone-500 hover:text-stone-700"}`}
              onClick={() => { setActiveTab("settings"); setSearchQuery(""); }}
            >
              Settings
            </button>
          </div>

          {(activeTab === "all_listings" || activeTab === "users") && (
            <div className="pb-2">
              <input
                type="text"
                placeholder={`Search ${activeTab === "users" ? "users..." : "listings..."}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-1.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Moderation Queue */}
        {activeTab === "listings" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Listing Moderation Queue
              </h2>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                {pendingListings.length} Pending
              </span>
            </div>

            {pendingListings.length === 0 ? (
              <div className="p-12 text-center text-stone-500">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-200 mb-3" />
                <p>All caught up! No listings pending approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {pendingListings.map((listing) => (
                  <div
                    key={listing.id || listing._id}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-bold text-stone-900">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                        <span>Rs. {listing.price.toLocaleString()}/mo</span>
                        <span>•</span>
                        <span>{listing.area}</span>
                        <span>•</span>
                        <span>
                          Added{" "}
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            listing.id || listing._id,
                            "active",
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(
                            listing.id || listing._id,
                            "rejected",
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "all_listings" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-500" />
                All Listings
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                {filteredListings.length} Total
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id || listing._id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-stone-900">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                      <span className={`capitalize font-medium ${listing.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {listing.status}
                      </span>
                      <span>•</span>
                      <span>Rs. {listing.price.toLocaleString()}/mo</span>
                      <span>•</span>
                      <span>{listing.area}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-stone-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {listing.metrics?.views || 0} Views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {listing.metrics?.saves || 0} Saves
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {listing.metrics?.inquiries || 0} Inquiries
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/listing/${listing.id || listing._id}`}
                      className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(listing.id || listing._id || "")}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "kyc" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-500" />
                  KYC Verification Queue
                </h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                  {pendingKyc.length} Pending
                </span>
              </div>
              
              {pendingKyc.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSelectAllKyc}
                    className="text-sm font-medium text-stone-600 hover:text-stone-900"
                  >
                    {selectedKyc.length === pendingKyc.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    onClick={handleBatchVerify}
                    disabled={selectedKyc.length === 0 || batchActionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed text-sm"
                  >
                    {batchActionLoading ? "Processing..." : `Verify Selected (${selectedKyc.length})`}
                  </button>
                </div>
              )}
            </div>

            {pendingKyc.length === 0 ? (
              <div className="p-12 text-center text-stone-500">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-200 mb-3" />
                <p>All caught up! No KYC documents pending approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {pendingKyc.map((user) => (
                  <div
                    key={user.id || user._id}
                    className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors ${selectedKyc.includes(user.id || user._id || "") ? 'bg-emerald-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={selectedKyc.includes(user.id || user._id || "")}
                          onChange={() => toggleKycSelection(user.id || user._id || "")}
                          className="w-4 h-4 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-stone-900">
                          {user.name}{" "}
                          <span className="text-xs font-normal text-stone-500 ml-2">
                            ({user.role})
                          </span>
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                          <span>Phone: {user.phone}</span>
                          <span>•</span>
                          <span>Doc: {user.kycDocumentType}</span>
                          <span>•</span>
                          <span>ID: {user.kycIdNumber}</span>
                        </div>
                        <div className="mt-3">
                          {user.kycDocumentUrl?.startsWith("data:image") ? (
                            <div className="relative w-32 h-20 border border-stone-200 rounded-lg overflow-hidden group">
                              <img src={user.kycDocumentUrl} alt="KYC Document" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a
                                  href={user.kycDocumentUrl}
                                  download={`kyc-${user.name.replace(/\s+/g, "-")}.jpg`}
                                  className="text-white text-xs font-medium flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" /> Download
                                </a>
                              </div>
                            </div>
                          ) : (
                            <a
                              href={user.kycDocumentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <FileText className="w-4 h-4" /> View Document
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleKycStatusUpdate(user.id || user._id || "", "verified")
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify
                      </button>
                      <button
                        onClick={() =>
                          handleKycStatusUpdate(user.id || user._id || "", "rejected")
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                All Users
              </h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                {filteredUsers.length} Users
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {filteredUsers.map((user) => (
                <div
                  key={user.id || user._id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900">
                        {user.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'homeowner' ? 'bg-blue-100 text-blue-700' :
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                      <span>Phone: {user.phone}</span>
                      <span>•</span>
                      <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">Change Role</label>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id || user._id || "", e.target.value)}
                        disabled={updatingUser === (user.id || user._id)}
                        className="text-xs font-bold bg-stone-100 border-stone-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer outline-none transition-all"
                      >
                        <option value="user">User</option>
                        <option value="homeowner">Homeowner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">Status</label>
                      <select
                        value={(user as any).accountStatus || "active"}
                        onChange={(e) => handleUpdateStatus(user.id || user._id || "", e.target.value)}
                        disabled={updatingUser === (user.id || user._id)}
                        className={`text-xs font-bold border-stone-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer outline-none transition-all ${
                          ((user as any).accountStatus || "active") === "active" ? "bg-emerald-50 text-emerald-700 focus:border-emerald-500" : "bg-red-50 text-red-700 focus:border-red-500"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">Verification</label>
                      {user.verificationLevel === "verified" ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider border border-emerald-100">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-stone-500 font-bold bg-stone-100 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider border border-stone-200">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "payments" && (
          <AdminPaymentsTable />
        )}

        {activeTab === "support_tickets" && (
          <AdminSupportDashboard />
        )}

        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Booking Requests
              </h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                {bookings.length} Total
              </span>
            </div>
            <div className="divide-y divide-stone-100">
              {bookings.map((b) => (
                <div key={b._id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-stone-900">{b.listing?.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                      <span>Applicant: {b.applicant?.name}</span>
                      <span>•</span>
                      <span>Owner: {b.homeowner?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-700'}`}>
                      {b.status}
                    </span>
                    <span className="text-xs text-stone-400">{new Date(b.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "chat_logs" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-500" />
                WhatsApp Contact Logs
              </h2>
              <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-full">
                {chatLogs.length} Contacts
              </span>
            </div>
            <div className="divide-y divide-stone-100">
              {chatLogs.map((log) => (
                <div key={log._id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">
                        {log.userId?.name} (ID: {log.userId?._id}) contacted {log.ownerId?.name} (ID: {log.ownerId?._id})
                      </p>
                      {log.listingId ? (
                        <p className="text-xs text-stone-500 mt-0.5">
                          Listing: {log.listingId.title} (ID: {log.listingId._id})
                        </p>
                      ) : (
                        <p className="text-xs text-stone-500 mt-0.5">
                          Direct Chat Contact
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-stone-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <div className="flex flex-col items-end gap-1 mt-1">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                        {log.platform || "WhatsApp"}
                      </span>
                      {log.contactMethod && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">
                          {log.contactMethod}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "support_tickets" && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Support Tickets
              </h2>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                {supportTickets.length} Open
              </span>
            </div>
            <div className="divide-y divide-stone-100">
              {supportTickets.map((ticket) => (
                <div key={ticket._id} className="p-6 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-stone-900">{ticket.subject}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{ticket.message}</p>
                    <p className="text-[10px] text-stone-400 mt-1">From: {ticket.userId?.name} ({ticket.userId?.email})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-stone-400">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && systemSettings && (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <h2 className="text-lg font-bold text-stone-900">System Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Default Service Fee (%)
                </label>
                <input
                  type="number"
                  value={systemSettings.defaultServiceFee}
                  onChange={(e) => setSystemSettings({ ...systemSettings, defaultServiceFee: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-900">Maintenance Mode</p>
                  <p className="text-xs text-stone-500">Disable access for non-admin users</p>
                </div>
                <button
                  onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-stone-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-700">Email Notifications</p>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, notificationSettings: { ...systemSettings.notificationSettings, emailEnabled: !systemSettings.notificationSettings.emailEnabled } })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.notificationSettings?.emailEnabled ? 'bg-emerald-500' : 'bg-stone-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.notificationSettings?.emailEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-700">SMS Notifications</p>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, notificationSettings: { ...systemSettings.notificationSettings, smsEnabled: !systemSettings.notificationSettings.smsEnabled } })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings.notificationSettings?.smsEnabled ? 'bg-emerald-500' : 'bg-stone-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings.notificationSettings?.smsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={async () => {
                    try {
                      const res = await axiosInstance.put("/admin/settings", systemSettings);
                      if (res.status === 200 || res.status === 201) alert("Settings updated successfully");
                      else alert("Failed to update settings");
                    } catch (e) {
                      alert("Error updating settings");
                    }
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

