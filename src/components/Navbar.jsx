import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { subscribeToActiveBloodRequests } from '../firebase/services';
import { AdminLoginModal } from './AdminLoginModal';
import { 
  Heart, 
  Droplet, 
  Search, 
  PlusCircle, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Activity, 
  ShieldCheck, 
  Crown,
  Lock,
  UserPlus,
  SlidersHorizontal
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeEmergencyCount, setActiveEmergencyCount] = useState(0);

  // Subscribe to count of active requests for the emergency badge
  useEffect(() => {
    const unsubscribe = subscribeToActiveBloodRequests((requests) => {
      const activeCount = requests.filter(r => r.urgencyLevel === 'Critical' || r.urgencyLevel === 'Urgent').length;
      setActiveEmergencyCount(activeCount);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess("Successfully signed out.");
      navigate('/');
    } catch (err) {
      showError(err.message || "Failed to sign out");
    }
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-red-50 text-red-600 font-bold'
        : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition ${
      isActive
        ? 'bg-red-50 text-red-600 font-bold'
        : 'text-slate-700 hover:bg-slate-100 hover:text-red-600'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <Droplet className="w-6 h-6 fill-current" />
                <Heart className="w-3.5 h-3.5 text-white absolute fill-white -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">Blood</span>
                  <span className="text-xl font-extrabold tracking-tight text-red-600">Bridge</span>
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Emergency Network
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/find-donors" className={navLinkClass}>
                <Search className="w-4 h-4" />
                Find Donors
              </NavLink>
              <NavLink to="/post-request" className={navLinkClass}>
                <PlusCircle className="w-4 h-4 text-red-500" />
                Post Request
              </NavLink>

              {/* If Admin is logged in, show direct Admin Console link */}
              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-600/30'
                        : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                    }`
                  }
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Admin Console</span>
                </NavLink>
              )}
            </nav>

            {/* Right Action Area */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Live Emergency Alert Badge */}
              {activeEmergencyCount > 0 && (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-bold animate-pulse hover:bg-red-200 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <Activity className="w-3.5 h-3.5" />
                  <span>{activeEmergencyCount} Urgent Alert{activeEmergencyCount > 1 ? 's' : ''}</span>
                </Link>
              )}

              {/* Professional Staff & Admin Portal Button */}
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition shadow-2xs"
                  title="Authorized Staff & Administration Access"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Staff & Admin</span>
                </button>
              )}

              {currentUser ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{userProfile?.name || 'Dashboard'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20 active:scale-95 transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdminModal(true)}
                className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50"
                title="Staff Portal"
              >
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </button>

              {activeEmergencyCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 shadow-lg">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className={mobileNavLinkClass}
            >
              Home
            </NavLink>
            <NavLink
              to="/find-donors"
              onClick={() => setIsOpen(false)}
              className={mobileNavLinkClass}
            >
              <Search className="w-5 h-5 text-red-500" />
              Find Donors
            </NavLink>
            <NavLink
              to="/post-request"
              onClick={() => setIsOpen(false)}
              className={mobileNavLinkClass}
            >
              <PlusCircle className="w-5 h-5 text-red-500" />
              Post Blood Request
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={mobileNavLinkClass}
              >
                <Crown className="w-5 h-5 text-purple-600" />
                Admin Console
              </NavLink>
            )}

            {/* Staff portal trigger button for mobile */}
            {!isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowAdminModal(true);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span>Staff & Administration Portal</span>
                </div>
              </button>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-2">
              {currentUser ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={mobileNavLinkClass}
                  >
                    <User className="w-5 h-5 text-slate-500" />
                    Dashboard ({userProfile?.name || 'Profile'})
                  </NavLink>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold shadow-md shadow-red-600/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Staff & Administration Login Modal */}
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </>
  );
};

