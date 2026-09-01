import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToActiveBloodRequests, subscribeToDonors } from '../firebase/services';
import { BloodRequestCard } from '../components/BloodRequestCard';
import { StatsCounter } from '../components/StatsCounter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  Heart, 
  Droplet, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Clock, 
  Radio, 
  ArrowRight,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const HomePage = () => {
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('All');

  // Real-time Firestore onSnapshot subscriptions
  useEffect(() => {
    setLoading(true);
    const unsubscribeReqs = subscribeToActiveBloodRequests((data) => {
      setRequests(data);
      setLoading(false);
    });

    const unsubscribeDonors = subscribeToDonors((data) => {
      setDonors(data);
    });

    return () => {
      if (typeof unsubscribeReqs === 'function') unsubscribeReqs();
      if (typeof unsubscribeDonors === 'function') unsubscribeDonors();
    };
  }, []);

  const filteredRequests = requests.filter(req => {
    if (selectedGroup === 'All') return true;
    return req.requiredBloodGroup === selectedGroup;
  });

  const criticalCount = requests.filter(r => r.urgencyLevel === 'Critical').length;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/80 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200/60">
        {/* Ambient background glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-red-400/10 via-rose-500/15 to-amber-400/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-bold border border-red-200/80 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <Radio className="w-4 h-4 text-red-600" />
              <span>Real-Time Blood Donor Network Active</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Connecting Blood Donors With <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">Lives In Need</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed">
              Every second matters during medical emergencies. BloodBridge instantly broadcasts urgent blood requests to nearby available donors in real time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/post-request"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-red-600 text-white font-bold text-base shadow-xl shadow-red-600/30 hover:bg-red-700 hover:shadow-red-600/40 active:scale-95 transition duration-200"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Post Emergency Request</span>
              </Link>
              <Link
                to="/find-donors"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-800 font-bold text-base border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition duration-200"
              >
                <Search className="w-5 h-5 text-red-600" />
                <span>Find Donors Near You</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs sm:text-sm font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Free & Community Driven</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Zero Middlemen / Direct Contact</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-500" />
                <span>Real-Time Firestore Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <StatsCounter
          totalDonors={donors.length}
          activeRequestsCount={requests.length}
          livesSaved={1540 + requests.length * 3}
        />
      </section>

      {/* Real-Time Emergency Requests Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 mb-1">
              <Radio className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Live Emergency Broadcast</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Active Blood Requests Feed
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Live updates direct from hospitals and family members needing immediate transfusions.
            </p>
          </div>

          <Link
            to="/post-request"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 hover:underline self-start md:self-auto"
          >
            <span>Need blood for a patient?</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Blood Group Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
            Filter Group:
          </span>
          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedGroup === group
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Requests Feed Grid */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Syncing real-time emergency feed..." />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <BloodRequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Droplet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No active {selectedGroup !== 'All' ? selectedGroup : ''} requests</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              There are currently no active emergency broadcasts matching this filter.
            </p>
            <Link
              to="/post-request"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Request</span>
            </Link>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">Simple 3-Step Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How BloodBridge Saves Lives</h2>
            <p className="text-slate-500 text-sm mt-2">
              Designed for speed when seconds matter most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-lg font-black mb-4 shadow-md shadow-red-600/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Post Urgent Request</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fill out the emergency blood requirement with hospital details, required units, and urgency level.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-lg font-black mb-4 shadow-md shadow-rose-600/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Broadcast</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The alert appears instantly on the global live feed and nearby donors are searchable with live availability tags.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-black mb-4 shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Contact & Transfusion</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect directly via Phone call or WhatsApp without registration barriers to arrange immediate donation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
