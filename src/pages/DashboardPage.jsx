import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  subscribeToActiveBloodRequests,
  subscribeToDonors,
  subscribeToUserRequests, 
  updateBloodRequestStatus, 
  deleteBloodRequest 
} from '../firebase/services';
import { BloodRequestCard } from '../components/BloodRequestCard';
import { DonorCard } from '../components/DonorCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  User, 
  Droplet, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Edit3, 
  Save, 
  X, 
  Radio, 
  HeartHandshake, 
  Activity, 
  Search, 
  Building2, 
  Users, 
  ShieldCheck,
  SlidersHorizontal,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DashboardPage = () => {
  const { 
    currentUser, 
    userProfile, 
    toggleAvailability, 
    updateUserData, 
    switchUserRole
  } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const isDonor = userProfile?.role === 'donor' || userProfile?.isDonor === true;

  // Default active tab based on role:
  // For Donors: defaults to 'emergency-feed'
  // For Requesters/Users: defaults to 'find-donors'
  const [activeTab, setActiveTab] = useState(isDonor ? 'emergency-feed' : 'find-donors');

  // Keep activeTab aligned if role changes
  useEffect(() => {
    if (isDonor && activeTab === 'find-donors') {
      setActiveTab('emergency-feed');
    } else if (!isDonor && activeTab === 'emergency-feed') {
      setActiveTab('find-donors');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDonor]);

  // Real-time data streams
  const [liveRequests, setLiveRequests] = useState([]);
  const [allDonors, setAllDonors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for Emergency Requests
  const [reqFilterGroup, setReqFilterGroup] = useState('All');
  const [reqSearchTerm, setReqSearchTerm] = useState('');

  // Filters for Donors Directory
  const [donorFilterGroup, setDonorFilterGroup] = useState('All');
  const [donorSearchCity, setDonorSearchCity] = useState('');
  const [onlyAvailableDonors, setOnlyAvailableDonors] = useState(false);

  // Profile Edit Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    city: userProfile?.city || '',
    bloodGroup: userProfile?.bloodGroup || 'O+',
    hospitalName: userProfile?.hospitalName || '',
    lastDonationDate: userProfile?.lastDonationDate || '',
    isDonor: userProfile?.isDonor !== undefined ? userProfile.isDonor : true
  });
  const [isToggling, setIsToggling] = useState(false);

  // Sync profile form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        city: userProfile.city || '',
        bloodGroup: userProfile.bloodGroup || 'O+',
        hospitalName: userProfile.hospitalName || '',
        lastDonationDate: userProfile.lastDonationDate || '',
        isDonor: userProfile.isDonor !== undefined ? userProfile.isDonor : true
      });
    }
  }, [userProfile]);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    setLoading(true);

    const unsubRequests = subscribeToActiveBloodRequests((data) => {
      setLiveRequests(data);
      setLoading(false);
    });

    const unsubDonors = subscribeToDonors((data) => {
      setAllDonors(data);
    });

    let unsubUserReqs = () => {};
    if (currentUser?.uid) {
      unsubUserReqs = subscribeToUserRequests(currentUser.uid, (data) => {
        setMyRequests(data);
      });
    }

    return () => {
      if (typeof unsubRequests === 'function') unsubRequests();
      if (typeof unsubDonors === 'function') unsubDonors();
      if (typeof unsubUserReqs === 'function') unsubUserReqs();
    };
  }, [currentUser]);

  // Handle Availability Toggle
  const handleToggle = async () => {
    try {
      setIsToggling(true);
      const newStatus = await toggleAvailability();
      showSuccess(newStatus ? "Status updated: You are now Available to Donate!" : "Status updated: Marked as Currently Unavailable.");
    } catch (err) {
      showError("Failed to update availability status.");
    } finally {
      setIsToggling(false);
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserData(profileForm);
      showSuccess("Profile details saved successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      showError("Failed to save profile details.");
    }
  };

  // Switch Active Mode (Donor vs Seeker)
  const handleSwitchMode = async () => {
    const targetRole = isDonor ? 'user' : 'donor';
    try {
      await switchUserRole(targetRole);
      showSuccess(`Mode switched to ${targetRole === 'donor' ? 'Voluntary Blood Donor' : 'Patient / Blood Seeker'}!`);
      setActiveTab(targetRole === 'donor' ? 'emergency-feed' : 'find-donors');
    } catch (err) {
      showError("Failed to switch mode.");
    }
  };

  // Mark Request as Fulfilled
  const handleMarkFulfilled = async (requestId) => {
    try {
      await updateBloodRequestStatus(requestId, 'Fulfilled');
      showSuccess("Emergency request marked as Fulfilled. Thank you!");
    } catch (err) {
      showError("Failed to update request status.");
    }
  };

  // Delete Request
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to remove this emergency request?")) return;
    try {
      await deleteBloodRequest(requestId);
      showSuccess("Emergency request removed.");
    } catch (err) {
      showError("Failed to delete request.");
    }
  };

  // Filtered emergency requests
  const filteredRequests = liveRequests.filter((req) => {
    if (reqFilterGroup !== 'All' && req.requiredBloodGroup !== reqFilterGroup) return false;
    if (reqSearchTerm.trim()) {
      const term = reqSearchTerm.trim().toLowerCase();
      const match = (req.city || '').toLowerCase().includes(term) ||
                    (req.hospitalName || '').toLowerCase().includes(term) ||
                    (req.patientName || '').toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  // Filtered donors
  const filteredDonors = allDonors.filter((donor) => {
    if (donorFilterGroup !== 'All' && donor.bloodGroup !== donorFilterGroup) return false;
    if (donorSearchCity.trim()) {
      const match = (donor.city || '').toLowerCase().includes(donorSearchCity.trim().toLowerCase());
      if (!match) return false;
    }
    if (onlyAvailableDonors && !donor.isAvailable) return false;
    return true;
  });

  const isAvailable = Boolean(userProfile?.isAvailable);
  const displayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Member';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Premium Top Banner ── */}
      <div className={`rounded-3xl p-6 sm:p-9 text-white shadow-xl relative overflow-hidden transition-all duration-300 ${
        isDonor 
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-red-600/20' 
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-slate-900/25'
      }`}>
        {/* Decorative blur elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Profile Summary */}
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                isDonor ? 'bg-white/20 text-white' : 'bg-red-500/25 text-red-200 border border-red-500/30'
              }`}>
                {isDonor ? <HeartHandshake className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                <span>{isDonor ? 'Voluntary Donor Member' : 'Patient & Seeker Portal'}</span>
              </span>

              {userProfile?.city && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/25 text-white/90 text-xs font-medium">
                  <MapPin className="w-3 h-3" />
                  <span>{userProfile.city}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-bold">
                <Droplet className="w-3 h-3 fill-current" />
                <span>Group {userProfile?.bloodGroup || 'O+'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Welcome, {displayName}!
            </h1>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
              {isDonor 
                ? 'Thank you for standing ready to save lives. Review nearby emergency requests below or keep your availability live for patients.' 
                : 'Search verified donors in your city, post urgent blood requests, and coordinate with voluntary donors in real-time.'}
            </p>

            {/* Banner Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/post-request"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 ${
                  isDonor 
                    ? 'bg-white text-red-700 hover:bg-red-50 shadow-black/10' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isDonor ? 'Post Hospital Need' : 'Post Urgent Blood Request'}</span>
              </Link>

              <button
                type="button"
                onClick={handleSwitchMode}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Switch to {isDonor ? 'Seeker Mode' : 'Donor Mode'}</span>
              </button>
            </div>
          </div>

          {/* Availability Switch Box */}
          {isDonor ? (
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-5 flex items-center justify-between gap-6 self-start lg:self-auto min-w-[290px] shadow-lg">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/80">Live Donation Status</p>
                <p className="text-base font-black mt-0.5 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                  <span>{isAvailable ? 'Available to Donate' : 'Currently Busy'}</span>
                </p>
                <p className="text-[11px] text-white/70 mt-0.5">
                  {isAvailable ? 'Visible in donor search directory' : 'Hidden from immediate alerts'}
                </p>
              </div>

              {/* iOS-style Switch */}
              <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isAvailable ? 'bg-emerald-500' : 'bg-slate-400/80'
                }`}
                aria-label="Toggle donation availability"
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-8' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ) : (
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-3xl p-5 flex items-center gap-4 self-start lg:self-auto min-w-[280px]">
              <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                {userProfile?.bloodGroup || 'O+'}
              </div>
              <div className="text-xs">
                <p className="text-white/70 font-bold uppercase tracking-wider">Required Blood Group</p>
                <p className="font-extrabold text-white text-base mt-0.5">{userProfile?.bloodGroup || 'O+'} Preferred</p>
                <p className="text-white/80 mt-0.5">{myRequests.length} Active Requests Posted</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{liveRequests.length}</p>
            <p className="text-xs font-semibold text-slate-500">Live Requests</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{allDonors.filter(d => d.isAvailable).length}</p>
            <p className="text-xs font-semibold text-slate-500">Available Donors</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{myRequests.length}</p>
            <p className="text-xs font-semibold text-slate-500">My Requests</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{userProfile?.bloodGroup || 'O+'}</p>
            <p className="text-xs font-semibold text-slate-500">{isDonor ? 'Donor Group' : 'Target Blood'}</p>
          </div>
        </div>
      </div>

      {/* ── Modern Navigation Tabs ── */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1.5">
        {isDonor ? (
          <>
            <button
              onClick={() => setActiveTab('emergency-feed')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'emergency-feed'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Emergency Requests ({liveRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('find-donors')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'find-donors'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Donor Directory ({allDonors.length})</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('find-donors')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'find-donors'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Find Donors ({allDonors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency-feed')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'emergency-feed'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Emergency Feed ({liveRequests.length})</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('my-requests')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'my-requests'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* ── TAB 1: Emergency Requests Feed ── */}
      {activeTab === 'emergency-feed' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by patient, hospital, or city..."
                value={reqSearchTerm}
                onChange={(e) => setReqSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Blood group chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex-shrink-0">Blood:</span>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setReqFilterGroup(bg)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                    reqFilterGroup === bg
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-16">
              <LoadingSpinner text="Loading live emergency feed..." />
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((req) => (
                <BloodRequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <Droplet className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No active {reqFilterGroup !== 'All' ? reqFilterGroup : ''} requests found
              </h3>
              <p className="text-sm text-slate-500">
                All transfusions in this category are currently fulfilled.
              </p>
              <Link
                to="/post-request"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Emergency Request</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Donor Directory ── */}
      {activeTab === 'find-donors' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by city (e.g. New York)..."
                  value={donorSearchCity}
                  onChange={(e) => setDonorSearchCity(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <div>
                <select
                  value={donorFilterGroup}
                  onChange={(e) => setDonorFilterGroup(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:border-red-500 focus:outline-hidden cursor-pointer"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg === 'All' ? 'All Blood Groups' : `Blood Group ${bg}`}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={onlyAvailableDonors}
                  onChange={(e) => setOnlyAvailableDonors(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500 accent-red-600"
                />
                <span className="text-xs font-semibold text-slate-700">Available Donors Only</span>
              </label>
            </div>
          </div>

          {/* Donors Grid */}
          {filteredDonors.length > 0 ? (
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
                Try selecting "All Blood Groups" or clearing your city filter to broaden your search.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: My Active Requests ── */}
      {activeTab === 'my-requests' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span>My Emergency Broadcasts</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage and update your posted transfusion requests in real time.
              </p>
            </div>

            <Link
              to="/post-request"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Request</span>
            </Link>
          </div>

          {myRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myRequests.map((req) => (
                <BloodRequestCard
                  key={req.id}
                  request={req}
                  isOwner={true}
                  showActions={true}
                  onMarkFulfilled={handleMarkFulfilled}
                  onDelete={handleDeleteRequest}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-700">No requests submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you post a blood request for a patient in need, it will appear here for you to manage or mark as fulfilled.
              </p>
              <Link
                to="/post-request"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Blood Request</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: Profile Settings ── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isDonor ? 'Donor Profile & Readiness' : 'Seeker Profile Details'}
                </h2>
                <p className="text-xs text-slate-500">Keep your emergency contact info accurate</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-100 hover:bg-red-50 transition"
            >
              {isEditingProfile ? (
                <>
                  <X className="w-3.5 h-3.5" /> Cancel
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </>
              )}
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {isDonor ? 'Donor Blood Group' : 'Preferred Blood Group'}
                </label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden bg-white font-bold cursor-pointer"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>Blood Group {bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Contact Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, NY"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                />
              </div>

              {isDonor && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Last Donation Date (Optional)</label>
                  <input
                    type="date"
                    value={profileForm.lastDonationDate}
                    onChange={(e) => setProfileForm({ ...profileForm, lastDonationDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden bg-white"
                  />
                </div>
              )}

              {!isDonor && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Hospital / Clinic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Memorial Central Hospital"
                    value={profileForm.hospitalName}
                    onChange={(e) => setProfileForm({ ...profileForm, hospitalName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-md shadow-red-600/25 transition flex items-center justify-center gap-2 mt-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-red-600/20">
                  {userProfile?.bloodGroup || 'O+'}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{displayName}</h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {isDonor ? 'Verified Voluntary Blood Donor' : 'Patient / Blood Requester'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-700 p-3 rounded-xl bg-slate-50/50">
                  <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="font-medium">{userProfile?.email || currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 p-3 rounded-xl bg-slate-50/50">
                  <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="font-medium">{userProfile?.phone || 'No phone number provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 p-3 rounded-xl bg-slate-50/50">
                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="font-medium">{userProfile?.city || 'No location set'}</span>
                </div>
                {isDonor && userProfile?.lastDonationDate && (
                  <div className="flex items-center gap-3 text-slate-700 p-3 rounded-xl bg-slate-50/50">
                    <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="font-medium">Last Donated: {userProfile.lastDonationDate}</span>
                  </div>
                )}
                {!isDonor && userProfile?.hospitalName && (
                  <div className="flex items-center gap-3 text-slate-700 p-3 rounded-xl bg-slate-50/50">
                    <Building2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="font-medium">{userProfile.hospitalName}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { DashboardPage as Dashboard };
export default DashboardPage;

