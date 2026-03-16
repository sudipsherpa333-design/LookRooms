import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, FileText, MapPin, Phone, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AgentRegistration = () => {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    agencyName: '',
    agencySlug: '',
    agencyPhone: '',
    agencyAddress: '',
    agencyCity: '',
    licenseNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/agent/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await refreshUser();
        navigate('/agent/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering agent:', error);
      alert('An error occurred during registration.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Become a LookRooms Agent
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our network of professional room brokers and manage your portfolio.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700">
                Agency Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="agencyName"
                  id="agencyName"
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="e.g., Ram Real Estate"
                  value={formData.agencyName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="agencySlug" className="block text-sm font-medium text-gray-700">
                Agency URL Slug
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  lookrooms.com/agent/
                </span>
                <input
                  type="text"
                  name="agencySlug"
                  id="agencySlug"
                  required
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 border"
                  placeholder="ram-real-estate"
                  value={formData.agencySlug}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="agencyPhone" className="block text-sm font-medium text-gray-700">
                Agency Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="agencyPhone"
                  id="agencyPhone"
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="98XXXXXXXX"
                  value={formData.agencyPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="agencyCity" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="agencyCity"
                  id="agencyCity"
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="e.g., Kathmandu"
                  value={formData.agencyCity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="agencyAddress" className="block text-sm font-medium text-gray-700">
                Full Address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="agencyAddress"
                  id="agencyAddress"
                  required
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  placeholder="e.g., New Baneshwor, Kathmandu"
                  value={formData.agencyAddress}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                Broker License Number (Optional)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="licenseNumber"
                  id="licenseNumber"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="Leave blank if not applicable"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register as Agent
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgentRegistration;
