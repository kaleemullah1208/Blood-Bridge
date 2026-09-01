import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Droplet, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  User, 
  ExternalLink,
  Crown,
  UserPlus,
  HeartHandshake,
  Users
} from 'lucide-react';

export const LoginPage = () => {
  // Mode switcher: 'user-donor' (Donor or Seeker) | 'admin' (Administrator)
  const [authTab, setAuthTab] = useState('user-donor');
  // Selected user role for sign-in context: 'donor' | 'user'
  const [selectedRole, setSelectedRole] = useState('donor');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [accountNotFoundError, setAccountNotFoundError] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const newErrors = {};
    if (!email || !email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  // Submit Handler for Email/Password Sign In
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAccountNotFoundError(false);
    setTouched({ email: true, password: true });

    const validationResult = validate();
    setErrors(validationResult);

    if (Object.keys(validationResult).length > 0) {
      showWarning("Please enter your email and password correctly.");
      return;
    }

    try {
      setLoading(true);
      const isLoggingInAsAdmin = authTab === 'admin';
      
      const { profile } = await login(email, password, { 
        requireAdmin: isLoggingInAsAdmin,
        selectedRole: selectedRole
      });

      if (isLoggingInAsAdmin || profile?.role === 'admin') {
        showSuccess('Admin verified! Opening Admin Dashboard in a new tab...');
        window.open('/admin', '_blank');
        navigate('/', { replace: true });
      } else {
        showSuccess(`Welcome back, ${profile?.name || 'Hero'}!`);
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      console.error("Login submission error:", err);
      if (err.code === 'USER_NOT_REGISTERED' || err.message?.includes('Account not found')) {
        setAccountNotFoundError(true);
        showWarning("No account found! Please Sign Up first to create your account.");
      } else {
        showError(err.message || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Google Sign In Handler
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setAccountNotFoundError(false);
      const { user, profile } = await loginWithGoogle();

      if (profile?.role === 'admin' || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        showSuccess('Admin authorized via Google! Opening Admin Dashboard in a new tab...');
        window.open('/admin', '_blank');
        navigate('/', { replace: true });
      } else {
        showSuccess(`Signed in with Google! Welcome ${profile?.name || user?.displayName || 'Hero'}.`);
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        showError(err.message || 'Google sign in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Accent Bar */}
        <div className={`absolute top-0 inset-x-0 h-1.5 transition-colors duration-300 ${
          authTab === 'admin' 
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
            : 'bg-gradient-to-r from-red-600 to-rose-500'
        }`} />

        {/* Top Tab Switcher: General Sign In vs Dedicated Admin Portal */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthTab('user-donor');
              setAccountNotFoundError(false);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authTab === 'user-donor'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Donor & User Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthTab('admin');
              setAccountNotFoundError(false);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authTab === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-md mb-1 transition-all ${
            authTab === 'admin'
              ? 'bg-purple-600 shadow-purple-600/30'
              : 'bg-gradient-to-tr from-red-600 to-rose-500 shadow-red-500/25'
          }`}>
            {authTab === 'admin' ? (
              <Crown className="w-7 h-7" />
            ) : (
              <Droplet className="w-7 h-7 fill-current" />
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {authTab === 'admin' ? 'Administrator Login' : 'Sign In to Your Account'}
          </h1>
          <p className="text-xs text-slate-500">
            {authTab === 'admin' 
              ? 'Enter verified administrative credentials to unlock system controls.'
              : 'Choose your role and sign in with your email or Google account.'}
          </p>
        </div>

        {/* Role Preference Selector (for Donor & User Sign In) */}
        {authTab === 'user-donor' && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Sign In as:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRole('donor')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  selectedRole === 'donor'
                    ? 'border-red-600 bg-red-50/80 text-red-700 ring-2 ring-red-600/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Droplet className={`w-3.5 h-3.5 ${selectedRole === 'donor' ? 'fill-current text-red-600' : 'text-slate-400'}`} />
                <span>Blood Donor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('user')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  selectedRole === 'user'
                    ? 'border-red-600 bg-red-50/80 text-red-700 ring-2 ring-red-600/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${selectedRole === 'user' ? 'text-red-600' : 'text-slate-400'}`} />
                <span>Patient / Seeker</span>
              </button>
            </div>
          </div>
        )}

        {/* Account Not Found Alert Banner with 1-Click Sign Up */}
        {accountNotFoundError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 animate-fade-in">
            <div className="flex items-start gap-2.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Account Not Found: You haven't registered with this email yet.</span>
            </div>
            <p className="text-amber-800 text-[11px] pl-6.5">
              Please create an account first to join as a Voluntary Blood Donor or Patient Seeker.
            </p>
            <div className="pl-6.5 pt-1">
              <Link
                to={`/register?email=${encodeURIComponent(email)}&role=${selectedRole}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-xs hover:bg-red-700 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up as a {selectedRole === 'donor' ? 'Donor' : 'User'} Now</span>
              </Link>
            </div>
          </div>
        )}

        {/* 1-Click Google Sign In (for User / Donor tab) */}
        {authTab === 'user-donor' && (
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-3 transition shadow-xs disabled:opacity-50"
            >
              {googleLoading ? (
                <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                  Or with email & password
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>{authTab === 'admin' ? 'Admin Email *' : 'Email Address *'}</span>
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
                  setAccountNotFoundError(false);
                  if (touched.email) setErrors(validate());
                }}
                onBlur={() => handleBlur('email')}
                placeholder={authTab === 'admin' ? 'admin@gmail.com' : 'your.email@example.com'}
                className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  touched.email && errors.email
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                    : authTab === 'admin'
                    ? 'border-slate-200 focus:border-purple-600 focus:ring-purple-600/20'
                    : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
              <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                touched.email && errors.email ? 'text-red-400' : 'text-slate-400'
              }`} />
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
                className={`w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  touched.password && errors.password
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                    : authTab === 'admin'
                    ? 'border-slate-200 focus:border-purple-600 focus:ring-purple-600/20'
                    : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
              <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                touched.password && errors.password ? 'text-red-400' : 'text-slate-400'
              }`} />
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
            className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-98 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 ${
              authTab === 'admin'
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                : 'bg-red-600 hover:bg-red-700 shadow-red-600/25'
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {authTab === 'admin' 
                    ? 'Authorize & Open Admin Dashboard' 
                    : `Sign In as ${selectedRole === 'donor' ? 'Donor' : 'User'}`}
                </span>
                {authTab === 'admin' ? <ExternalLink className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Links */}
        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
          {authTab === 'user-donor' ? (
            <div className="space-y-1.5">
              <p>
                Don't have an account yet?{' '}
                <Link to="/register" className="font-bold text-red-600 hover:text-red-700 underline">
                  Create New Account (Sign Up)
                </Link>
              </p>
              <p className="text-[11px] text-slate-400">
                You can register as either a Voluntary Blood Donor or a Patient Seeker.
              </p>
            </div>
          ) : (
            <p>
              Return to{' '}
              <button
                onClick={() => setAuthTab('user-donor')}
                className="font-bold text-purple-700 hover:underline inline"
              >
                Donor & User Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
