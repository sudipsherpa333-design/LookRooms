import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Droplets,
  Zap,
  Sun,
  X,
  Heart,
  Info,
  Filter,
  SlidersHorizontal,
  Check,
  ShieldCheck,
  Map as MapIcon,
  LayoutList,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useAuth } from "../context/AuthContext";
import ListingMap from "../components/ListingMap";
import { Skeleton } from "../components/Skeleton";

const SwipeCard = ({ listing, onSwipeLeft, onSwipeRight, isFront }: any) => {
  const [isSaving, setIsSaving] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-300, -250, 0, 250, 300], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  // Like/Nope overlays
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);
  const likeScale = useTransform(x, [0, 100], [0.5, 1.2]);
  const nopeScale = useTransform(x, [0, -100], [0.5, 1.2]);

  const handleDragEnd = async (event: any, info: any) => {
    if (info.offset.x > 120) {
      setIsSaving(true);
      await onSwipeRight(listing.id || listing._id);
      setIsSaving(false);
    } else if (info.offset.x < -120) {
      onSwipeLeft(listing.id || listing._id);
    }
  };

  const handleRightClick = async (e: any) => {
    e.stopPropagation();
    setIsSaving(true);
    await onSwipeRight(listing.id || listing._id);
    setIsSaving(false);
  };

  return (
    <motion.div
      className="absolute w-full h-full rounded-[2.5rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-stone-100 origin-bottom cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity, scale, zIndex: isFront ? 10 : 0 }}
      drag={isFront && !isSaving ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={{ 
        scale: isFront ? 1 : 0.92, 
        y: isFront ? 0 : 30,
        rotate: isFront ? 0 : (listing.price % 2 === 0 ? 2 : -2)
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="relative w-full h-full">
        <img
          src={
            listing.images?.[0]?.url ||
            listing.images?.[0] ||
            "https://picsum.photos/seed/room/600/800"
          }
          alt={listing.title}
          className="w-full h-full object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* Overlays */}
        <motion.div
          style={{ opacity: likeOpacity, scale: likeScale }}
          className="absolute top-12 left-10 border-4 border-emerald-500 text-emerald-500 font-black text-5xl px-6 py-2 rounded-2xl rotate-[-15deg] pointer-events-none z-20 bg-white/10 backdrop-blur-sm"
        >
          LIKE
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity, scale: nopeScale }}
          className="absolute top-12 right-10 border-4 border-red-500 text-red-500 font-black text-5xl px-6 py-2 rounded-2xl rotate-[15deg] pointer-events-none z-20 bg-white/10 backdrop-blur-sm"
        >
          NOPE
        </motion.div>

        {/* Info Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 text-white z-10">
          <div className="flex justify-between items-end gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {listing.roomType || listing.propertyType || "Room"}
                </span>
                {listing.landlordVerificationLevel === "verified" && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Verified</span>
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold leading-tight mb-2 truncate">
                {listing.title}
              </h2>
              <div className="flex items-center gap-1.5 text-stone-300 text-sm font-medium">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="truncate">
                  {listing.area}, {listing.city}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-white">
                <span className="text-sm font-medium text-stone-400 mr-1">Rs.</span>
                {listing.price.toLocaleString()}
              </div>
              <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Monthly</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold">{listing.waterSource}</span>
            </div>
            {listing.hasInverter && (
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold">Backup</span>
              </div>
            )}
            {(listing.roomDetails?.furnishing || listing.furnishing) && (
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-xs font-semibold">{listing.roomDetails?.furnishing || listing.furnishing}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Overlay (Hidden during drag) */}
      <motion.div 
        style={{ opacity: useTransform(x, [-50, 0, 50], [0, 1, 0]) }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onSwipeLeft(listing.id || listing._id); }}
          disabled={isSaving}
          className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-xl group disabled:opacity-50"
        >
          <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
        <Link
          to={`/listing/${listing.id || listing._id}`}
          onClick={(e) => e.stopPropagation()}
          className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-stone-900 transition-all duration-300 shadow-xl"
        >
          <Info className="w-5 h-5" />
        </Link>
        <button
          onClick={handleRightClick}
          disabled={isSaving}
          className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-xl group disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Heart className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" />
          )}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function Home() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    area: "",
    minPrice: "",
    maxPrice: "",
    roomType: "",
    waterSource: "",
    hasInverter: false,
    sunExposure: "",
    genderPreference: "",
    foodPreference: "",
    numberOfRooms: "",
    amenities: [] as string[],
    searchPolygon: null as [number, number][] | null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"swipe" | "map">("swipe");
  const [localListings, setLocalListings] = useState<any[]>([]);

  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ["listings", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (key === "amenities") {
          if ((value as string[]).length > 0) {
            queryParams.append(key, (value as string[]).join(","));
          }
        } else if (key === "searchPolygon") {
          if (value) {
            queryParams.append(key, JSON.stringify(value));
          }
        } else if (value) {
          queryParams.append(key, value.toString());
        }
      });

      const res = await fetch(`/api/search/advanced?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      return data.listings || [];
    },
  });

  // Sync local state for swipe interactions
  // In a real app, we would use optimistic updates with react-query
  // For now, update local state when listings change
  useEffect(() => {
    setLocalListings(listings);
  }, [listings]);

  const handleSwipeLeft = (id: string) => {
    setLocalListings((prev) => prev.filter((l) => (l.id || l._id) !== id));
  };

  const handleSwipeRight = async (id: string) => {
    if (user) {
      try {
        await fetch(`/api/user/favorites/${id}`, {
          method: "POST",
          headers: { "x-user-id": user.id || user._id || "" },
        });
      } catch (error) {
        console.error("Failed to save favorite:", error);
      }
    }
    setLocalListings((prev) => prev.filter((l) => (l.id || l._id) !== id));
  };

  const clearFilters = () => {
    setFilters({
      area: "",
      minPrice: "",
      maxPrice: "",
      roomType: "",
      waterSource: "",
      hasInverter: false,
      sunExposure: "",
      genderPreference: "",
      foodPreference: "",
      numberOfRooms: "",
      amenities: [],
      searchPolygon: null,
    });
  };

  return (
    <div className="h-full max-w-md mx-auto relative flex flex-col px-4 py-6 bg-stone-50/50">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-50/50 to-transparent -z-10" />
      
      {/* Header / Filter Toggle */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tighter uppercase">
            Explore
          </h1>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            Curated for your lifestyle
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "swipe" ? "map" : "swipe")}
            className="w-12 h-12 bg-white shadow-xl shadow-stone-200/50 text-stone-600 rounded-2xl flex items-center justify-center hover:bg-stone-50 transition-all active:scale-95 border border-stone-100"
            title={viewMode === "swipe" ? "Switch to Map View" : "Switch to Swipe View"}
          >
            {viewMode === "swipe" ? <MapIcon className="w-5 h-5" /> : <LayoutList className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className={`w-12 h-12 shadow-xl rounded-2xl flex items-center justify-center transition-all active:scale-95 relative border ${Object.values(filters).some((v) => v !== "" && v !== false) ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30" : "bg-white text-stone-600 border-stone-100 shadow-stone-200/50 hover:bg-stone-50"}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {Object.values(filters).some((v) => v !== "" && v !== false) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Full Screen Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col md:max-w-md md:mx-auto md:h-[850px] md:top-1/2 md:-translate-y-1/2 md:rounded-[40px] md:shadow-2xl md:border-8 md:border-stone-800"
          >
            <div className="flex justify-between items-center p-4 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
              {/* Location & Price */}
              <div className="space-y-4">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" /> Location &
                  Price
                </h3>
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Area / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Baneshwor, TU Gate"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={filters.area}
                    onChange={(e) =>
                      setFilters({ ...filters, area: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="Rs."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="Rs."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Room Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-600" /> KTM
                  Essentials
                </h3>
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Room Type
                  </label>
                  <select
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={filters.roomType}
                    onChange={(e) =>
                      setFilters({ ...filters, roomType: e.target.value })
                    }
                  >
                    <option value="">Any Type</option>
                    <option value="Single">Single Room</option>
                    <option value="Double">Double Room</option>
                    <option value="Studio">Studio Apartment</option>
                    <option value="Flat">Full Flat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Any"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={filters.numberOfRooms}
                    onChange={(e) =>
                      setFilters({ ...filters, numberOfRooms: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Water Source
                  </label>
                  <select
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={filters.waterSource}
                    onChange={(e) =>
                      setFilters({ ...filters, waterSource: e.target.value })
                    }
                  >
                    <option value="">Any Source</option>
                    <option value="Melamchi">Melamchi</option>
                    <option value="Boring">Boring/Well</option>
                    <option value="Tanker">Tanker</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div>
                    <div className="font-medium text-sm text-stone-900">
                      Backup Power
                    </div>
                    <div className="text-xs text-stone-500">
                      Inverter or Generator
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        hasInverter: !filters.hasInverter,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${filters.hasInverter ? "bg-emerald-500" : "bg-stone-300"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${filters.hasInverter ? "translate-x-7" : "translate-x-1"}`}
                    />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Sun Exposure
                  </label>
                  <select
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={filters.sunExposure}
                    onChange={(e) =>
                      setFilters({ ...filters, sunExposure: e.target.value })
                    }
                  >
                    <option value="">Any</option>
                    <option value="Morning">Morning Sun</option>
                    <option value="Afternoon">Afternoon Sun</option>
                    <option value="Full Day">Full Day</option>
                  </select>
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" /> Amenities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {['waterTank', 'waterFilter', 'guard', 'cctv', 'parking'].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        checked={filters.amenities.includes(amenity)}
                        onChange={(e) => {
                          const newAmenities = e.target.checked
                            ? [...filters.amenities, amenity]
                            : filters.amenities.filter((a) => a !== amenity);
                          setFilters({ ...filters, amenities: newAmenities });
                        }}
                      />
                      <span className="capitalize">{amenity.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Rules & Preferences */}
              <div className="space-y-4">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" /> Rules &
                  Preferences
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Gender
                    </label>
                    <select
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={filters.genderPreference}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          genderPreference: e.target.value,
                        })
                      }
                    >
                      <option value="">Any</option>
                      <option value="Male Only">Male Only</option>
                      <option value="Female Only">Female Only</option>
                      <option value="Family Only">Family Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Food
                    </label>
                    <select
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={filters.foodPreference}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          foodPreference: e.target.value,
                        })
                      }
                    >
                      <option value="">Any</option>
                      <option value="Veg Only">Veg Only</option>
                      <option value="Non-Veg Allowed">Non-Veg Allowed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="absolute bottom-0 w-full p-4 bg-white border-t border-stone-100 flex gap-3">
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-emerald-600 text-white rounded-xl font-bold py-3 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack / Map View */}
      <div className="relative flex-1 w-full overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center border border-stone-100">
            <Skeleton className="w-full h-full" />
          </div>
        ) : viewMode === "map" ? (
          <ListingMap 
            listings={listings} 
            onSearchArea={(polygon) => setFilters(prev => ({ ...prev, searchPolygon: polygon }))}
          />
        ) : (
          <div className="h-full flex flex-col gap-4">
            {/* Swipe Cards */}
            <div className="relative flex-1 w-full min-h-[450px]">
              {localListings.length === 0 ? (
                <div className="absolute inset-0 bg-white rounded-[2.5rem] border border-stone-100 shadow-xl flex flex-col items-center justify-center text-center p-10">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 relative">
                    <MapPin className="w-10 h-10 text-emerald-500" />
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-emerald-500 rounded-full"
                    />
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 mb-2 uppercase tracking-tighter">
                    End of the road
                  </h3>
                  <p className="text-stone-400 text-sm font-medium leading-relaxed max-w-[200px]">
                    We've shown you everything in this area. Try expanding your search.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-8 bg-stone-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20 active:scale-95"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {localListings
                    .map((listing, index) => (
                      <SwipeCard
                        key={listing.id || listing._id}
                        listing={listing}
                        isFront={index === 0}
                        onSwipeLeft={handleSwipeLeft}
                        onSwipeRight={handleSwipeRight}
                      />
                    ))
                    .reverse()}
                </AnimatePresence>
              )}
            </div>

            {/* Horizontal Scrollable Listings */}
            <div className="w-full shrink-0 mt-auto pt-8">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Recently Added</h3>
                <Link to="/listings" className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">View All</Link>
              </div>
              <div className="flex gap-4 px-2 pb-6 overflow-x-auto scrollbar-hide snap-x">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-48 shrink-0 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden snap-start">
                      <Skeleton className="h-28 w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  listings.map((listing) => (
                    <Link
                      key={listing.id || listing._id}
                      to={`/listing/${listing.id || listing._id}`}
                      className="w-48 shrink-0 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 snap-start"
                    >
                      <div className="relative h-28">
                        <img
                          src={listing.images?.[0]?.url || "https://picsum.photos/seed/room/300/200"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Rs. {listing.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-xs text-stone-900 truncate mb-1">{listing.title}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          <span className="truncate">{listing.area}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
