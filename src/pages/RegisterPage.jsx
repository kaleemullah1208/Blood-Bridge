import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Droplet, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff, 
  HeartHandshake, 
  ArrowRight, 
  AlertCircle,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') === 'user' ? 'user' : 'donor'); // 'donor' | 'user'
  const [name, setName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [city, setCity] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { register, loginWithGoogle } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
    const roleParam = searchParams.get('role');
    if (roleParam === 'user' || roleParam === 'donor') setRole(roleParam);
  }, [searchParams]);

  const validate = () => {
    const newErrors = {};

    if (!name || !name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!email || !email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!phone || !phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!city || !city.trim()) {
      newErrors.city = 'City / Location is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      city: true,
      password: true,
      confirmPassword: true
    });

    const validationResult = validate();
    setErrors(validationResult);

    if (Object.keys(validationResult).length > 0) {
      const missingFields = Object.keys(validationResult);
      showWarning(`Please fill out required fields properly (${missingFields.join(', ')})`);
      return;
    }

    try {
      setLoading(true);
      const { profile } = await register(email, password, {
        name,
        phone,
        bloodGroup,
        city,
        hospitalName: role === 'user' ? hospitalName : '',
        role: role
      });

      if (profile?.role === 'admin' || email.trim().toLowerCase() === 'admin@gmail.com') {
        showSuccess('Administrator account registered! Welcome to the Admin Console.');
        navigate('/admin');
      } else {
        showSuccess(`Account registered as ${role === 'donor' ? 'Voluntary Blood Donor' : 'Patient / Seeker'}! Welcome to your dashboard.`);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Registration error:", err);
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      const { user, profile } = await loginWithGoogle();
      if (profile?.role === 'admin' || user?.email?.toLowerCase() === 'admin@gmail.com') {
        showSuccess("Admin authorized via Google! Welcome to the Admin Console.");
        navigate('/admin');
      } else {
        showSuccess(`Signed up with Google! Welcome to your dashboard, ${profile?.name || user?.displayName || 'Hero'}.`);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Google sign up error:", err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        showError(err.message || 'Google sign up failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 bg-white rounded-3xl p-7 sm:p-10 border border-slate-200 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/25 mb-1">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign up as a Voluntary Donor or Patient / Seeker
          </p>
        </div>

        {/* 1-Click Google Sign Up */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                Or choose your account type
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Registration Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Select Account Role *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 relative ${
                role === 'donor'
                  ? 'border-red-600 bg-red-50/70 text-red-950 ring-2 ring-red-600/25'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${role === 'donor' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                <Droplet className="w-4 h-4 fill-current" />
              </div>
              <div>
                <p className="font-bold text-xs flex items-center gap-1">
                  <span>Sign Up as Donor</span>
                  {role === 'donor' && <CheckCircle2 className="w-3.5 h-3.5 text-red-600 inline" />}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  I want to donate blood and help patients in emergencies
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('user')}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 relative ${
                role === 'user'
                  ? 'border-red-600 bg-red-50/70 text-red-950 ring-2 ring-red-600/25'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${role === 'user' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs flex items-center gap-1">
                  <span>Sign Up as User</span>
                  {role === 'user' && <CheckCircle2 className="w-3.5 h-3.5 text-red-600 inline" />}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  I need blood for a patient or emergency hospital care
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Full Name *</span>
              {touched.name && errors.name && (
                <span className="text-red-500 text-xs normal-case font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) setErrors(validate());
                }}
                onBlur={() => handleBlur('name')}
                placeholder="e.g. Sarah Jenkins"
                className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  touched.name && errors.name
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
              <User className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${touched.name && errors.name ? 'text-red-400' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Email Address *</span>
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
                className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  touched.email && errors.email
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                    : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
              <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${touched.email && errors.email ? 'text-red-400' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Blood Group & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {role === 'donor' ? 'Donor Blood Group *' : 'Preferred Blood Group *'}
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white text-slate-900 focus:border-red-500 focus:outline-hidden cursor-pointer"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>Blood Group {bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                <span>Contact Phone *</span>
                {touched.phone && errors.phone && (
                  <span className="text-red-500 text-xs normal-case font-semibold">
                    Required
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (touched.phone) setErrors(validate());
                  }}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                    touched.phone && errors.phone
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                  }`}
                />
                <Phone className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${touched.phone && errors.phone ? 'text-red-400' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>

          {/* City & Hospital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                <span>City / Location *</span>
                {touched.city && errors.city && (
                  <span className="text-red-500 text-xs normal-case font-semibold">
                    Required
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (touched.city) setErrors(validate());
                  }}
                  onBlur={() => handleBlur('city')}
                  placeholder="e.g. New York, NY"
                  className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                    touched.city && errors.city
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                  }`}
                />
                <MapPin className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${touched.city && errors.city ? 'text-red-400' : 'text-slate-400'}`} />
              </div>
            </div>

            {role === 'user' ? (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Hospital / Clinic (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Memorial Hospital"
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 text-sm font-medium focus:border-red-500 focus:outline-hidden"
                  />
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            ) : (
              <div className="space-y-1 flex flex-col justify-end">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  ✅ Registered as active voluntary blood donor in your region.
                </div>
              </div>
            )}
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                <span>Password *</span>
                {touched.password && errors.password && (
                  <span className="text-red-500 text-xs normal-case font-semibold">
                    Min 6 chars
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
                  className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                    touched.password && errors.password
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                  }`}
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                <span>Confirm Password *</span>
                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="text-red-500 text-xs normal-case font-semibold">
                    Mismatch
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (touched.confirmPassword) setErrors(validate());
                  }}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pl-10 pr-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                    touched.confirmPassword && errors.confirmPassword
                      ? 'border-red-400 bg-red-50/30 focus:ring-red-500/30 focus:border-red-500'
                      : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                  }`}
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/25 active:scale-98 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete {role === 'donor' ? 'Donor' : 'User'} Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="pt-2 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-red-600 hover:text-red-700 underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
