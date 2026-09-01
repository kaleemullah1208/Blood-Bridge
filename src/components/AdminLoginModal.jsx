import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, ADMIN_EMAIL, ADMIN_PASS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, X, ArrowRight, Shield, Sparkles, Key } from 'lucide-react';

export const AdminLoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleFillDemo = () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASS);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide your authorized staff email and security password.');
      showWarning('Please enter your staff email and password.');
      return;
    }

    try {
      setLoading(true);
      const { profile } = await login(email.trim(), password, { requireAdmin: true });

      const isAuthorizedAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() || profile?.role === 'admin';
      if (isAuthorizedAdmin) {
        showSuccess('Staff verification successful. Accessing Clinical & Operations Console...');
        onClose();
        setEmail('');
        setPassword('');
        navigate('/admin');
      } else {
        setError('Access denied: Your account is not authorized for operations console.');
        showError('Access denied: Account does not have operations privileges.');
      }
    } catch (err) {
      console.error('Operations portal login error:', err);
      setError(err.message || 'Invalid authorized staff credentials.');
      showError(err.message || 'Invalid authorized staff credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
        {/* Top Professional Indigo/Violet Gradient Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600" />

        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-xl shadow-purple-600/30 mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Shield className="w-3 h-3 text-purple-600" />
              <span>Operations Control</span>
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical & Staff Portal
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Authorized management console for hospital coordinators, clinical directors, and network staff.
          </p>
        </div>

        {/* Error Alert if any */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Staff / Official Email *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 text-sm font-medium transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Access Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 focus:border-purple-600 focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 text-sm font-medium transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Autofill Pill */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition flex items-center gap-1"
            >
              <Key className="w-3 h-3 text-purple-600" />
              <span>Fill Demo Credentials</span>
            </button>
            <span className="text-[11px] text-slate-400">admin@gmail.com</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-600/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Access Operations Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Direct page link & security footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-center">
          <div>
            <Link
              to="/admin"
              onClick={onClose}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
            >
              Open Dedicated Admin Portal Page →
            </Link>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>256-Bit Encrypted Clinical & Operations Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};


