import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function SavedListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/user/favorites", {
          headers: { "x-user-id": user.id || user._id || "" },
        });
        if (res.ok) {
          const data = await res.json();
          setListings(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto pb-8 space-y-6 p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mb-1 md:mb-2">
          Saved Rooms
        </h1>
        <p className="text-stone-500 text-sm md:text-base">
          Rooms you've swiped right on.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white p-3 rounded-3xl border border-stone-100 flex gap-4 md:flex-col md:p-4"
            >
              <div className="w-24 h-24 md:w-full md:h-48 bg-stone-200 rounded-2xl shrink-0"></div>
              <div className="flex-1 space-y-2 py-2">
                <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                <div className="h-3 bg-stone-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : listings.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-stone-200 border-dashed">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              No saved rooms
            </h3>
            <p className="text-stone-500 text-sm">
              Swipe right on rooms you like to save them here.
            </p>
          </div>
        ) : (
          listings.map((listing) => (
            <Link
              key={listing.id || listing._id}
              to={`/listing/${listing.id || listing._id}`}
              className="block bg-white p-3 md:p-4 rounded-3xl border border-stone-200 shadow-sm flex gap-4 md:flex-col hover:border-emerald-200 transition-colors relative group"
            >
              <img
                src={
                  listing.images?.[0]?.url ||
                  listing.images?.[0] ||
                  "https://picsum.photos/seed/room/200/200"
                }
                alt={listing.title}
                className="w-24 h-24 md:w-full md:h-48 object-cover rounded-2xl shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm md:text-base line-clamp-2 leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1 text-stone-500 text-xs md:text-sm mb-2">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate">{listing.area}</span>
                  </div>
                </div>
                <div className="font-bold text-emerald-600 text-sm md:text-lg">
                  Rs. {listing.price.toLocaleString()}
                </div>
              </div>
              <button className="absolute top-3 right-3 md:top-6 md:right-6 p-2 bg-white/80 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors">
                <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              </button>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
