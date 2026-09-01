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
  Filter, 
  Building2, 
  Users, 
  ShieldCheck,
  SlidersHorizontal,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DashboardPage = () => {
  const { 
    currentUser, 
    userProfile, 
    toggleAvailability, 
    updateUserData, 
    switchUserRole,
    setShowOnboardingModal 
  } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const isDonor = userProfile?.role === 'donor' || userProfile?.isDonor === true;

  // Default active tab based on role:
  // For Donors: defaults to 'emergency-feed'
  // For Requesters/Users: defaults to 'find-donors'
  const [activeTab, setActiveTab] = useState(isDonor ? 'emergency-feed' : 'find-donors');

  // Keep activeTab aligned if role changes
  useEffect(() => {
    if (isDonor && activeTab === 'find-donors' && !liveRequests.length) {
      setActiveTab('emergency-feed');
    }
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
      showSuccess(newStatus ? "Status: You are now Available to Donate!" : "Status: Marked as Unavailable/Busy.");
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
      showSuccess(`Switched to ${targetRole === 'donor' ? 'Voluntary Donor Mode' : 'Patient / Requester Mode'}!`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dynamic Role-Based Top Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-all duration-300 ${
        isDonor 
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700' 
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
      }`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Info Column */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-xs ${
                isDonor ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {isDonor ? <HeartHandshake className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                <span>{isDonor ? 'Voluntary Blood Donor Hub' : 'Patient & Seeker Emergency Hub'}</span>
              </span>

              {userProfile?.city && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/20 text-white/90 text-xs font-medium">
                  <MapPin className="w-3 h-3" />
                  <span>{userProfile.city}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              Welcome back, {userProfile?.name || currentUser?.displayName || 'Hero'}!
            </h1>
            <p className="text-white/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              {isDonor 
                ? 'Thank you for standing ready to save lives. Review urgent hospital requests below or toggle your live donation readiness.' 
                : 'Find available voluntary donors in your city, post urgent transfusion needs, and monitor responders in real-time.'}
            </p>

            {/* Quick Actions in Banner */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {!isDonor ? (
                <Link
                  to="/post-request"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 active:scale-95 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Urgent Blood Request</span>
                </Link>
              ) : (
                <Link
                  to="/post-request"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 text-xs font-bold shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Hospital Request</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleSwitchMode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition"
                title="Switch between Donor mode and Patient/Seeker mode"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Switch to {isDonor ? 'Patient / Seeker Mode' : 'Donor Mode'}</span>
              </button>
            </div>
          </div>

          {/* Conditional Status Box: Donor Availability Switch vs Seeker Profile Summary */}
          {isDonor ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-5 flex items-center justify-between gap-6 self-start lg:self-auto min-w-[280px]">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-white/80">Donation Status</p>
                <p className="text-base font-extrabold mt-0.5 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                  <span>{isAvailable ? 'Available to Donate' : 'Currently Busy'}</span>
                </p>
                <p className="text-[11px] text-white/70 mt-0.5">
                  {isAvailable ? 'Listed in donor directory' : 'Hidden from active donor search'}
                </p>
              </div>

              {/* iOS-style toggle */}
              <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
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
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-4 self-start lg:self-auto min-w-[280px]">
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg">
                {userProfile?.bloodGroup || 'O+'}
              </div>
              <div className="text-xs">
                <p className="text-white/70 font-semibold uppercase">Required Blood</p>
                <p className="font-bold text-white text-sm">{userProfile?.bloodGroup || 'O+'} Preferred</p>
                <p className="text-white/60 mt-0.5">{myRequests.length} Active Requests Posted</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role-Oriented Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        {/* For Donors: Emergency feed is first; For Users: Find donors is first */}
        {isDonor ? (
          <>
            <button
              onClick={() => setActiveTab('emergency-feed')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'emergency-feed'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>🚨 Emergency Requests Feed ({liveRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('find-donors')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'find-donors'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>🩸 All Donors Directory ({allDonors.length})</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('find-donors')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'find-donors'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>🔍 Find Available Donors ({allDonors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency-feed')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'emergency-feed'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>🚨 Emergency Broadcast Feed ({liveRequests.length})</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('my-requests')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'my-requests'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>📋 My Active Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>⚙️ Profile & Status</span>
        </button>
      </div>

      {/* VIEW 1: Emergency Requests Feed (Shows patients needing blood with direct Call/WhatsApp action) */}
      {activeTab === 'emergency-feed' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Filter by hospital, patient, or city..."
                value={reqSearchTerm}
                onChange={(e) => setReqSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Blood group chip buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex-shrink-0">Blood Group:</span>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => setReqFilterGroup(bg)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
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

          {/* Requests Grid */}
          {loading ? (
            <div className="py-16">
              <LoadingSpinner text="Fetching live emergency broadcasts..." />
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
                No active {reqFilterGroup !== 'All' ? reqFilterGroup : ''} requests right now
              </h3>
              <p className="text-sm text-slate-500">
                No emergency transfusion requests match your current filter. Check back shortly.
              </p>
              <Link
                to="/post-request"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Broadcast New Request</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Find Available Donors (Search donors by Blood Group & City) */}
      {activeTab === 'find-donors' && (
        <div className="space-y-6">
          {/* Donors Filter Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City search */}
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

              {/* Blood group select */}
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

              {/* Available only toggle */}
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

          {/* Donors Cards Grid */}
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

      {/* VIEW 3: My Active Requests (View/Close/Fulfill submitted requests) */}
      {activeTab === 'my-requests' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span>My Active Emergency Broadcasts</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track and close requests you have submitted.
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
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-700">No requests submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you post a blood request for a patient in need, it will appear here for you to manage or mark as fulfilled.
              </p>
              <Link
                to="/post-request"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Blood Request</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: Profile & Status Management */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {isDonor ? 'Donor Profile & Status' : 'Seeker Profile Details'}
              </h2>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
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
                <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">
                  {isDonor ? 'Donor Blood Group' : 'Preferred Blood Group'}
                </label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden bg-white font-bold"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Contact Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">City / Region</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                />
              </div>

              {isDonor && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Last Donation Date (Optional)</label>
                  <input
                    type="date"
                    value={profileForm.lastDonationDate}
                    onChange={(e) => setProfileForm({ ...profileForm, lastDonationDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden bg-white"
                  />
                </div>
              )}

              {!isDonor && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Hospital / Clinic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Memorial Central Hospital"
                    value={profileForm.hospitalName}
                    onChange={(e) => setProfileForm({ ...profileForm, hospitalName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden font-medium"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {userProfile?.bloodGroup || 'O+'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{userProfile?.name || 'User'}</h3>
                  <p className="text-xs text-slate-500">
                    {isDonor ? 'Verified Voluntary Blood Donor' : 'Patient / Blood Requester'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{userProfile?.email || currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{userProfile?.phone || 'No phone number provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{userProfile?.city || 'No location set'}</span>
                </div>
                {isDonor && userProfile?.lastDonationDate && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Last Donated: {userProfile.lastDonationDate}</span>
                  </div>
                )}
                {!isDonor && userProfile?.hospitalName && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{userProfile.hospitalName}</span>
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
