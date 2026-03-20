import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  MapPin,
  Droplets,
  Zap,
  Sun,
  ShieldCheck,
  User,
  Phone,
  ArrowLeft,
  CheckCircle2,
  FileText,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  CreditCard,
  Clock,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/ui/Modal";
import PaymentGatewaySelector from "../components/Payment/PaymentGatewaySelector";
import { ServiceFeePreviewCard } from "../components/Booking/ServiceFeePreviewCard";
import ApplicationModal from "../components/Booking/ApplicationModal";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await axiosInstance.get(`/listings/${id}`);
        setListing(data);
        
        // Log view
        if (user) {
          axiosInstance.post("/user/viewed", { listingId: id }, {
            headers: {
              "x-user-id": user.id || user._id || "",
            }
          }).catch(console.error);
        }
      } catch (error) {
        console.error("Failed to fetch listing:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const checkApplicationStatus = async () => {
      if (!user) return;
      try {
        const { data } = await axiosInstance.get(`/user/applications/${id}/check`, {
          headers: {
            "x-user-id": user.id || user._id || "",
          }
        });
        setApplied(data.applied);
      } catch (error) {
        console.error("Failed to check application status:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const { data } = await axiosInstance.get(`/reviews/listing/${id}`);
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    fetchListing();
    checkApplicationStatus();
    fetchReviews();
  }, [id, user]);

  const handleInitiatePayment = async (gateway: 'esewa' | 'khalti') => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!moveInDate) {
      alert("Please select a move-in date first.");
      return;
    }

    setInitiatingPayment(true);
    try {
      // 1. Create Booking Request first (locks listing and gets feePaymentId)
      const { data: bookingData } = await axiosInstance.post("/booking-requests", {
        listingId: id,
        moveInDate,
        stayDuration: "6 months", // Default or from state
        occupants: 1, // Default or from state
        idempotencyKey: `book_${id}_${user.id || user._id}_${Date.now()}`,
      });

      const { feePaymentId } = bookingData;

      // 2. Initiate Payment with the feePaymentId
      const { data } = await axiosInstance.post("/payment/initiate", {
        feePaymentId,
        paymentMethod: gateway,
      });
      
      if (gateway === 'khalti') {
        window.location.href = data.payment_url;
      } else if (gateway === 'esewa') {
        // Create a form and submit it
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;
        
        Object.entries(data.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      }
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      alert(error.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setInitiatingPayment(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
  };

  const handleWhatsApp = async () => {
    const whatsappNumber = listing?.whatsappNumber || listing?.homeowner?.homeownerProfile?.whatsappNumber || listing?.homeowner?.phone;
    if (whatsappNumber) {
      const message = `Hello, I saw your room on KRF.\n\nRoom: ${listing.title}\nLocation: ${listing.location?.area || listing.area}, ${listing.location?.city || listing.city}\nPrice: Rs.${listing.price}/month\n\nI am interested in this room. Is it still available?`;
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      
      // Log contact
      try {
        await axiosInstance.post("/user/contact-log", {
          ownerId: listing.homeowner?._id || listing.homeowner || listing.landlordId,
          listingId: listing._id || listing.id,
          contactMethod: "whatsapp",
        }, {
          headers: {
            "x-user-id": user?.id || user?._id || "",
          }
        });
      } catch (e) {
        console.error("Failed to log contact", e);
      }

      window.open(whatsappUrl, '_blank');
    } else {
      alert("WhatsApp number not available.");
    }
  };

  const handleInAppChat = async () => {
    if (!user) return;
    setMessaging(true);
    try {
      const participantId = listing.homeowner?._id || listing.homeowner || listing.landlordId;
      const { data: chat } = await axiosInstance.post(`/conversations`, {
        seekerId: user.id || user._id,
        ownerId: participantId,
        roomId: listing._id
      }, {
        headers: {
          "x-user-id": user.id || user._id || "",
        }
      });
      navigate(`/chat?id=${chat._id}&shareListing=${listing._id}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 p-4 md:p-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="w-24 h-8 bg-stone-200 rounded-full"></div>
          <div className="w-24 h-8 bg-stone-200 rounded-full"></div>
        </div>
        <div className="h-[300px] md:h-[500px] bg-stone-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="h-10 bg-stone-200 rounded w-3/4"></div>
              <div className="h-6 bg-stone-200 rounded w-1/2"></div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 h-10 bg-stone-200 rounded-xl"></div>
              <div className="w-24 h-10 bg-stone-200 rounded-xl"></div>
              <div className="w-24 h-10 bg-stone-200 rounded-xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-stone-200 rounded w-1/4"></div>
              <div className="h-24 bg-stone-200 rounded w-full"></div>
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="h-64 bg-stone-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20 text-stone-500">Listing not found.</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20 p-4 md:p-8"
    >
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-stone-500 hover:text-emerald-600 font-medium transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: listing.title,
                text: `Check out this room on KRF: ${listing.title}`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }
          }}
          className="inline-flex items-center text-stone-500 hover:text-emerald-600 font-medium transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </button>
      </div>

      {/* Image Gallery */}
      <div className="h-[300px] md:h-[500px] rounded-3xl overflow-hidden bg-stone-200 relative shadow-sm">
        <motion.img
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={
            listing.images?.[currentImage]?.url ||
            listing.images?.[currentImage] ||
            "https://picsum.photos/seed/room1/1200/800"
          }
          alt="Room view"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {listing.images?.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage((prev) => (prev - 1 + listing.images.length) % listing.images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev + 1) % listing.images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
          {currentImage + 1} / {listing.images?.length || 1}
        </div>
      </div>

      {/* Video Player */}
      {listing.videos && listing.videos.length > 0 && (
        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-stone-900">
              Walkthrough Videos
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">
              {listing.videos.length} Video{listing.videos.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {listing.videos.map((video: any, idx: number) => (
              <div key={idx} className="space-y-3">
                {video.title && (
                  <h3 className="text-sm font-bold text-stone-700">{video.title}</h3>
                )}
                <div className="rounded-2xl overflow-hidden bg-black aspect-video shadow-lg ring-1 ring-stone-200">
                  <video
                    src={video.url}
                    poster={video.thumbnail}
                    controls
                    className="w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6 bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-stone-100">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm md:text-base">
                <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                <span>
                  {listing.location?.area || listing.area}, {listing.location?.city || listing.city}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  listing.location?.coordinates?.lat && listing.location?.coordinates?.lng
                    ? `${listing.location.coordinates.lat},${listing.location.coordinates.lng}`
                    : `${listing.location?.address || listing.address}, ${listing.location?.area || listing.area}, ${listing.location?.city || listing.city}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition-colors"
              >
                View on Map
              </a>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-stone-900 mb-2 md:mb-4 leading-tight">
              {listing.title}
            </h1>
            <p className="text-stone-500 text-sm md:text-base">
              {listing.location?.address || listing.address}
            </p>
          </div>

          <div className="flex items-center justify-between py-4 border-y border-stone-100">
            <div>
              <span className="text-2xl md:text-3xl font-bold text-emerald-600">
                Rs. {listing.price.toLocaleString()}
              </span>
              <span className="text-stone-500 text-sm md:text-base"> / mo</span>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-semibold">
              {listing.roomType || listing.propertyType}
            </div>
          </div>

          {listing.status === "occupied" && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
              <X className="w-6 h-6" />
              <div>
                <p className="font-bold">This listing is occupied</p>
                <p className="text-sm opacity-80">A tenant has already booked this room and confirmed payment.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-stone-50 p-3 md:p-4 rounded-2xl flex flex-col gap-1 border border-stone-100">
              <span className="text-stone-500 text-xs font-medium uppercase tracking-wider">
                Water
              </span>
              <span className="font-semibold text-stone-900 flex items-center gap-1.5 text-sm md:text-base">
                <Droplets className="w-4 h-4 text-blue-500" />
                {listing.waterSource}
              </span>
            </div>
            <div className="bg-stone-50 p-3 md:p-4 rounded-2xl flex flex-col gap-1 border border-stone-100">
              <span className="text-stone-500 text-xs font-medium uppercase tracking-wider">
                Power
              </span>
              <span className="font-semibold text-stone-900 flex items-center gap-1.5 text-sm md:text-base">
                <Zap className="w-4 h-4 text-amber-500" />
                {listing.hasInverter ? "Inverter" : "None"}
              </span>
            </div>
            <div className="bg-stone-50 p-3 md:p-4 rounded-2xl flex flex-col gap-1 border border-stone-100">
              <span className="text-stone-500 text-xs font-medium uppercase tracking-wider">
                Sun
              </span>
              <span className="font-semibold text-stone-900 flex items-center gap-1.5 text-sm md:text-base">
                <Sun className="w-4 h-4 text-orange-500" />
                {listing.sunExposure || "N/A"}
              </span>
            </div>
            <div className="bg-stone-50 p-3 md:p-4 rounded-2xl flex flex-col gap-1 border border-stone-100">
              <span className="text-stone-500 text-xs font-medium uppercase tracking-wider">
                Gender
              </span>
              <span className="font-semibold text-stone-900 flex items-center gap-1.5 text-sm md:text-base">
                <User className="w-4 h-4 text-purple-500" />
                {listing.genderPreference || "Any"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-100">
            <div>
              <h2 className="text-lg font-bold text-stone-900 mb-3">Property Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Furnishing</span>
                  <span className="font-semibold text-stone-900">{listing.roomDetails?.furnishing || listing.furnishing || "Unfurnished"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Bathroom</span>
                  <span className="font-semibold text-stone-900 capitalize">{listing.roomDetails?.bathroomType || "Common"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Kitchen</span>
                  <span className="font-semibold text-stone-900 capitalize">{listing.roomDetails?.kitchenType === 'attached' ? 'Private' : listing.roomDetails?.kitchenType === 'common' ? 'Shared' : 'No Kitchen'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Floor</span>
                  <span className="font-semibold text-stone-900">{listing.roomDetails?.floor === 0 ? 'Ground' : listing.roomDetails?.floor ? `${listing.roomDetails.floor}${listing.roomDetails.floor === 1 ? 'st' : listing.roomDetails.floor === 2 ? 'nd' : listing.roomDetails.floor === 3 ? 'rd' : 'th'}` : "1st"} Floor</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 mb-3">House Rules</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Food Preference</span>
                  <span className="font-semibold text-stone-900">{listing.rules?.foodPreference || listing.foodPreference || "No Restriction"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Smoking</span>
                  <span className="font-semibold text-stone-900">{listing.rules?.smoking?.allowed || listing.smokingAllowed ? "Allowed" : "Not Allowed"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Pets</span>
                  <span className="font-semibold text-stone-900">{listing.rules?.pets?.allowed || listing.petsAllowed ? "Allowed" : "Not Allowed"}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-2 md:mb-4">
              Description
            </h2>
            <p className="text-stone-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="pt-6 border-t border-stone-100">
            <h2 className="text-lg md:text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Reviews ({listing.reviewCount || 0})
            </h2>
            
            {reviews.length === 0 ? (
              <p className="text-stone-500 text-sm italic">No reviews yet. Be the first to review after staying!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                        {review.reviewerId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{review.reviewerId?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.round(review.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`} 
                            />
                          ))}
                          <span className="text-xs text-stone-500 ml-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">
                L
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Landlord</h3>
                <p className="text-stone-500 text-sm">Joined 2023</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-100 mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h4 className="font-semibold text-sm">Verified Landlord</h4>
                <p className="text-xs text-emerald-700">Identity checked</p>
              </div>
            </div>
            <div className="space-y-3">
              <ServiceFeePreviewCard listingId={id!} />
              <div className="mb-4">
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  When do you want to move in?
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                />
              </div>
              
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={initiatingPayment || listing.status === "occupied" || listing.lockStatus === "locked"}
                className={`w-full font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-xl ${
                  listing.status === "occupied" || listing.lockStatus === "locked"
                    ? "bg-stone-100 text-stone-500 shadow-none cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                }`}
              >
                {listing.status === "occupied" ? (
                  <>
                    <X className="w-5 h-5" />
                    Occupied
                  </>
                ) : listing.lockStatus === "locked" ? (
                  <>
                    <Clock className="w-5 h-5" />
                    Locked for Payment
                  </>
                ) : initiatingPayment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Book Now
                  </>
                )}
              </button>
              
              <div className="grid grid-cols-1 gap-3">
                {applied ? (
                  <div className="w-full bg-emerald-50 text-emerald-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-emerald-100">
                    <CheckCircle2 className="w-5 h-5" />
                    Application Submitted
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    disabled={listing.status === "occupied" || listing.lockStatus === "locked"}
                    className="w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-5 h-5" />
                    Apply Now
                  </button>
                )}

                <button
                  onClick={handleWhatsApp}
                  className="w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp Landlord
                </button>
                
                <button
                  onClick={handleInAppChat}
                  disabled={messaging}
                  className="w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/20 disabled:opacity-50"
                >
                  {messaging ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting Chat...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      In-App Chat
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Secure Booking"
      >
        <PaymentGatewaySelector 
          listingId={id!} 
          onGatewaySelect={handleInitiatePayment} 
        />
      </Modal>

      {showApplyModal && (
        <ApplicationModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          listingId={id || ""}
          listingTitle={listing.title}
          onSuccess={() => setApplied(true)}
        />
      )}
    </motion.div>
  );
}
