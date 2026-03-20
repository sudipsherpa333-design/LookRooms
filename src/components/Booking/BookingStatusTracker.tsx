import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Home, CreditCard, XCircle, AlertCircle, Phone, Mail, MessageSquare, AlertTriangle, Star } from 'lucide-react';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { ReviewModal } from '../ReviewModal';

const formatTimeLeft = (targetDate: string | Date | undefined) => {
  if (!targetDate) return '';
  const target = new Date(targetDate);
  const now = new Date();
  const diff = differenceInSeconds(target, now);
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  const seconds = diff % 60;
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
};

export const BookingStatusTracker = ({ booking, onCancel, onConfirmMoveIn }: { booking: any, onCancel: () => void, onConfirmMoveIn: () => void }) => {
  const {
    status,
    roomAddress,
    roomTypeLabel,
    serviceFee,
    landlordDeadline,
    landlord,
    monthlyRent,
    confirmDeadline,
    rejectionReason,
    refundAmount
  } = booking;

  const [timeLeft, setTimeLeft] = useState({
    landlord: formatTimeLeft(landlordDeadline),
    tenant: formatTimeLeft(confirmDeadline)
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft({
        landlord: formatTimeLeft(landlordDeadline),
        tenant: formatTimeLeft(confirmDeadline)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [landlordDeadline, confirmDeadline]);

  const getStepStatus = (stepIndex: number) => {
    if (status === 'rejected' || status === 'expired') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'failed';
      return 'pending';
    }

    // Define which step each status corresponds to
    let currentStep = 0;
    if (status === 'fee_paid' || status === 'landlord_reviewing') currentStep = 1;
    if (status === 'accepted') currentStep = 2;
    if (status === 'confirmed' || status === 'completed') currentStep = 3;

    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const steps = [
    { label: 'Fee Paid', icon: CreditCard, index: 0 },
    { label: 'Awaiting Landlord', icon: Clock, index: 1 },
    { label: 'Accepted', icon: CheckCircle, index: 2 },
    { label: 'Confirmed', icon: Home, index: 3 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-100 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500"
            style={{ 
              width: status === 'rejected' || status === 'expired' ? '33%' : 
                     status === 'fee_paid' || status === 'landlord_reviewing' ? '33%' : 
                     status === 'accepted' ? '66%' : 
                     status === 'confirmed' || status === 'completed' ? '100%' : '0%' 
            }}
          ></div>
          
          {steps.map((step, i) => {
            const stepStatus = getStepStatus(i);
            const Icon = step.icon;
            
            let bgColor = 'bg-white border-stone-200 text-stone-400';
            if (stepStatus === 'completed') bgColor = 'bg-emerald-500 border-emerald-500 text-white';
            if (stepStatus === 'current') bgColor = 'bg-white border-emerald-500 text-emerald-600 ring-4 ring-emerald-50';
            if (stepStatus === 'failed') bgColor = 'bg-red-500 border-red-500 text-white';

            return (
              <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${bgColor}`}>
                  {stepStatus === 'failed' ? <XCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium ${stepStatus === 'current' ? 'text-emerald-700' : stepStatus === 'completed' ? 'text-stone-900' : stepStatus === 'failed' ? 'text-red-600' : 'text-stone-400'}`}>
                  {stepStatus === 'failed' ? (status === 'rejected' ? 'Rejected' : 'Expired') : step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Cards */}
      <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-stone-500" />
              {roomTypeLabel} - {roomAddress}
            </h3>
          </div>
        </div>

        {/* AWAITING STATE */}
        {(status === 'fee_paid' || status === 'landlord_reviewing') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg inline-flex">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Fee Paid: Rs {serviceFee?.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              <Clock className="w-5 h-5" />
              <div>
                <p className="font-medium">Status: Waiting for landlord...</p>
                {landlordDeadline && (
                  <p className="text-sm opacity-80 font-mono mt-1">
                    Time remaining: {timeLeft.landlord}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-stone-200">
              <button className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors">
                View Listing
              </button>
              <button onClick={onCancel} className="px-4 py-2 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                Cancel Request
              </button>
            </div>
          </div>
        )}

        {/* ACCEPTED STATE */}
        {status === 'accepted' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
              <CheckCircle className="w-6 h-6" />
              <span className="font-bold text-lg">ACCEPTED!</span>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
              <p className="font-medium text-stone-900">Landlord: {landlord?.name || 'Landlord Name'}</p>
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-4 h-4" />
                <span>Phone: {landlord?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <Mail className="w-4 h-4" />
                <span>Email: {landlord?.email || 'Not provided'}</span>
              </div>
              {booking.landlordResponse && (
                <div className="flex items-start gap-2 text-stone-600 bg-stone-50 p-3 rounded-lg mt-2">
                  <MessageSquare className="w-4 h-4 mt-0.5" />
                  <p className="text-sm italic">"{booking.landlordResponse}"</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Pay Rs {monthlyRent?.toLocaleString()} rent directly to landlord</p>
                {confirmDeadline && (
                  <p className="text-sm mt-1 font-mono">Time remaining: {timeLeft.tenant}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onConfirmMoveIn} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Confirm Move-In
              </button>
              <button className="px-4 py-3 bg-white border border-stone-300 rounded-xl font-medium hover:bg-stone-50 transition-colors">
                View Receipt
              </button>
            </div>
          </div>
        )}

        {/* REJECTED STATE */}
        {status === 'rejected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              <XCircle className="w-6 h-6" />
              <span className="font-bold text-lg">Not Accepted</span>
            </div>
            
            {rejectionReason && (
              <div className="bg-white p-4 rounded-xl border border-stone-200">
                <p className="text-sm text-stone-500 mb-1">Reason:</p>
                <p className="font-medium text-stone-900">"{rejectionReason}"</p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="font-medium text-blue-900">Refund: Rs {serviceFee?.toLocaleString()} → processing</p>
              <p className="text-sm text-blue-700 mt-1">Expected in: 3-5 business days</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 px-4 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors">
                Find Similar Rooms
              </button>
              <button className="px-4 py-3 bg-white border border-stone-300 rounded-xl font-medium hover:bg-stone-50 transition-colors">
                View Receipt
              </button>
            </div>
          </div>
        )}

        {/* EXPIRED STATE */}
        {status === 'expired' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
              <Clock className="w-6 h-6" />
              <span className="font-bold text-lg">Landlord didn't respond</span>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="font-medium text-blue-900">Refund: Rs {serviceFee?.toLocaleString()} → initiated</p>
              <p className="text-sm text-blue-700 mt-1">The 48-hour response window expired.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 px-4 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors">
                Find Similar Rooms
              </button>
            </div>
          </div>
        )}

        {/* CONFIRMED STATE */}
        {(status === 'confirmed' || status === 'completed') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
              <Home className="w-6 h-6" />
              <span className="font-bold text-lg">Move-in Confirmed!</span>
            </div>
            <p className="text-stone-600">You have successfully confirmed your move-in. Enjoy your new place!</p>
            <div className="flex gap-3 pt-2">
              <button className="px-4 py-3 bg-white border border-stone-300 rounded-xl font-medium hover:bg-stone-50 transition-colors">
                View Receipt
              </button>
              {!reviewSubmitted && (
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  Leave a Review
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showReviewModal && (
        <ReviewModal
          bookingId={booking._id || booking.id}
          onClose={() => setShowReviewModal(false)}
          onSubmitSuccess={() => {
            setShowReviewModal(false);
            setReviewSubmitted(true);
          }}
        />
      )}
    </div>
  );
};
