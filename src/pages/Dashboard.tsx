import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Home,
  Eye,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
  PlusCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  UploadCloud,
  Clock,
  Users,
  Wrench,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MOCK_CHART_DATA = [
  { name: "Mon", views: 12 },
  { name: "Tue", views: 19 },
  { name: "Wed", views: 15 },
  { name: "Thu", views: 25 },
  { name: "Fri", views: 32 },
  { name: "Sat", views: 45 },
  { name: "Sun", views: 38 },
];

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycDocType, setKycDocType] = useState("Citizenship");
  const [kycIdNumber, setKycIdNumber] = useState("");
  const [kycDocumentUrl, setKycDocumentUrl] = useState("");
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const { user, logout, refreshUser } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [userApplications, setUserApplications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch landlord's listings and stats
    const fetchData = async () => {
      if (!user) return;
      try {
        const [listingsRes, statsRes, viewedRes, appsRes] = await Promise.all([
          fetch(`/api/homeowner/listings`, {
            headers: { "x-user-id": user.id || user._id || "" },
          }),
          fetch(`/api/homeowner/dashboard/overview`, {
            headers: { "x-user-id": user.id || user._id || "" },
          }),
          fetch(`/api/user/viewed`, {
            headers: { "x-user-id": user.id || user._id || "" },
          }),
          fetch(`/api/user/applications`, {
            headers: { "x-user-id": user.id || user._id || "" },
          }),
        ]);

        if (listingsRes.ok) {
          const data = await listingsRes.json();
          setListings(Array.isArray(data) ? data : []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        if (viewedRes.ok) {
          const data = await viewedRes.json();
          setRecentlyViewed(Array.isArray(data) ? data : []);
        }
        if (appsRes.ok) {
          const data = await appsRes.json();
          setUserApplications(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeCount = listings.filter((l) => l.status === "active").length;

  const handleKycImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setKycDocumentUrl(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !kycDocumentUrl) {
      alert("Please upload a document image.");
      return;
    }
    setKycSubmitting(true);
    try {
      const res = await fetch("/api/user/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id || user._id || "",
        },
        body: JSON.stringify({
          documentType: kycDocType,
          documentUrl: kycDocumentUrl,
          idNumber: kycIdNumber,
        }),
      });
      if (res.ok) {
        if (refreshUser) await refreshUser();
      }
    } catch (error) {
      console.error("KYC submission failed", error);
    } finally {
      setKycSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-8 space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            Dashboard
            {user?.verificationLevel === "verified" && (
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            )}
          </h1>
          <p className="text-stone-500 text-sm md:text-base">
            Welcome back, {user?.name || "Landlord"}
          </p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg">
          {user?.name?.charAt(0) || "L"}
        </div>
      </div>

      {/* KYC Banner */}
      {user?.role === "homeowner" && user?.verificationLevel !== "verified" && (
        <div
          className={`p-5 rounded-3xl border shadow-sm ${user?.verificationLevel === "pending" ? "bg-amber-50 border-amber-200" : "bg-white border-stone-200"}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl shrink-0 ${user?.verificationLevel === "pending" ? "bg-amber-100 text-amber-600" : "bg-red-50 text-red-600"}`}
            >
              {user?.verificationLevel === "pending" ? (
                <Clock className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-stone-900">
                {user?.verificationLevel === "pending"
                  ? "Verification Pending"
                  : "Verify Your Identity"}
              </h3>
              <p className="text-stone-600 text-sm mt-1 mb-4">
                {user?.verificationLevel === "pending"
                  ? "Your KYC documents are currently being reviewed by our team. This usually takes 24-48 hours."
                  : 'To build trust with renters and get a "Verified" badge on your listings, please complete your KYC verification.'}
              </p>

              {user?.verificationLevel === "unverified" ||
              user?.verificationLevel === "rejected" ? (
                <form
                  onSubmit={handleKycSubmit}
                  className="space-y-4 max-w-md bg-stone-50 p-4 rounded-2xl border border-stone-200"
                >
                  {user?.verificationLevel === "rejected" && (
                    <p className="text-xs text-red-600 font-medium">
                      Your previous submission was rejected. Please try again
                      with clearer documents.
                    </p>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                      Document Type
                    </label>
                    <select
                      value={kycDocType}
                      onChange={(e) => setKycDocType(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Citizenship">Citizenship</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                      ID Number
                    </label>
                    <input
                      required
                      type="text"
                      value={kycIdNumber}
                      onChange={(e) => setKycIdNumber(e.target.value)}
                      placeholder="e.g., 12-34-56"
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                      Upload Document Image
                    </label>
                    <label className="w-full bg-white border border-stone-200 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-stone-500 cursor-pointer hover:bg-stone-50 transition-colors">
                      {kycDocumentUrl ? (
                        <div className="relative w-full h-32">
                          <img src={kycDocumentUrl} alt="KYC Document" className="w-full h-full object-contain rounded-lg" />
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 mb-2 text-stone-400" />
                          <span className="text-xs">Click to upload image</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleKycImageUpload} />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={kycSubmitting}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-2.5 rounded-xl transition-colors text-sm disabled:bg-stone-400"
                  >
                    {kycSubmitting
                      ? "Submitting..."
                      : "Submit for Verification"}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {user?.role === "homeowner" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Home className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Active
              </span>
            </div>
            <div className="text-2xl font-bold text-stone-900">
              {stats?.activeListings || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Views
              </span>
            </div>
            <div className="text-2xl font-bold text-stone-900">
              {stats?.totalViews || 0}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Inquiries
              </span>
            </div>
            <div className="text-2xl font-bold text-stone-900">
              {stats?.totalInquiries || 0}
            </div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Earnings
              </span>
            </div>
            <div className="text-xl font-bold text-emerald-900">Rs. 24k</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Pending
              </span>
            </div>
            <div className="text-2xl font-bold text-stone-900">
              {userApplications.filter(a => a.status === 'pending').length}
            </div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Accepted
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-900">
              {userApplications.filter(a => a.status === 'accepted').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 text-stone-500 mb-2">
              <PlusCircle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Total Apps
              </span>
            </div>
            <div className="text-2xl font-bold text-stone-900">
              {userApplications.length}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {user?.role === "homeowner" && (
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            Views This Week
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#78716c", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f5f5f4" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Listings */}
      {user?.role === "homeowner" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900">Your Listings</h2>
            <Link
              to="/add-listing"
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              Add New
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white p-3 rounded-2xl border border-stone-100 flex gap-3"
                >
                  <div className="w-20 h-20 bg-stone-200 rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                    <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : listings.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-stone-200 border-dashed">
                <p className="text-stone-500 text-sm">
                  You haven't added any listings yet.
                </p>
              </div>
            ) : (
              listings.map((listing) => (
                <Link
                  key={listing.id || listing._id}
                  to={`/listing/${listing.id || listing._id}`}
                  className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex gap-3 hover:border-emerald-200 transition-colors"
                >
                  <img
                    src={
                      listing.images?.[0]?.url ||
                      listing.images?.[0] ||
                      "https://picsum.photos/seed/room/200/200"
                    }
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded-xl shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-sm truncate">
                        {listing.title}
                      </h3>
                      <p className="text-stone-500 text-xs truncate">
                        {listing.area}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-emerald-600 text-sm">
                        Rs. {listing.price.toLocaleString()}
                      </span>
                      {listing.status === "active" && (
                        <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                          Active
                        </span>
                      )}
                      {listing.status === "pending" && (
                        <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {listing.status === "rejected" && (
                        <span className="text-[10px] font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded-md">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-stone-900 mb-4">Recently Viewed</h2>
          <div className="space-y-3">
            {recentlyViewed.map((listing) => (
              <Link
                key={listing.id || listing._id}
                to={`/listing/${listing.id || listing._id}`}
                className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex gap-3 hover:border-emerald-200 transition-colors"
              >
                <img
                  src={
                    listing.images?.[0]?.url ||
                    listing.images?.[0] ||
                    "https://picsum.photos/seed/room/200/200"
                  }
                  alt={listing.title}
                  className="w-20 h-20 object-cover rounded-xl shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-900 text-sm truncate">
                      {listing.title}
                    </h3>
                    <p className="text-stone-500 text-xs truncate">
                      {listing.area}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-emerald-600 text-sm">
                      Rs. {listing.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Settings Links */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <Link 
          to="/applications"
          className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-stone-700">
            <Clock className="w-5 h-5" />
            <span className="font-medium text-sm">
              {user?.role === "homeowner" ? "Tenant Applications" : "My Applications"}
            </span>
          </div>
        </Link>
        {user?.role === "homeowner" ? (
          <>
            <Link 
              to="/tenant-management"
              className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 text-stone-700">
                <Users className="w-5 h-5" />
                <span className="font-medium text-sm">Manage Tenants</span>
              </div>
            </Link>
            <Link 
              to="/maintenance"
              className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 text-stone-700">
                <Wrench className="w-5 h-5" />
                <span className="font-medium text-sm">Maintenance Requests</span>
              </div>
            </Link>
          </>
        ) : (
          <Link 
            to="/my-maintenance"
            className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-stone-700">
              <Wrench className="w-5 h-5" />
              <span className="font-medium text-sm">My Maintenance Requests</span>
            </div>
          </Link>
        )}
        <button className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left">
          <div className="flex items-center gap-3 text-stone-700">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Account Settings</span>
          </div>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-red-600">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );
}
