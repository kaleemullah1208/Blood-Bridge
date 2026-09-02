import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createBloodRequest } from '../firebase/services';
import { 
  PlusCircle, 
  AlertCircle, 
  Droplet, 
  Building2, 
  MapPin, 
  Phone, 
  FileText, 
  Radio, 
  Sparkles,
  Heart
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = [
  { id: 'Critical', label: 'Critical (Immediate)', desc: 'Life-threatening / Surgery within hours', color: 'border-red-500 bg-red-50 text-red-700' },
  { id: 'Urgent', label: 'Urgent (Within 24h)', desc: 'Transfusion scheduled soon', color: 'border-amber-500 bg-amber-50 text-amber-700' },
  { id: 'Normal', label: 'Normal / Planned', desc: 'Elective or buffer requirement', color: 'border-blue-500 bg-blue-50 text-blue-700' }
];

export const PostRequestPage = () => {
  const { currentUser, userProfile } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    requiredBloodGroup: 'O+',
    hospitalName: '',
    city: userProfile?.city || '',
    unitsRequired: 1,
    urgencyLevel: 'Critical',
    contactPhone: userProfile?.phone || '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.patientName.trim()) errors.patientName = 'Patient name is required';
    if (!formData.hospitalName.trim()) errors.hospitalName = 'Hospital / Clinic name is required';
    if (!formData.city.trim()) errors.city = 'City / Location is required';
    if (!formData.contactPhone.trim()) {
      errors.contactPhone = 'Emergency contact number is required';
    } else if (formData.contactPhone.trim().length < 7) {
      errors.contactPhone = 'Please enter a valid phone number (at least 7 digits)';
    }
    if (!formData.unitsRequired || formData.unitsRequired < 1 || formData.unitsRequired > 20) {
      errors.unitsRequired = 'Units required must be between 1 and 20';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showWarning('Please fill in all mandatory fields.');
      return;
    }

    try {
      setSubmitting(true);
      const requestPayload = {
        ...formData,
        unitsRequired: Number(formData.unitsRequired),
        createdBy: currentUser?.uid || 'guest-' + Date.now(),
        createdByName: userProfile?.name || currentUser?.displayName || 'Emergency Seeker'
      };

      await createBloodRequest(requestPayload);
      showSuccess('Emergency Blood Request broadcasted live to all donors!');
      navigate('/');
    } catch (err) {
      console.error('Submission error:', err);
      showError(err.message || 'Failed to post blood request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
          <Radio className="w-3.5 h-3.5 animate-ping text-red-600" />
          <span>Broadcast Emergency Need</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Post an Emergency Blood Request
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Fill in the details below. Once posted, your request will be instantly visible to available donors in your city.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Patient Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Patient Full Name *</span>
                {validationErrors.patientName && (
                  <span className="text-red-500 text-xs normal-case">{validationErrors.patientName}</span>
                )}
              </label>
              <input
                type="text"
                name="patientName"
                placeholder="e.g. Johnathan Doe"
                value={formData.patientName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition focus:outline-hidden focus:ring-2 ${
                  validationErrors.patientName
                    ? 'border-red-400 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-red-500 focus:ring-red-500/20'
                }`}
              />
            </div>

            {/* Blood Group & Units Required Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-red-500" />
                  <span>Required Blood Group *</span>
                </label>
                <select
                  name="requiredBloodGroup"
                  value={formData.requiredBloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-bold bg-white transition cursor-pointer"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} Blood Type
                    </option>
                  ))}
                </select>
              </div>

              {/* Units Needed */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Units Needed (Bags) *
                </label>
                <input
                  type="number"
                  name="unitsRequired"
                  min="1"
                  max="20"
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-bold transition"
                />
              </div>
            </div>

            {/* Urgency Level Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Urgency Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {URGENCY_LEVELS.map((level) => {
                  const isSelected = formData.urgencyLevel === level.id;
                  return (
                    <button
                      type="button"
                      key={level.id}
                      onClick={() => setFormData(prev => ({ ...prev, urgencyLevel: level.id }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? `${level.color} border-2 shadow-xs scale-[1.02]`
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold">{level.label}</p>
                      <p className="text-[11px] opacity-80 mt-0.5">{level.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hospital Name & City Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hospital / Ward *</span>
                  </span>
                  {validationErrors.hospitalName && (
                    <span className="text-red-500 text-xs normal-case">{validationErrors.hospitalName}</span>
                  )}
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  placeholder="e.g. City General Hospital, ICU"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>City / Location *</span>
                  </span>
                  {validationErrors.city && (
                    <span className="text-red-500 text-xs normal-case">{validationErrors.city}</span>
                  )}
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. New York"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Attendant Contact Phone (For Donors to Call) *</span>
                </span>
                {validationErrors.contactPhone && (
                  <span className="text-red-500 text-xs normal-case">{validationErrors.contactPhone}</span>
                )}
              </label>
              <input
                type="tel"
                name="contactPhone"
                placeholder="e.g. +1 (555) 019-2834"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition"
              />
            </div>

            {/* Additional Medical Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Additional Notes / Condition (Optional)</span>
              </label>
              <textarea
                name="notes"
                rows="3"
                placeholder="e.g. Surgery at 3 PM today. Please reach out if you have O+ whole blood."
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm font-medium transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-xl shadow-red-600/30 hover:shadow-red-600/40 active:scale-98 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Broadcasting Request...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>Publish Emergency Blood Request</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
              <Sparkles className="w-4 h-4" />
              <span>Live Broadcast Preview</span>
            </div>
            <p className="text-xs text-slate-400">
              This is how your request will appear on the live community feed:
            </p>

            {/* Preview Box */}
            <div className="bg-white rounded-2xl p-5 text-slate-900 border-2 border-red-500 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-red-600 text-white">
                  {formData.urgencyLevel.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Just now</span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    {formData.patientName || 'Patient Name'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {formData.hospitalName || 'Hospital Name'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formData.city || 'City Location'}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-red-600 text-white font-black text-sm">
                  <span>{formData.requiredBloodGroup}</span>
                  <span className="text-[9px] opacity-90">{formData.unitsRequired}U</span>
                </div>
              </div>

              {formData.notes && (
                <p className="mt-3 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 italic">
                  "{formData.notes}"
                </p>
              )}
            </div>

            <div className="pt-2 text-xs text-slate-400 space-y-2 border-t border-slate-800">
              <p className="flex items-center gap-1.5 text-emerald-400">
                <Heart className="w-3.5 h-3.5 fill-current" />
                Broadcasts instantly across the platform.
              </p>
              <p>Direct phone inquiries will be routed to the contact number provided.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
