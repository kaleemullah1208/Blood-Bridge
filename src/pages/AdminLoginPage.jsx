import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ADMIN_EMAIL, ADMIN_PASS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { login } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email || !email.trim()) {
      newErrors.email = 'Staff Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const validationResult = validate();
    setErrors(validationResult);

    if (Object.keys(validationResult).length > 0) {
      showWarning('Please fill in both your staff email and password.');
      return;
    }

    try {
      setLoading(true);
      const { profile } = await login(email, password, { requireAdmin: true });

      const isAuthorizedAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() || profile?.role === 'admin';
      if (isAuthorizedAdmin) {
        showSuccess('Staff authentication verified! Welcome to the Admin Console.');
        navigate('/admin', { replace: true });
      } else {
        showError('Access denied: Account does not have administrator privileges.');
      }
    } catch (err) {
      console.error("Staff login error:", err);
      showError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-lg shadow-purple-600/30 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Staff & Administration Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized access for BloodBridge clinical management and system administration.
          </p>
        </div>

        {/* Security Info Pill */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>Restricted portal. All administrative actions are logged and audited.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Staff / Admin Email *</span>
              {touched.email && errors.email && (
                <span className="text-red-500 text-xs normal-case font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) setErrors(validate());
                }}
                onBlur={() => handleBlur('email')}
                placeholder="example@gmail.com"
                className={`w-full px-4 py-3 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  touched.email && errors.email
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500/20'
                }`}
              />
              <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${touched.email && errors.email ? 'text-red-400' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Password *</span>
              {touched.password && errors.password && (
                <span className="text-red-500 text-xs normal-case font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) setErrors(validate());
                }}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pl-10 pr-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  touched.password && errors.password
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500/20'
                }`}
              />
              <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${touched.password && errors.password ? 'text-red-400' : 'text-slate-400'}`} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 active:scale-98 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Return Link */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Return to{' '}
          <Link to="/" className="font-bold text-slate-800 hover:text-red-600 underline">
            Community Home
          </Link>
        </div>
      </div>
    </div>
  );
};

