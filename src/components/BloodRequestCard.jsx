import React from 'react';
import { Phone, MessageCircle, MapPin, Building2, Droplet, Clock, CheckCircle2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';

export const BloodRequestCard = ({
  request,
  onMarkFulfilled,
  onDelete,
  isOwner = false,
  showActions = false
}) => {
  const {
    id,
    patientName,
    requiredBloodGroup,
    hospitalName,
    city,
    unitsRequired,
    urgencyLevel = 'Normal',
    contactPhone,
    notes,
    status = 'Active',
    createdAt
  } = request;

  const getFormattedTime = (dateVal) => {
    if (!dateVal) return 'Just now';
    const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const cleanPhone = (contactPhone || '').replace(/[^0-9+]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Hello, I saw your emergency blood request on BloodBridge for ${requiredBloodGroup} blood for ${patientName} at ${hospitalName}, ${city}. I would like to assist.`
  );
  const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${whatsappMsg}`;

  const urgencyConfig = {
    Critical: {
      badgeBg: 'bg-red-600',
      badgeText: 'text-white',
      borderAccent: 'border-l-red-600',
      label: 'Critical Priority',
      icon: AlertTriangle,
      pulse: true
    },
    Urgent: {
      badgeBg: 'bg-amber-500',
      badgeText: 'text-white',
      borderAccent: 'border-l-amber-500',
      label: 'Urgent Need',
      icon: Clock,
      pulse: false
    },
    Normal: {
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white',
      borderAccent: 'border-l-blue-500',
      label: 'Standard / Planned',
      icon: CheckCircle2,
      pulse: false
    }
  };

  const cfg = urgencyConfig[urgencyLevel] || urgencyConfig.Normal;
  const isFulfilled = status === 'Fulfilled';
  const UrgencyIcon = cfg.icon;

  return (
    <div
      className={`relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
        isFulfilled ? 'opacity-60 grayscale-[30%]' : ''
      }`}
    >
      <div>
        {/* Urgency ribbon Header */}
        <div className={`flex items-center justify-between px-4 py-2.5 ${
          isFulfilled 
            ? 'bg-slate-100 text-slate-600' 
            : urgencyLevel === 'Critical' 
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' 
              : urgencyLevel === 'Urgent' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <UrgencyIcon className={`w-3.5 h-3.5 ${cfg.pulse ? 'animate-pulse' : ''}`} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {isFulfilled ? 'Transfusion Fulfilled' : cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium opacity-90">
            <Clock className="w-3 h-3" />
            {getFormattedTime(createdAt)}
          </div>
        </div>

        <div className="p-5 sm:p-6 pb-4">
          {/* Patient Details & Blood Badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient</span>
              <h3 className="text-lg font-black text-slate-900 truncate">{patientName}</h3>
              
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Building2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="truncate">{hospitalName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{city}</span>
                </div>
              </div>
            </div>

            {/* Blood Badge */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-500/25">
              <Droplet className="w-3.5 h-3.5 fill-white/80 mb-0.5" />
              <span className="text-2xl font-black leading-none">{requiredBloodGroup}</span>
              <span className="text-[9px] font-extrabold mt-0.5 bg-white/25 px-1.5 py-0.5 rounded-full">
                {unitsRequired} {unitsRequired === 1 ? 'Unit' : 'Units'}
              </span>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed italic">
              "{notes}"
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-3.5 bg-slate-50/80 border-t border-slate-100">
        {isFulfilled ? (
          <div className="flex items-center justify-center gap-2 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Transfusion Complete</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Contact</span>
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

            {/* Owner controls */}
            {showActions && (
              <>
                {onMarkFulfilled && (
                  <button
                    onClick={() => onMarkFulfilled(id)}
                    className="px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition whitespace-nowrap"
                    title="Mark Request as Fulfilled"
                  >
                    ✓ Done
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(id)}
                    className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition flex-shrink-0"
                    title="Remove Request"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

