import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  MapPin,
  Home,
  ShieldCheck,
  List,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  { id: "basic", title: "Basic Info", icon: Home },
  { id: "location", title: "Location", icon: MapPin },
  { id: "amenities", title: "Amenities", icon: List },
  { id: "rules", title: "Rules", icon: ShieldCheck },
  { id: "media", title: "Photos & Video", icon: ImageIcon },
];

export default function AddListing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    whatsappNumber: "",
    roomType: "Single Room",
    description: "",
    city: "Kathmandu",
    area: "",
    address: "",
    waterSource: "Melamchi",
    sunExposure: "Morning",
    furnishing: "Unfurnished",
    bathroomType: "Common",
    kitchenType: "Shared",
    floor: "1st",
    hasInverter: false,
    hasInternet: false,
    hasParking: false,
    genderPreference: "Any",
    foodPreference: "No Restriction",
    smokingAllowed: false,
    petsAllowed: false,
  });

  // Media State
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
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
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setImages((prev) => [...prev, dataUrl]);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Video size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 0) {
      if (user?.role === "user") {
        setError("You must be a homeowner to list a property. Please upgrade your account in your profile first.");
        return;
      }
      if (user?.verificationLevel !== "verified") {
        setError("You must be a verified homeowner to list a property. Please complete KYC verification in your dashboard first.");
        return;
      }
      if (!formData.title || !formData.price || !formData.description) {
        setError("Please fill in all required fields (Title, Price, Description).");
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.city || !formData.area || !formData.address) {
        setError("Please fill in all required location fields (City, Area, Address).");
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to add a listing.");
      return;
    }

    if (user?.role === "user") {
      setError("You must be a homeowner to list a property. Please upgrade your account in your profile first.");
      return;
    }

    if (user?.verificationLevel !== "verified") {
      setError("You must be a verified homeowner to list a property. Please complete KYC verification in your dashboard first.");
      return;
    }

    if (images.length === 0) {
      setError("Please add at least one photo.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      price: parseInt(formData.price, 10),
      roomDetails: {
        furnishing: formData.furnishing,
        bathroomType: formData.bathroomType.toLowerCase(),
        kitchenType: formData.kitchenType === 'Private' ? 'attached' : formData.kitchenType === 'Shared' ? 'common' : 'none',
        floor: formData.floor === 'Ground' ? 0 : parseInt(formData.floor, 10) || 1,
      },
      images: images.map((img, index) => ({
        url: img,
        isPrimary: index === 0,
        order: index,
      })),
      videos: video ? [{ url: video }] : [],
      homeowner: user.id || user._id,
    };

    try {
      const res = await fetch("/api/homeowner/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id || user._id || "",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate(`/dashboard`), 2000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to create listing");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          Listing Submitted!
        </h2>
        <p className="text-stone-500 text-sm">
          It is pending admin approval. Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">
          List your room
        </h1>
        <p className="text-stone-500">
          Reach thousands of renters in Kathmandu with a detailed listing.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 relative">
        <div className="flex justify-between relative z-10">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden md:block ${isActive ? "text-emerald-700" : isCompleted ? "text-stone-600" : "text-stone-400"}`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute top-5 left-0 w-full h-0.5 bg-stone-100 -z-0">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: BASIC INFO */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-4">
                    Basic Details
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Listing Title
                    </label>
                    <input
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g., Spacious Single Room in Baneshwor"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Monthly Rent (Rs.)
                      </label>
                      <input
                        required
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        type="number"
                        min="0"
                        placeholder="e.g., 8000"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Room Type
                      </label>
                      <select
                        required
                        name="roomType"
                        value={formData.roomType}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Single Room">Single Room</option>
                        <option value="Double Room">Double Room</option>
                        <option value="Flat/Apartment">Apartment / Flat</option>
                        <option value="Studio Apartment">Studio Apartment</option>
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      required
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g., 98XXXXXXXX"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Describe the room, neighborhood, and any special features..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-4">
                    Location Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        City
                      </label>
                      <select
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Kathmandu">Kathmandu</option>
                        <option value="Lalitpur">Lalitpur</option>
                        <option value="Bhaktapur">Bhaktapur</option>
                        <option value="Kirtipur">Kirtipur</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Area / Locality
                      </label>
                      <input
                        required
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="e.g., Baneshwor, Patan"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Exact Address / Landmark
                    </label>
                    <input
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g., Near Everest Bank, House No. 42"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Providing an accurate area and landmark helps renters find
                      your property easily. We don't show the exact house number
                      publicly until you approve an application.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: AMENITIES */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-4">
                    Amenities & Facilities
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Water Source
                      </label>
                      <select
                        required
                        name="waterSource"
                        value={formData.waterSource}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Melamchi">Melamchi</option>
                        <option value="Boring">Boring / Well</option>
                        <option value="Tanker">Tanker</option>
                        <option value="Municipal">Municipal</option>
                        <option value="Multiple">Multiple Sources</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Sun Exposure
                      </label>
                      <select
                        required
                        name="sunExposure"
                        value={formData.sunExposure}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Full Day">Full Day</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Furnishing
                      </label>
                      <select
                        required
                        name="furnishing"
                        value={formData.furnishing}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Unfurnished">Unfurnished</option>
                        <option value="Semi Furnished">Semi Furnished</option>
                        <option value="Full Furnished">Full Furnished</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Bathroom Type
                      </label>
                      <select
                        required
                        name="bathroomType"
                        value={formData.bathroomType}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Common">Common</option>
                        <option value="Attached">Attached</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Kitchen Type
                      </label>
                      <select
                        required
                        name="kitchenType"
                        value={formData.kitchenType}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Shared">Shared</option>
                        <option value="Private">Private / Attached</option>
                        <option value="No Kitchen">No Kitchen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Floor
                      </label>
                      <select
                        required
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Ground">Ground Floor</option>
                        <option value="1st">1st Floor</option>
                        <option value="2nd">2nd Floor</option>
                        <option value="3rd">3rd Floor</option>
                        <option value="4th+">4th Floor or Above</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-stone-100">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Additional Features
                    </label>

                    <label className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        name="hasInverter"
                        checked={formData.hasInverter}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-stone-800">
                        Inverter / Backup Power
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        name="hasInternet"
                        checked={formData.hasInternet}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-stone-800">
                        Internet / Wi-Fi Available
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        name="hasParking"
                        checked={formData.hasParking}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-stone-800">
                        Parking Space (Bike/Car)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 4: RULES */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-4">
                    House Rules
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Gender Preference
                      </label>
                      <select
                        name="genderPreference"
                        value={formData.genderPreference}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="Any">Any</option>
                        <option value="Male Only">Male Only</option>
                        <option value="Female Only">Female Only</option>
                        <option value="Family Only">Family Only</option>
                        <option value="Couple Friendly">Couple Friendly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Food Preference
                      </label>
                      <select
                        name="foodPreference"
                        value={formData.foodPreference}
                        onChange={handleInputChange}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                      >
                        <option value="No Restriction">No Restriction</option>
                        <option value="Veg Only">Veg Only</option>
                        <option value="Non-Veg Allowed">Non-Veg Allowed</option>
                        <option value="Eggetarian Only">Eggetarian Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-stone-100">
                    <label className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        name="smokingAllowed"
                        checked={formData.smokingAllowed}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-stone-800">
                        Smoking Allowed
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        name="petsAllowed"
                        checked={formData.petsAllowed}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-stone-800">
                        Pets Allowed
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 5: MEDIA */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-4">
                    Photos & Video
                  </h2>

                  {/* Photos */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-sm font-semibold text-stone-700">
                        Room Photos *
                      </label>
                      <span className="text-xs text-stone-500">
                        {images.length} added
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group"
                        >
                          <img
                            src={img}
                            alt={`Upload ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-500 hover:bg-stone-50 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                      >
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Add Photo</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </div>

                  {/* Video */}
                  <div className="pt-6 border-t border-stone-100">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Room Video (Optional)
                    </label>

                    {video ? (
                      <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-black aspect-video">
                        <video
                          src={video}
                          controls
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full py-8 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-500 hover:bg-stone-50 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                      >
                        <Video className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">
                          Upload a short walkthrough video
                        </span>
                        <span className="text-xs text-stone-400 mt-1">
                          Max 50MB (MP4, WebM)
                        </span>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={handleVideoUpload}
                      accept="video/*"
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 rounded-xl font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div></div> // Empty div for spacing
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Publish Listing
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
