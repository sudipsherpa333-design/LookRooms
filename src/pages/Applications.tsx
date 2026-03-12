import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Clock, CheckCircle2, XCircle, Calendar, CreditCard, Wallet, User, ShieldCheck, X, File, MapPin, MessageSquare, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { ReviewModal } from "../components/ReviewModal";

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      try {
        const endpoint =
          user.role === "homeowner"
            ? "/api/homeowner/applications"
            : "/api/user/applications";
        const res = await fetch(endpoint, {
          headers: { "x-user-id": user.id || user._id || "" },
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user]);

  const handleStatusUpdate = async (
    id: string,
    status: "accept" | "reject",
  ) => {
    try {
      await fetch(`/api/homeowner/applications/${id}/${status}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || user?._id || "",
        },
        body: JSON.stringify({ reason: "Homeowner decision" }),
      });
      // Refresh
      setApplications((prev) =>
        prev.map((app) =>
          app._id === id
            ? { ...app, status: status === "accept" ? "accepted" : "rejected" }
            : app,
        ),
      );
    } catch (error) {
      console.error("Failed to update application status:", error);
    }
  };

  const handleStartChat = async (applicantId: string, listingId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id || user._id || "",
        },
        body: JSON.stringify({
          seekerId: applicantId,
          ownerId: user.id || user._id,
          roomId: listingId
        })
      });
      if (res.ok) {
        const chat = await res.json();
        navigate(`/chat?id=${chat._id}&shareListing=${listingId}`);
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  const initiatePayment = async (app: any) => {
    setSelectedApp(app);
    try {
      const res = await fetch(`/api/payments/esewa/initiate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user?.id || user?._id || "" 
        },
        body: JSON.stringify({ applicationId: app._id })
      });
      if (res.ok) {
        const formData = await res.json();
        
        // Create and submit form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; // Sandbox URL

        const fields = {
          amount: formData.amount,
          tax_amount: 0,
          total_amount: formData.total_amount,
          transaction_uuid: formData.transaction_uuid,
          product_code: formData.product_code,
          product_service_charge: 0,
          product_delivery_charge: 0,
          success_url: formData.success_url,
          failure_url: formData.failure_url,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: formData.signature
        };

        for (const [key, value] of Object.entries(fields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }
    } catch (error) {
      console.error("Failed to initiate payment", error);
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
    <div className="max-w-4xl mx-auto pb-8 space-y-6 p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight mb-1 md:mb-2">
          {user?.role === "homeowner"
            ? "Tenant Applications"
            : "My Applications"}
        </h1>
        <p className="text-stone-500 text-sm md:text-base">
          {user?.role === "homeowner"
            ? "Manage requests for your properties."
            : "Track your rental requests."}
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 border-dashed">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-stone-300" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            No applications yet
          </h3>
          <p className="text-stone-500 text-sm">
            {user?.role === "homeowner"
              ? "You have no pending applications."
              : "You haven't applied to any rooms yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      app.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : app.status === "accepted"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-stone-400 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-1">
                  {app.listing?.title || "Unknown Listing"}
                </h3>

                {user?.role === "homeowner" ? (
                  <div className="space-y-2">
                    <p className="text-stone-600 text-sm">
                      Applicant:{" "}
                      <span className="font-medium">{app.applicant?.name}</span> (
                      {app.applicant?.phone})
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedApplicant(app.applicant);
                        setShowApplicantModal(true);
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <User className="w-3 h-3" /> View Full Profile & Docs
                    </button>
                  </div>
                ) : (
                  <p className="text-stone-600 text-sm">
                    Move-in Date:{" "}
                    <span className="font-medium">
                      {new Date(app.moveInDate).toLocaleDateString()}
                    </span>
                  </p>
                )}

                {app.message && (
                  <p className="text-stone-500 text-sm mt-2 italic border-l-2 border-stone-200 pl-3">
                    "{app.message}"
                  </p>
                )}
              </div>

              {user?.role === "homeowner" && (
                <div className="flex gap-2 shrink-0">
                  {app.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(app._id, "accept")}
                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app._id, "reject")}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleStartChat(app.applicant._id, app.listing?._id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  {(app.status === "completed" || app.status === "accepted") && app.paymentStatus === "paid" && (
                    <button
                      onClick={() => {
                        setReviewBookingId(app._id);
                        setShowReviewModal(true);
                      }}
                      className="flex-1 md:flex-none px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Review
                    </button>
                  )}
                </div>
              )}

              {user?.role === "user" && (
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {app.status === "accepted" && app.paymentStatus === "unpaid" && (
                    <button
                      onClick={() => initiatePayment(app)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Service Fee
                    </button>
                  )}
                  {app.paymentStatus === "paid" && (
                    <div className="flex flex-col items-end gap-2">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4" /> Paid
                      </span>
                      {(app.status === "completed" || app.status === "accepted") && (
                        <button
                          onClick={() => {
                            setReviewBookingId(app._id);
                            setShowReviewModal(true);
                          }}
                          className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg font-medium text-sm transition-colors flex items-center gap-1.5"
                        >
                          <Star className="w-4 h-4" />
                          Leave Review
                        </button>
                      )}
                    </div>
                  )}
                  <Link
                    to={`/listing/${app.listing?._id}`}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                  >
                    View Listing &rarr;
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Applicant Info Modal */}
      {showApplicantModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="text-xl font-bold text-stone-900">Applicant Profile</h3>
              <button onClick={() => setShowApplicantModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-sm">
                  {selectedApplicant.name.charAt(0)}
                </div>
                <h4 className="text-2xl font-bold text-stone-900">{selectedApplicant.name}</h4>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {selectedApplicant.verificationLevel === 'verified' ? (
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Verified Profile
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">Unverified</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Phone Number</label>
                  <p className="text-stone-900 font-medium">{selectedApplicant.phone}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Email Address</label>
                  <p className="text-stone-900 font-medium">{selectedApplicant.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">About Applicant</label>
                <p className="text-stone-600 text-sm italic leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  {selectedApplicant.bio || "No bio provided by the applicant."}
                </p>
              </div>

              {selectedApplicant.renterProfile?.preferences && (
                <div className="space-y-4 pt-6 border-t border-stone-100">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Rental Preferences</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                      <p className="text-[10px] text-stone-400 mb-1">Budget</p>
                      <p className="text-sm font-bold text-stone-700">Rs. {selectedApplicant.renterProfile.preferences.budgetAmount || 'N/A'}</p>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                      <p className="text-[10px] text-stone-400 mb-1">Move-in</p>
                      <p className="text-sm font-bold text-stone-700">
                        {selectedApplicant.renterProfile.preferences.moveInDate ? format(new Date(selectedApplicant.renterProfile.preferences.moveInDate), 'MMM d, yyyy') : 'Flexible'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <p className="text-[10px] text-stone-400 mb-1">Preferred Areas</p>
                    <p className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {selectedApplicant.renterProfile.preferences.preferredAreas?.join(", ") || 'Anywhere'}
                    </p>
                  </div>
                </div>
              )}

              {selectedApplicant.documents?.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-stone-100">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Uploaded Documents</label>
                  <div className="space-y-3">
                    {selectedApplicant.documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200 hover:border-emerald-500 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                            <File className="w-5 h-5 text-stone-500 group-hover:text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-stone-800">{doc.type}</p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-tighter">ID: {doc.idNumber || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {doc.status === 'verified' ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                          <button 
                            onClick={() => window.open(doc.url, '_blank')}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button 
                onClick={() => setShowApplicantModal(false)}
                className="px-6 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && reviewBookingId && (
        <ReviewModal
          bookingId={reviewBookingId}
          onClose={() => {
            setShowReviewModal(false);
            setReviewBookingId(null);
          }}
          onSubmitSuccess={() => {
            setShowReviewModal(false);
            setReviewBookingId(null);
          }}
        />
      )}
    </div>
  );
}
