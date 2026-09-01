import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToDonors } from '../firebase/services';
import { DonorCard } from '../components/DonorCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Droplet, 
  RotateCcw, 
  UserPlus,
  CheckCircle2
} from 'lucide-react';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const POPULAR_CITIES = ['All Cities', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];

export const FindDonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [searchCity, setSearchCity] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDonors((data) => {
      setDonors(data);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Filtered Donors logic
  const filteredDonors = donors.filter((donor) => {
    // Blood Group filter
    if (selectedBloodGroup !== 'All' && donor.bloodGroup !== selectedBloodGroup) {
      return false;
    }
    // City filter
    if (searchCity.trim() && searchCity !== 'All Cities') {
      const matchCity = (donor.city || '').toLowerCase().includes(searchCity.trim().toLowerCase());
      if (!matchCity) return false;
    }
    // Availability filter
    if (onlyAvailable && !donor.isAvailable) {
      return false;
    }
    return true;
  });

  const handleReset = () => {
    setSelectedBloodGroup('All');
    setSearchCity('');
    setOnlyAvailable(false);
  };

  const availableCount = donors.filter(d => d.isAvailable).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Verified Donor Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Find Voluntary Blood Donors
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Search verified donors in your area. Contact them immediately via direct call or WhatsApp for emergency transfusions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>City / Location</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type city (e.g. New York)..."
                value={searchCity === 'All Cities' ? '' : searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Blood Group Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-red-500" />
              <span>Blood Group</span>
            </label>
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium bg-white transition cursor-pointer"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg === 'All' ? 'All Blood Types' : `Blood Group ${bg}`}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Toggle & Reset */}
          <div className="flex items-end justify-between gap-3">
            <label className="flex-1 flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500 cursor-pointer accent-red-600"
              />
              <div className="text-xs font-semibold text-slate-700">
                <span>Available Donors Only</span>
                <p className="text-[11px] text-emerald-600 font-normal">
                  {availableCount} currently active
                </p>
              </div>
            </label>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
              title="Reset Filters"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Blood Group Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex-shrink-0">Quick Type:</span>
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedBloodGroup(bg)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                selectedBloodGroup === bg
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-slate-600 font-medium px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredDonors.length}</strong> matching donor{filteredDonors.length === 1 ? '' : 's'}
        </span>
        {selectedBloodGroup !== 'All' && (
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-semibold">
            Filtered by {selectedBloodGroup}
          </span>
        )}
      </div>

      {/* Donors Cards Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner text="Searching verified donor pool..." />
        </div>
      ) : filteredDonors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => (
            <DonorCard key={donor.id || donor.uid} donor={donor} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Donors Found</h3>
          <p className="text-sm text-slate-500">
            We couldn't find any donors matching your filter criteria. Try adjusting the city or blood group filter.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Clear All Filters
            </button>
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Be the First Donor Here</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
