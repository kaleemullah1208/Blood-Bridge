import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplet, Heart, ShieldAlert, HeartHandshake, Mail, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const { isAdmin } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-600 text-white shadow-md shadow-red-700/40">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">BloodBridge</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Real-time emergency blood donation network bridging patients with verified donors in critical moments.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              24/7 Live Emergency Network
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-5">Platform</h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/', label: 'Emergency Requests Feed' },
                { to: '/find-donors', label: 'Find Donors Directory' },
                { to: '/post-request', label: 'Request Blood Now' },
                { to: '/register', label: 'Register as a Donor' },
                { to: '/login', label: 'Sign In' }
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-red-400 transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
              {isAdmin && (
                <li>
                  <Link to="/admin" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Operations Console
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Blood type reference */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-5">Universal Donors</h4>
            <ul className="space-y-3">
              {[
                { type: 'O Negative (O−)', role: 'Universal Red Cell Donor' },
                { type: 'AB Positive (AB+)', role: 'Universal Recipient' },
                { type: 'AB Negative (AB−)', role: 'Universal Plasma Donor' },
              ].map(({ type, role }) => (
                <li key={type} className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-red-400">{type}</span>
                  <span className="text-xs text-slate-500">{role}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency hotline */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-5">Emergency Hotline</h4>
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/40 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <ShieldAlert className="w-4 h-4" />
                Medical Urgent Hotline
              </div>
              <a
                href="tel:18002566343"
                className="text-xl font-extrabold text-white hover:text-red-300 transition block"
              >
                1-800-BLOOD-HELP
              </a>
              <p className="text-[11px] text-slate-500">Available 24 hours · 7 days a week</p>
            </div>

            <div className="mt-4 space-y-2">
              <a
                href="mailto:support@bloodbridge.app"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition"
              >
                <Mail className="w-4 h-4" />
                support@bloodbridge.app
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-7 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p className="flex items-center gap-1.5">
            © {year} BloodBridge Emergency Network.
            <span className="hidden sm:inline">Every drop counts.</span>
          </p>

          <div className="flex items-center gap-5">
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="hover:text-slate-400 transition cursor-pointer"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="hover:text-slate-400 transition cursor-pointer"
              aria-label="Terms of Service"
            >
              Terms of Service
            </a>
            {isAdmin && (
              <Link
                to="/admin"
                className="hover:text-purple-400 transition font-semibold text-purple-500"
              >
                Admin Console
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

