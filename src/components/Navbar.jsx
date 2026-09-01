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
  UserPlus,
  HeartHandshake
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, userProfile, isAdmin, isDonor, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [urgentCount, setUrgentCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToActiveBloodRequests((requests) => {
      setUrgentCount(requests.filter(r => r.urgencyLevel === 'Critical' || r.urgencyLevel === 'Urgent').length);
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setIsOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
      showSuccess('Successfully signed out.');
      navigate('/');
    } catch (err) {
      showError(err.message || 'Failed to sign out.');
    }
  };

  const desktopLink = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-red-50 text-red-600 font-bold'
        : 'text-slate-600 hover:text-red-600 hover:bg-red-50/70'
    }`;

  const mobileLink = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
      isActive
        ? 'bg-red-50 text-red-600 font-bold'
        : 'text-slate-700 hover:bg-slate-100 hover:text-red-600'
    }`;

  const displayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Member';
  const roleLabel = isAdmin ? 'Admin' : (isDonor ? 'Donor' : 'Seeker');

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b transition-all duration-200 ${
          scrolled ? 'border-slate-200 shadow-sm' : 'border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[70px]">

            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" onClick={() => setIsOpen(false)}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
                <Droplet className="w-5 h-5 fill-current" />
                <Heart className="w-3 h-3 text-white fill-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="leading-none">
                <div className="flex items-center gap-0.5">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900">Blood</span>
                  <span className="text-lg font-extrabold tracking-tight text-red-600">Bridge</span>
                </div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
                  Emergency Network
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" end className={desktopLink}>Home</NavLink>
              <NavLink to="/find-donors" className={desktopLink}>
                <Search className="w-4 h-4" />
                Find Donors
              </NavLink>
              <NavLink to="/post-request" className={desktopLink}>
                <PlusCircle className="w-4 h-4 text-red-500" />
                Post Request
              </NavLink>

              {/* ONLY show Admin link to verified Administrators */}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-purple-700 text-white shadow-md'
                        : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80'
                    }`
                  }
                  title="Admin Panel & Operations"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </NavLink>
              )}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Urgent Requests Alert Pill */}
              {urgentCount > 0 && (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-200 transition"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                  </span>
                  <Activity className="w-3.5 h-3.5" />
                  {urgentCount} Urgent
                </Link>
              )}

              {/* Authenticated User / Donor Profile Header */}
              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-red-50 hover:border-red-200 border border-transparent text-slate-800 text-sm font-semibold transition group"
                  >
                    <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-xs ${
                      isAdmin 
                        ? 'bg-gradient-to-tr from-purple-700 to-indigo-600'
                        : (isDonor ? 'bg-gradient-to-tr from-red-600 to-rose-500' : 'bg-gradient-to-tr from-slate-700 to-slate-900')
                    }`}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="max-w-[120px] truncate text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                        {displayName}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isAdmin ? 'text-purple-600' : (isDonor ? 'text-red-600' : 'text-slate-500')
                      }`}>
                        {roleLabel}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
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
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              {urgentCount > 0 && (
                <span className="flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-fade-in">
            <NavLink to="/" end onClick={() => setIsOpen(false)} className={mobileLink}>Home</NavLink>
            <NavLink to="/find-donors" onClick={() => setIsOpen(false)} className={mobileLink}>
              <Search className="w-4 h-4 text-red-500" />
              Find Donors
            </NavLink>
            <NavLink to="/post-request" onClick={() => setIsOpen(false)} className={mobileLink}>
              <PlusCircle className="w-4 h-4 text-red-500" />
              Post Blood Request
            </NavLink>

            {/* ONLY show Admin link to Admins */}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setIsOpen(false)} className={mobileLink}>
                <Crown className="w-4 h-4 text-purple-600" />
                Admin Panel
              </NavLink>
            )}

            <div className="pt-3 mt-2 border-t border-slate-100 space-y-1">
              {currentUser ? (
                <>
                  <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={mobileLink}>
                    <User className="w-4 h-4 text-red-500" />
                    Dashboard ({roleLabel})
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
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

      <AdminLoginModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </>
  );
};

