import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Heart, 
  Droplet, 
  MapPin, 
  Phone, 
  Building2, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Activity,
  AlertCircle
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const OnboardingModal = () => {
  const { userProfile, updateUserData, showOnboardingModal, setShowOnboardingModal } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [roleType, setRoleType] = useState('donor'); // 'donor' | 'requester'
  const [formData, setFormData] = useState({
    bloodGroup: 'O+',
    city: '',
    phone: '',
    hospitalName: '',
    isDonor: true,
    isAvailable: true
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userProfile) {
      setFormData({
        bloodGroup: userProfile.bloodGroup || 'O+',
        city: userProfile.city || '',
        phone: userProfile.phone || '',
        hospitalName: userProfile.hospitalName || '',
        isDonor: userProfile.isDonor !== undefined ? userProfile.isDonor : true,
        isAvailable: userProfile.isAvailable !== undefined ? userProfile.isAvailable : true
      });
      if (userProfile.isDonor === false) {
        setRoleType('requester');
      }
    }
  }, [userProfile]);

  if (!showOnboardingModal) return null;

  const validate = () => {
    const errs = {};
    if (!formData.city.trim()) errs.city = 'City / Location is required';
    if (!formData.phone.trim()) errs.phone = 'Contact phone number is required';
    else if (formData.phone.replace(/[^0-9]/g, '').length < 7) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (roleType === 'requester' && !formData.hospitalName.trim()) {
      errs.hospitalName = 'Hospital or clinic name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showWarning('Please fill out all required fields to complete setup.');
      return;
    }

    try {
      setSaving(true);
      const isDonorFlag = roleType === 'donor';
      await updateUserData({
        bloodGroup: formData.bloodGroup,
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        hospitalName: formData.hospitalName ? formData.hospitalName.trim() : '',
        isDonor: isDonorFlag,
        isAvailable: isDonorFlag ? formData.isAvailable : false
      });

      showSuccess('Profile information saved! You are now live on BloodBridge.');
      setShowOnboardingModal(false);
    } catch (err) {
      showError(err.message || 'Failed to save profile information.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setShowOnboardingModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md shadow-red-500/20 mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Complete Your Profile
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please add your details so patients in emergencies and the community can reach you.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 mb-6">
          <button
            type="button"
            onClick={() => setRoleType('donor')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              roleType === 'donor'
                ? 'bg-white text-red-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplet className="w-4 h-4 text-red-600 fill-current" />
            <span>Blood Donor</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleType('requester')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              roleType === 'requester'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-slate-700" />
            <span>Patient / Seeker</span>
          </button>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Blood Group Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-red-500" />
              <span>{roleType === 'donor' ? 'My Blood Group *' : 'Needed Blood Group *'}</span>
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-hidden text-sm font-bold bg-white cursor-pointer"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>Blood Group {bg}</option>
              ))}
            </select>
          </div>

          {/* City / Location */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>City / Region *</span>
              {errors.city && (
                <span className="text-red-500 text-xs normal-case font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.city}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. New York, Brooklyn"
                className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  errors.city ? 'border-red-400 bg-red-50/20 focus:ring-red-500/20' : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
              <span>Contact Phone (For Emergency Contact) *</span>
              {errors.phone && (
                <span className="text-red-500 text-xs normal-case font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  errors.phone ? 'border-red-400 bg-red-50/20 focus:ring-red-500/20' : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Hospital Name (if requester) */}
          {roleType === 'requester' && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                <span>Hospital / Clinic Name *</span>
                {errors.hospitalName && (
                  <span className="text-red-500 text-xs normal-case font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.hospitalName}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  placeholder="e.g. Memorial General Hospital"
                  className={`w-full px-4 py-2.5 pl-10 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                    errors.hospitalName ? 'border-red-400 bg-red-50/20 focus:ring-red-500/20' : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                  }`}
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Availability Toggle (if donor) */}
          {roleType === 'donor' && (
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900">Available to Donate Immediately</p>
                <p className="text-[11px] text-emerald-700">Display green active status to seekers</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded-sm focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Profile Information</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
