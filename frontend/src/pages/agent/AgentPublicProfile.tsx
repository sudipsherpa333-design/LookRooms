import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Building2, MapPin, Star, Phone, ShieldCheck } from 'lucide-react';

const AgentPublicProfile = () => {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/agents/${slug}`);
        if (res.status === 200) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Error fetching agent profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!data || !data.agent) return <div className="flex justify-center items-center h-screen">Agent not found</div>;

  const { agent, listings, reviews } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Agent Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-indigo-600"></div>
          <div className="px-8 pb-8 relative">
            <div className="flex justify-between items-end -mt-12 mb-6">
              <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center border-4 border-white overflow-hidden">
                {agent.agencyLogo ? (
                  <img src={agent.agencyLogo} alt={agent.agencyName} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-indigo-600" />
                )}
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  Contact Agent
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-gray-900">{agent.agencyName}</h1>
                {agent.isVerified && <ShieldCheck className="w-6 h-6 text-emerald-500" />}
              </div>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {agent.agencyCity}</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> {agent.stats?.averageRating || 'New'}</span>
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {agent.stats?.activeListings || 0} Active Listings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {agent.agencyName}</h2>
              <p className="text-gray-600 leading-relaxed">
                {agent.bio || 'This agent has not provided a bio yet.'}
              </p>
            </div>

            {/* Listings */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Listings</h2>
                <button className="text-indigo-600 font-medium hover:text-indigo-700">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings && listings.length > 0 ? listings.map((listing: any) => (
                  <div key={listing._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200">
                      {listing.images && listing.images[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{listing.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 truncate">{listing.location?.address}</p>
                      <p className="text-indigo-600 font-bold mt-2">Rs. {listing.price}/month</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 col-span-2">No active listings found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{agent.agencyPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">{agent.agencyAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            {agent.trustBadge && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Trust Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full capitalize">
                    {agent.trustBadge.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPublicProfile;
