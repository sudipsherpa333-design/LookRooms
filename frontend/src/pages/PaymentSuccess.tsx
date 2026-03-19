import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, FileText } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactionId) {
      axiosInstance.get(`/payments/status/${transactionId}`)
        .then((res) => {
          setPayment(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch payment details", err);
          setLoading(false);
        });
    }
  }, [transactionId]);

  if (loading) return <div className="p-8 text-center">Loading receipt...</div>;
  if (!payment) return <div className="p-8 text-center text-red-500">Payment details not found.</div>;

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-sm border border-stone-100 mt-10">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-stone-900">Payment Successful!</h1>
        <p className="text-stone-500">Your booking is confirmed.</p>
      </div>

      <div className="space-y-4 border-t border-stone-100 pt-6">
        <div className="flex justify-between">
          <span className="text-stone-500">Transaction ID</span>
          <span className="font-mono font-medium">{payment.transactionId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Date</span>
          <span className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Room Name</span>
          <span className="font-medium">{payment.listingId?.title || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Service Fee</span>
          <span className="font-bold text-emerald-600">Rs. {payment.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Payment Method</span>
          <span className="font-medium capitalize">{payment.paymentMethod}</span>
        </div>
      </div>

      <Link
        to="/dashboard"
        className="mt-8 w-full block text-center font-bold py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
