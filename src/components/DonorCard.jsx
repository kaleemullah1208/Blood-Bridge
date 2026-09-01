import React from 'react';
import { Phone, MessageCircle, MapPin, Droplets, ShieldCheck } from 'lucide-react';

export const DonorCard = ({ donor }) => {
  const {
    name,
    bloodGroup,
    city,
    phone,
    isAvailable = true,
    donationsCount = 0
  } = donor;

  const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Hello ${name}, I found your donor profile on BloodBridge. Are you available for a blood donation (${bloodGroup})?`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappMsg}`;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Top Banner with availability */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2.5 border transition">
              {isAvailable ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 bg-emerald-50">Available to Donate</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-slate-600 bg-slate-100">Currently Busy</span>
                </>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors">
              {name}
            </h3>

            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{city || 'Location unlisted'}</span>
            </div>
          </div>

          {/* Blood Group Badge */}
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white font-extrabold text-lg shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <span>{bloodGroup}</span>
          </div>
        </div>

        {/* Extra Donor details */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-red-500" />
            <span>{donationsCount > 0 ? `${donationsCount} Donations` : 'New Donor'}</span>
          </div>
          <div className="text-slate-400">
            Verified Volunteer
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
        {isAvailable ? (
          <>
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 active:scale-95 transition shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </>
        ) : (
          <div className="w-full text-center py-1.5 text-xs text-slate-400 font-medium italic">
            Donor is temporarily unavailable
          </div>
        )}
      </div>
    </div>
  );
};
