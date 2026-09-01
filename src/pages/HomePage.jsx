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
  Zap,
  Users,
  Sparkles,
  ChevronDown
} from 'lucide-react';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const HomePage = () => {
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('All');

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

  const filteredRequests = requests.filter(req =>
    selectedGroup === 'All' ? true : req.requiredBloodGroup === selectedGroup
  );

  return (
    <div className="pb-16">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-red-950/40 to-slate-900 pt-16 pb-24 text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        {/* Subtle dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-7">
            {/* Live pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/15 text-red-300 text-xs sm:text-sm font-bold border border-red-500/25 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <Radio className="w-4 h-4" />
              <span>Real-Time Blood Donor Network — Live</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
              Connecting Blood Donors<br />
              With{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-red-300">
                  Lives In Need
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500/60 to-rose-400/60 rounded-full" />
              </span>
            </h1>

            {/* Sub */}
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Every second matters during medical emergencies. BloodBridge instantly broadcasts urgent requests to nearby verified donors in real time.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/post-request"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-base shadow-2xl shadow-red-700/50 active:scale-95 transition-all duration-200"
              >
                <PlusCircle className="w-5 h-5" />
                Post Emergency Request
              </Link>
              <Link
                to="/find-donors"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 backdrop-blur-sm active:scale-95 transition-all duration-200"
              >
                <Search className="w-5 h-5 text-red-400" />
                Find Donors Near You
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs sm:text-sm font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Free & Community Driven
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Zero Middlemen — Direct Contact
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-400" />
                Real-Time Firestore Sync
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="mt-14 flex justify-center animate-bounce">
            <ChevronDown className="w-6 h-6 text-slate-500" />
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <StatsCounter
          totalDonors={donors.length}
          activeRequestsCount={requests.length}
          livesSaved={1540 + requests.length * 3}
        />
      </section>

      {/* ── Live Feed ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-7">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live Emergency Broadcast
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Active Blood Requests Feed
            </h2>
            <p className="text-sm text-slate-500">
              Live updates direct from hospitals and family members needing immediate transfusions.
            </p>
          </div>

          <Link
            to="/post-request"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 group self-start md:self-auto whitespace-nowrap"
          >
            Need blood for a patient?
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Blood group filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
            Filter:
          </span>
          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedGroup === group
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner text="Syncing real-time emergency feed..." />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <BloodRequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-14 text-center border border-slate-200 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
              <Droplet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No active {selectedGroup !== 'All' ? selectedGroup : ''} requests
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              No emergency broadcasts match this filter right now.
            </p>
            <Link
              to="/post-request"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Request
            </Link>
          </div>
        )}
      </section>

      {/* ── How It Works ── */}
      <section className="mt-20 bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-600">
              <Sparkles className="w-3.5 h-3.5" />
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">How BloodBridge Saves Lives</h2>
            <p className="text-slate-500 text-sm">Designed for speed when every second matters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {[
              {
                step: '01',
                color: 'from-red-500 to-rose-600',
                shadow: 'shadow-red-500/20',
                title: 'Post Urgent Request',
                desc: 'Fill out the emergency blood requirement with hospital details, required units, and urgency level. Takes under 60 seconds.'
              },
              {
                step: '02',
                color: 'from-amber-500 to-orange-500',
                shadow: 'shadow-amber-500/20',
                title: 'Real-Time Broadcast',
                desc: 'The alert appears instantly on the global live feed and nearby available donors receive a notification immediately.'
              },
              {
                step: '03',
                color: 'from-emerald-500 to-teal-500',
                shadow: 'shadow-emerald-500/20',
                title: 'Direct Contact',
                desc: 'Connect via phone or WhatsApp directly — no middlemen. Donors and patients coordinate transfusion in real time.'
              }
            ].map(({ step, color, shadow, title, desc }) => (
              <div key={step} className="relative group p-7 rounded-3xl bg-slate-50 border border-slate-100 hover:border-red-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white font-black text-sm shadow-lg ${shadow} mb-5 group-hover:scale-105 transition-transform`}>
                  {step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-10 sm:p-14 text-white text-center shadow-2xl shadow-red-600/30">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <div className="flex justify-center">
              <Heart className="w-10 h-10 fill-white/30 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Save a Life Today?
            </h2>
            <p className="text-red-100 text-base leading-relaxed">
              Join thousands of voluntary blood donors who have already made a difference. Registration is free and takes less than 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-red-700 font-bold text-sm hover:bg-red-50 active:scale-95 transition shadow-lg"
              >
                <Users className="w-4 h-4" />
                Register as a Donor
              </Link>
              <Link
                to="/find-donors"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm active:scale-95 transition"
              >
                <Search className="w-4 h-4" />
                Find Donors Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
