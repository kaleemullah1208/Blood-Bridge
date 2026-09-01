import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, Phone, Mail, ShieldAlert, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">BloodBridge</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time emergency blood donation network bridging patients with active blood donors in critical moments.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              24/7 Live Emergency Network
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-red-400 transition">Emergency Feed</Link>
              </li>
              <li>
                <Link to="/find-donors" className="hover:text-red-400 transition">Find Donors Directory</Link>
              </li>
              <li>
                <Link to="/post-request" className="hover:text-red-400 transition">Request Blood Now</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-red-400 transition">Register as a Donor</Link>
              </li>
            </ul>
          </div>

          {/* Compatible Blood Groups Guide */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Universal Donors</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-red-400">O Negative (O-)</span>
                <span>Universal Red Cell Donor</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-red-400">AB Positive (AB+)</span>
                <span>Universal Recipient</span>
              </li>
              <li className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="font-bold text-red-400">AB Negative (AB-)</span>
                <span>Universal Plasma Donor</span>
              </li>
            </ul>
          </div>

          {/* Emergency Helpline */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Emergency Hotline</h4>
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/40">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
                <ShieldAlert className="w-4 h-4" />
                Medical Urgent Hotline
              </div>
              <a href="tel:911" className="text-xl font-extrabold text-white hover:text-red-400 transition block">
                1-800-BLOOD-HELP
              </a>
              <p className="text-[11px] text-slate-400 mt-1">Available 24 hours a day, 7 days a week.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BloodBridge Emergency Network. Every drop counts.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
            <Link to="/admin" className="text-slate-400 hover:text-red-400 transition">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
