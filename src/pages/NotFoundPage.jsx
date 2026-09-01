import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplet, 
  Home, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  ArrowLeft,
  HeartCrack
} from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center space-y-8 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl relative overflow-hidden">
        {/* Top Accent Gradient */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Badge & Icon */}
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-red-600/30">
            <HeartCrack className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black tracking-wider uppercase shadow-md border border-slate-700">
            404
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/25 active:scale-95 transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/find-donors"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 active:scale-95 transition"
          >
            <Search className="w-4 h-4 text-red-500" />
            <span>Find Donors</span>
          </Link>
        </div>

        {/* Secondary Links including Admin Portal */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <Link
            to="/post-request"
            className="inline-flex items-center gap-1.5 hover:text-red-600 transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-red-500" />
            Post Blood Request
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full border border-purple-200 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            Admin Portal / Panel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
