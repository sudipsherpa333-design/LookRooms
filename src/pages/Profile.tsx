import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, ShieldCheck, ShieldAlert, Edit2, Save, X, Clock, UploadCloud } from "lucide-react";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bio: "",
    whatsappNumber: "",
    renterPreferences: {
      budget: 0,
      preferredAreas: "",
      moveInDate: "",
    },
    roommatePreferences: {
      gender: "",
      occupation: "",
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        email: (user as any).email || "",
        bio: (user as any).bio || "",
        whatsappNumber: (user as any).homeownerProfile?.whatsappNumber || "",
        renterPreferences: {
          budget: (user as any).renterProfile?.preferences?.budgetAmount || 0,
          preferredAreas: (user as any).renterProfile?.preferences?.preferredAreas?.join(", ") || "",
          moveInDate: (user as any).renterProfile?.preferences?.moveInDate ? new Date((user as any).renterProfile.preferences.moveInDate).toISOString().split('T')[0] : "",
        },
        roommatePreferences: {
          gender: (user as any).renterProfile?.roommatePreferences?.genderPreference || "",
          occupation: (user as any).renterProfile?.roommatePreferences?.occupationPreference?.[0] || "",
        },
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        homeownerProfile: {
          whatsappNumber: formData.whatsappNumber
        },
        renterProfile: {
          preferences: {
            budgetAmount: formData.renterPreferences.budget,
            preferredAreas: formData.renterPreferences.preferredAreas.split(",").map(a => a.trim()).filter(a => a),
            moveInDate: formData.renterPreferences.moveInDate,
          },
          roommatePreferences: {
            genderPreference: formData.roommatePreferences.gender,
            occupationPreference: [formData.roommatePreferences.occupation],
          }
        }
      };
      const res = await fetch(`/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || user?._id || "",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await refreshUser();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">My Profile</h1>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">{user.name}</h2>
                  <p className="text-stone-500 capitalize">{user.role}</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-stone-900 font-medium">
                      <User className="w-4 h-4 text-stone-400" /> {user.name}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-stone-900 font-medium">
                      <Phone className="w-4 h-4 text-stone-400" /> {user.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Add your email"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-stone-900 font-medium">
                      <Mail className="w-4 h-4 text-stone-400" /> {formData.email || "Not provided"}
                    </div>
                  )}
                </div>

                {user.role === 'homeowner' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">WhatsApp Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. 9800000000"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-stone-900 font-medium">
                        <Phone className="w-4 h-4 text-stone-400" /> {formData.whatsappNumber || "Not provided"}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Verification Status</label>
                  <div className="flex items-center gap-2">
                    {user.verificationLevel === "verified" ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-md text-sm">
                        <ShieldCheck className="w-4 h-4" /> Verified
                      </span>
                    ) : user.verificationLevel === "pending" ? (
                      <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md text-sm">
                        <Clock className="w-4 h-4" /> Pending Review
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-stone-600 font-medium bg-stone-100 px-2 py-1 rounded-md text-sm">
                        <ShieldAlert className="w-4 h-4" /> Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Bio / About</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px]"
                    placeholder="Tell us a bit about yourself..."
                  />
                ) : (
                  <p className="text-stone-700 leading-relaxed">
                    {formData.bio || "No bio provided yet."}
                  </p>
                )}
              </div>

              {/* Renter Preferences */}
              <div className="pt-6 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Renter Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Monthly Budget (Rs.)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={formData.renterPreferences.budget}
                        onChange={(e) => setFormData({ ...formData, renterPreferences: { ...formData.renterPreferences, budget: parseInt(e.target.value) } })}
                        className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    ) : (
                      <div className="text-stone-900 font-medium">Rs. {formData.renterPreferences.budget || "Not set"}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Preferred Areas</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.renterPreferences.preferredAreas}
                        onChange={(e) => setFormData({ ...formData, renterPreferences: { ...formData.renterPreferences, preferredAreas: e.target.value } })}
                        className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. Koteshwor, Baneshwor"
                      />
                    ) : (
                      <div className="text-stone-900 font-medium">{formData.renterPreferences.preferredAreas || "Anywhere"}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Preferred Move-in Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.renterPreferences.moveInDate}
                        onChange={(e) => setFormData({ ...formData, renterPreferences: { ...formData.renterPreferences, moveInDate: e.target.value } })}
                        className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    ) : (
                      <div className="text-stone-900 font-medium">{formData.renterPreferences.moveInDate || "Flexible"}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Roommate Preferences */}
              <div className="pt-6 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Roommate Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Gender Preference</label>
                    {isEditing ? (
                      <select
                        value={formData.roommatePreferences.gender}
                        onChange={(e) => setFormData({ ...formData, roommatePreferences: { ...formData.roommatePreferences, gender: e.target.value } })}
                        className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">No Preference</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <div className="text-stone-900 font-medium">{formData.roommatePreferences.gender || "No Preference"}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Occupation Preference</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.roommatePreferences.occupation}
                        onChange={(e) => setFormData({ ...formData, roommatePreferences: { ...formData.roommatePreferences, occupation: e.target.value } })}
                        className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. Student, Professional"
                      />
                    ) : (
                      <div className="text-stone-900 font-medium">{formData.roommatePreferences.occupation || "Any"}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* KYC Verification */}
              <div className="pt-6 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Identity Verification</h3>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {user.verificationLevel === "verified" ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-stone-400" />
                      )}
                      <span className="font-bold text-stone-900">
                        {user.verificationLevel === "verified" ? "Verified Profile" : "Unverified Profile"}
                      </span>
                    </div>
                    {user.verificationLevel === "unverified" && (
                      <button 
                        onClick={() => window.location.href = '/dashboard'} // Redirect to dashboard where KYC form is
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Complete KYC
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mb-4">
                    Verified profiles build more trust and get faster responses from homeowners.
                  </p>
                  {user.verificationLevel === "pending" && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Your documents are under review.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Registration */}
              {user.role !== 'agent' && (
                <div className="pt-6 border-t border-stone-100">
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-indigo-900">Are you a professional room broker?</h3>
                      <p className="text-sm text-indigo-700 mt-1">
                        Join LookRooms as an Agent to manage multiple properties, set your own fees, and get a dedicated CRM dashboard.
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/agent/register'}
                      className="whitespace-nowrap px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Become an Agent
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
