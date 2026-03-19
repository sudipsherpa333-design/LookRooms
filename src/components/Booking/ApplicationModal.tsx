import React, { useState } from 'react';
import { FileText, Send, User, MapPin, Briefcase, Calendar, Users, Bike, Car, Info, MessageSquare } from 'lucide-react';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  onSuccess: () => void;
}

export default function ApplicationModal({ isOpen, onClose, listingId, listingTitle, onSuccess }: ApplicationModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      phone: '',
      email: '',
      currentAddress: '',
      occupation: '',
      workplace: '',
      idType: 'Citizenship',
      idNumber: '',
    },
    preferences: {
      moveInDate: '',
      stayDuration: '6 months',
      numberOfOccupants: 1,
      vehicleInfo: {
        hasBike: false,
        hasCar: false,
        hasCycle: false,
      },
    },
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axiosInstance.post(`/user/applications/${listingId}`, formData, {
        headers: {
          'x-user-id': localStorage.getItem('krf_user') ? JSON.parse(localStorage.getItem('krf_user')!).id : '',
        },
      });

      toast.success('Application submitted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rental Application">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Applying for: {listingTitle}</p>
              <p className="text-xs text-emerald-700 mt-1">
                Your application will be sent to the landlord for review.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-black uppercase tracking-tighter text-sm">
            <User className="w-4 h-4" />
            Personal Information
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Full Name</label>
              <input
                required
                type="text"
                value={formData.personalInfo.fullName}
                onChange={(e) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, fullName: e.target.value }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Phone Number</label>
              <input
                required
                type="tel"
                value={formData.personalInfo.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, phone: e.target.value }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="98XXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Email Address</label>
              <input
                required
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, email: e.target.value }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Current Address</label>
              <input
                required
                type="text"
                value={formData.personalInfo.currentAddress}
                onChange={(e) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, currentAddress: e.target.value }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Kathmandu, Nepal"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Occupation</label>
              <input
                required
                type="text"
                value={formData.personalInfo.occupation}
                onChange={(e) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, occupation: e.target.value }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Workplace/College</label>
              <input
                required
                type="text"
                value={formData.personalInfo.workplace}
                onChange={(e) => setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, workplace: e.target.value }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Company Name / University"
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-black uppercase tracking-tighter text-sm">
            <Calendar className="w-4 h-4" />
            Rental Preferences
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Move-in Date</label>
              <input
                required
                type="date"
                value={formData.preferences.moveInDate}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, moveInDate: e.target.value }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Stay Duration</label>
              <select
                value={formData.preferences.stayDuration}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, stayDuration: e.target.value }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="Less than 3 months">Less than 3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="Long term">Long term (1+ year)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Number of Occupants</label>
              <input
                required
                type="number"
                min="1"
                value={formData.preferences.numberOfOccupants}
                onChange={(e) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, numberOfOccupants: parseInt(e.target.value) }
                })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase">Vehicles</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.preferences.vehicleInfo.hasBike}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      vehicleInfo: { ...formData.preferences.vehicleInfo, hasBike: e.target.checked }
                    }
                  })}
                  className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-stone-600 group-hover:text-stone-900 flex items-center gap-1.5">
                  <Bike className="w-4 h-4" /> Bike
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.preferences.vehicleInfo.hasCar}
                  onChange={(e) => setFormData({
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      vehicleInfo: { ...formData.preferences.vehicleInfo, hasCar: e.target.checked }
                    }
                  })}
                  className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-stone-600 group-hover:text-stone-900 flex items-center gap-1.5">
                  <Car className="w-4 h-4" /> Car
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Message */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-black uppercase tracking-tighter text-sm">
            <MessageSquare className="w-4 h-4" />
            Message to Landlord
          </div>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px]"
            placeholder="Tell the landlord a bit about yourself and why you're interested in this room..."
          />
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-stone-900 hover:bg-stone-800 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-stone-900/20 disabled:bg-stone-400"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Application
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
