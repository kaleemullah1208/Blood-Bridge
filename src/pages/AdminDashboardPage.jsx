import React, { useState, useEffect } from 'react';
import { useAuth, ADMIN_EMAIL, ADMIN_PASS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  subscribeToAllBloodRequests, 
  subscribeToAllUsers,
  updateBloodRequestStatus,
  deleteBloodRequest,
  adminUpdateUser,
  adminDeleteUser
} from '../firebase/services';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  HeartHandshake, 
  AlertTriangle, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Droplet, 
  Phone, 
  MapPin, 
  Building2, 
  Clock, 
  Crown,
  KeyRound,
  Lock,
  ArrowRight,
  Radio,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { currentUser, userProfile, isAdmin, login } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'requests'
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Admin login form states if not yet authorized
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loggingInAdmin, setLoggingInAdmin] = useState(false);

  // Filters for Requests
  const [requestFilterStatus, setRequestFilterStatus] = useState('All');
  const [requestFilterUrgency, setRequestFilterUrgency] = useState('All');
  const [requestSearch, setRequestSearch] = useState('');

  // Filters for Users
  const [userSearch, setUserSearch] = useState('');
  const [userBloodGroupFilter, setUserBloodGroupFilter] = useState('All');

  // Real-time subscriptions to Firestore collections
  useEffect(() => {
    setLoading(true);
    const unsubReqs = subscribeToAllBloodRequests((data) => {
      setRequests(data);
      setLoading(false);
    });

    const unsubUsers = subscribeToAllUsers((data) => {
      setUsers(data);
    });

    return () => {
      if (typeof unsubReqs === 'function') unsubReqs();
      if (typeof unsubUsers === 'function') unsubUsers();
    };
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    subscribeToAllUsers((data) => {
      setUsers(data);
      setRefreshing(false);
      showInfo("Realtime user database synchronized.");
    });
  };

  // Handler for Admin Quick Login
  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    try {
      setLoggingInAdmin(true);
      await login(adminEmail, adminPassword);
      showSuccess("Admin session unlocked successfully!");
    } catch (err) {
      showError("Invalid admin credentials.");
    } finally {
      setLoggingInAdmin(false);
    }
  };

  // Handlers for Request Actions
  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateBloodRequestStatus(requestId, newStatus);
      showSuccess(`Request status updated to "${newStatus}"`);
    } catch (err) {
      showError("Failed to update status.");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Admin Action: Are you sure you want to permanently delete this blood request?")) return;
    try {
      await deleteBloodRequest(requestId);
      showSuccess("Blood request deleted successfully.");
    } catch (err) {
      showError("Failed to delete request.");
    }
  };

  // Handlers for User Actions
  const handleToggleUserAvailability = async (user) => {
    try {
      const newStatus = !user.isAvailable;
      await adminUpdateUser(user.uid || user.id, { isAvailable: newStatus });
      showSuccess(`Donor availability set to ${newStatus ? 'Available' : 'Busy'}`);
    } catch (err) {
      showError("Failed to update availability.");
    }
  };

  const handleToggleVerification = async (user) => {
    try {
      const newStatus = !user.isVerified;
      await adminUpdateUser(user.uid || user.id, { isVerified: newStatus });
      showSuccess(`Donor verification set to ${newStatus ? 'Verified' : 'Unverified'}`);
    } catch (err) {
      showError("Failed to update verification.");
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'donor' : 'admin';
    if (!window.confirm(`Change role of ${user.name || 'user'} to "${newRole}"?`)) return;
    try {
      await adminUpdateUser(user.uid || user.id, { role: newRole });
      showSuccess(`User role changed to ${newRole}`);
    } catch (err) {
      showError("Failed to update role.");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Admin Action: Permanently delete user profile for "${user.name || user.email}"?`)) return;
    try {
      await adminDeleteUser(user.uid || user.id);
      showSuccess("User profile deleted.");
    } catch (err) {
      showError("Failed to delete user.");
    }
  };

  const formatUserTime = (dateVal) => {
    if (!dateVal) return 'Recently';
    if (typeof dateVal.toDate === 'function') {
      try {
        return dateVal.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      } catch { /* ignore */ }
    }
    const ms = typeof dateVal === 'number' ? dateVal : new Date(dateVal).getTime();
    if (!isNaN(ms) && ms > 0) {
      return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return 'Recently';
  };


  // Filter calculations
  const filteredRequests = requests.filter(req => {
    if (requestFilterStatus !== 'All' && req.status !== requestFilterStatus) return false;
    if (requestFilterUrgency !== 'All' && req.urgencyLevel !== requestFilterUrgency) return false;
    if (requestSearch.trim()) {
      const term = requestSearch.toLowerCase();
      const patient = (req.patientName || '').toLowerCase();
      const hospital = (req.hospitalName || '').toLowerCase();
      const city = (req.city || '').toLowerCase();
      const blood = (req.requiredBloodGroup || '').toLowerCase();
      if (!patient.includes(term) && !hospital.includes(term) && !city.includes(term) && !blood.includes(term)) {
        return false;
      }
    }
    return true;
  });

  const filteredUsers = users.filter(u => {
    if (userBloodGroupFilter !== 'All' && u.bloodGroup !== userBloodGroupFilter) return false;
    if (userSearch.trim()) {
      const term = userSearch.toLowerCase();
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const city = (u.city || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      if (!name.includes(term) && !email.includes(term) && !city.includes(term) && !phone.includes(term)) {
        return false;
      }
    }
    return true;
  });

  // KPI calculations
  const totalRequests = requests.length;
  const activeRequests = requests.filter(r => r.status === 'Active').length;
  const fulfilledRequests = requests.filter(r => r.status === 'Fulfilled').length;
  const criticalRequests = requests.filter(r => r.urgencyLevel === 'Critical' && r.status === 'Active').length;
  const totalDonors = users.filter(u => u.isDonor).length;
  const availableDonors = users.filter(u => u.isDonor && u.isAvailable).length;

  // If user is not logged in as Admin, show Authorization Lock Screen
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600" />
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-600/30">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clinical & Operations Access</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please enter your authorized personnel credentials to access the central operations control.
            </p>
          </div>

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Official Email *</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Access Password *</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-purple-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setAdminEmail(ADMIN_EMAIL);
                  setAdminPassword(ADMIN_PASS);
                }}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3 text-purple-600" />
                <span>Fill Demo Credentials</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loggingInAdmin}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition"
            >
              {loggingInAdmin ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Operations Console</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Clinical & Operations Console</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 animate-ping text-emerald-400" />
                <span>Real-Time Network Sync Active</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Clinical & Operations Control Center
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Central management dashboard for verified voluntary donors, hospital emergency transfusion broadcasts, and community accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition"
              title="Force Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs">
                <p className="text-slate-400 font-semibold">Authorized Staff</p>
                <p className="font-bold text-white truncate max-w-[170px]">
                  {userProfile?.name || currentUser?.email || 'Operations Director'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Accounts</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{users.length}</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">{availableDonors} Available Donors</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Requests</p>
            <h3 className="text-3xl font-black text-red-600 mt-1">{activeRequests}</h3>
            <p className="text-xs text-slate-400 mt-1">{criticalRequests} Critical Urgency</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Fulfilled Emergencies</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{fulfilledRequests}</h3>
            <p className="text-xs text-slate-400 mt-1">From {totalRequests} total requests</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Critical Alerts</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{criticalRequests}</h3>
            <p className="text-xs text-slate-400 mt-1">Requiring immediate match</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users & Donors ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>All Blood Requests ({requests.length})</span>
        </button>
      </div>

      {/* Tab 1: Users & Donors Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search donors by name, email, city or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={userBloodGroupFilter}
              onChange={(e) => setUserBloodGroupFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Blood Types</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>Blood Group {bg}</option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">User / Account</th>
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4">Location & Hospital</th>
                    <th className="px-6 py-4">Role & Auth</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id || user.uid} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-slate-200">
                            {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name || user.displayName || user.email?.split('@')[0] || 'User'}</span>
                              {user.isVerified && (
                                <ShieldCheck className="w-4 h-4 text-emerald-500" title="Verified Donor" />
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{user.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-bold text-xs">
                          {user.bloodGroup || 'O+'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-slate-700 font-medium">{user.city || 'Location unlisted'}</p>
                        {user.hospitalName && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{user.hospitalName}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Joined {formatUserTime(user.createdAt)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {user.role || 'donor'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {user.provider === 'google' ? 'Google Auth' : 'Email Auth'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleUserAvailability(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                            user.isAvailable
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${user.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{user.isAvailable ? 'Available' : 'Busy'}</span>
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleVerification(user)}
                            className={`p-1.5 rounded-lg text-xs font-bold border transition ${
                              user.isVerified
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                            title="Toggle Verification Badge"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleRole(user)}
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                            title="Promote / Demote Role"
                          >
                            <Crown className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Requests Management */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by patient, hospital, city or blood group..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 text-sm focus:border-red-500 focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={requestFilterStatus}
                onChange={(e) => setRequestFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:border-red-500 focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Status: Active</option>
                <option value="Fulfilled">Status: Fulfilled</option>
                <option value="Cancelled">Status: Cancelled</option>
              </select>

              <select
                value={requestFilterUrgency}
                onChange={(e) => setRequestFilterUrgency(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:border-red-500 focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Urgency</option>
                <option value="Critical">Critical Only</option>
                <option value="Urgent">Urgent Only</option>
                <option value="Normal">Normal Only</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          {loading ? (
            <div className="py-16">
              <LoadingSpinner text="Loading all blood requests..." />
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Patient & Blood</th>
                      <th className="px-6 py-4">Hospital & City</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Urgency</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                              {req.requiredBloodGroup}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{req.patientName}</p>
                              <p className="text-xs text-slate-400">{req.unitsRequired} Units needed</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{req.hospitalName}</p>
                          <p className="text-xs text-slate-500">{req.city}</p>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                          {req.contactPhone}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            req.urgencyLevel === 'Critical'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : req.urgencyLevel === 'Urgent'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {req.urgencyLevel}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'Fulfilled'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {req.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {req.status !== 'Fulfilled' && (
                              <button
                                onClick={() => handleStatusChange(req.id, 'Fulfilled')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition"
                                title="Mark as Fulfilled"
                              >
                                Fulfil
                              </button>
                            )}
                            {req.status !== 'Active' && (
                              <button
                                onClick={() => handleStatusChange(req.id, 'Active')}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                                title="Reactivate Request"
                              >
                                Reopen
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete Request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
              No blood requests found matching filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { AdminDashboardPage as AdminDashboard };
export default AdminDashboardPage;
