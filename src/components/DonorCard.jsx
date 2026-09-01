import React from 'react';
import { Phone, MessageCircle, MapPin, Droplet, ShieldCheck, HeartHandshake, CheckCircle2, User } from 'lucide-react';

export const DonorCard = ({ donor }) => {
  const {
    name,
    bloodGroup,
    city,
    phone,
    isAvailable = true,
    donationsCount = 0,
    isVerified = true
  } = donor;

  const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Hello ${name}, I found your voluntary donor profile on BloodBridge. Are you available for a blood donation (${bloodGroup}) in ${city || 'our area'}?`
  );
  const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${whatsappMsg}`;

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-red-200 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Top Banner Accent */}
      <div className={`h-1.5 w-full ${isAvailable ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-200'}`} />

      <div className="p-5 sm:p-6 pb-4">
        {/* Header row with Avatar & Blood Group */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-base shadow-sm ${
              isAvailable 
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 shadow-red-500/20' 
                : 'bg-slate-400'
            }`}>
              {(name || 'D').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                  {name}
                </h3>
                {isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" title="Verified Volunteer" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{city || 'Location unlisted'}</span>
              </div>
            </div>
          </div>

          {/* Blood Type Badge */}
          <div className="flex flex-col items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white font-black text-lg shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="leading-none">{bloodGroup}</span>
            <span className="text-[9px] font-bold text-white/80 mt-0.5">Type</span>
          </div>
        </div>

        {/* Availability Badge & Stats */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isAvailable 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' 
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isAvailable ? 'Ready to Donate' : 'Currently Busy'}</span>
          </span>

          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-red-500 fill-current" />
            <span>{donationsCount > 0 ? `${donationsCount} Donations` : 'Volunteer'}</span>
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3.5 bg-slate-50/80 border-t border-slate-100">
        {isAvailable ? (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="w-full text-center py-2 text-xs font-semibold text-slate-400">
            ⏳ Temporarily unavailable for donations
          </div>
        )}
      </div>
    </div>
  );
};

