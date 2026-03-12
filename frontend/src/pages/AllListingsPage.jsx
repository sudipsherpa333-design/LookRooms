import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';

export default function AllListingsPage() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const { data } = await axios.get('/api/listings');
    setListings(data);
    setFilteredListings(data);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredListings(listings.filter(l => 
      l.title.toLowerCase().includes(term) || l.area.toLowerCase().includes(term)
    ));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Available Rooms</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search by area or title..." 
              className="pl-10 pr-4 py-2 border border-stone-200 rounded-full"
              onChange={handleSearch}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredListings.map(listing => (
          <div key={listing._id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition">
            <img src={listing.images[0]} alt={listing.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-lg">{listing.title}</h3>
              <p className="text-stone-500 text-sm">{listing.area}</p>
              <p className="font-bold text-emerald-600 mt-2">Rs. {listing.price}/month</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
