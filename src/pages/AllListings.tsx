import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import {
  MapPin,
  Droplets,
  Zap,
  Sun,
  X,
  Heart,
  Filter,
  SlidersHorizontal,
  ShieldCheck,
  ChevronLeft,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "../components/Skeleton";

export default function AllListings() {
  const [filters, setFilters] = useState({
    area: "",
    minPrice: "",
    maxPrice: "",
    roomType: "",
    waterSource: "",
    backupPower: false,
    solarWater: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.area) params.append("area", filters.area);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.roomType) params.append("roomType", filters.roomType);
      if (filters.waterSource) params.append("waterSource", filters.waterSource);
      if (filters.backupPower) params.append("backupPower", "true");
      if (filters.solarWater) params.append("solarWater", "true");

      const response = await axiosInstance.get(`/listings?${params.toString()}`);
      return response.data.listings || response.data;
    },
  });

  const clearFilters = () => {
    setFilters({
      area: "",
      minPrice: "",
      maxPrice: "",
      roomType: "",
      waterSource: "",
      backupPower: false,
      solarWater: false,
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-stone-100 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-stone-900" />
          </Link>
          
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search in LookRooms..."
              className="w-full bg-stone-100 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
            />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="p-2.5 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all relative"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {(filters.minPrice || filters.maxPrice || filters.roomType || filters.waterSource || filters.backupPower || filters.solarWater) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">
            All Listings
            <span className="ml-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {listings.length}
            </span>
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 w-20 rounded-xl" />
                    <Skeleton className="h-8 w-20 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No listings found</h3>
            <p className="text-stone-500 text-sm mb-6">Try adjusting your filters to find more rooms.</p>
            <button
              onClick={clearFilters}
              className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-800 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing: any) => (
              <Link
                key={listing.id || listing._id}
                to={`/listing/${listing.id || listing._id}`}
                className="group bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={listing.images?.[0]?.url || listing.images?.[0] || "https://picsum.photos/seed/room/600/400"}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                    Rs. {listing.price.toLocaleString()}
                  </div>
                  {listing.landlordVerificationLevel === "verified" && (
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">
                    <MapPin className="w-3 h-3" />
                    {listing.area}
                  </div>
                  <h3 className="font-bold text-stone-900 mb-3 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {listing.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> {listing.waterSource || "Water"}
                    </span>
                    {listing.backupPower && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Power
                      </span>
                    )}
                    {listing.solarWater && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Sun className="w-3 h-3" /> Solar
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[3rem] z-50 max-h-[90vh] overflow-y-auto pb-safe"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter">Filters</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"
                  >
                    <X className="w-6 h-6 text-stone-900" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Price Range */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-stone-900 uppercase tracking-widest text-xs">Price Range (Monthly)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Min Price</label>
                        <input
                          type="number"
                          placeholder="Rs. 0"
                          className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Max Price</label>
                        <input
                          type="number"
                          placeholder="Rs. 50k+"
                          className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-stone-900 uppercase tracking-widest text-xs">Room Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {["Single", "Double", "Studio", "Flat"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilters({ ...filters, roomType: filters.roomType === type ? "" : type })}
                          className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                            filters.roomType === type
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-stone-900 uppercase tracking-widest text-xs">Amenities</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setFilters({ ...filters, backupPower: !filters.backupPower })}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          filters.backupPower
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-stone-100 bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${filters.backupPower ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"}`}>
                            <Zap className="w-5 h-5" />
                          </div>
                          <span className={`font-bold text-sm ${filters.backupPower ? "text-emerald-700" : "text-stone-600"}`}>Backup Power</span>
                        </div>
                        {filters.backupPower && <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500" />}
                      </button>

                      <button
                        onClick={() => setFilters({ ...filters, solarWater: !filters.solarWater })}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          filters.solarWater
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-stone-100 bg-stone-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${filters.solarWater ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"}`}>
                            <Sun className="w-5 h-5" />
                          </div>
                          <span className={`font-bold text-sm ${filters.solarWater ? "text-emerald-700" : "text-stone-600"}`}>Solar Water</span>
                        </div>
                        {filters.solarWater && <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={clearFilters}
                      className="flex-1 py-4 bg-stone-100 text-stone-900 rounded-2xl font-bold hover:bg-stone-200 transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-[2] py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                    >
                      Show Results
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
