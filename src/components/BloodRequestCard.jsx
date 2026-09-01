import React from 'react';
import { Phone, MessageCircle, MapPin, Building2, Droplet, Clock, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';

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
    `Hello, I saw your emergency request for ${requiredBloodGroup} blood for ${patientName} at ${hospitalName}, ${city}. I would like to help.`
  );
  // Remove leading + for WhatsApp URL
  const waNumber = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${whatsappMsg}`;

  const urgencyConfig = {
    Critical: {
      badgeBg: 'bg-red-600',
      badgeText: 'text-white',
      borderAccent: 'border-l-red-500',
      label: 'Critical',
      icon: AlertTriangle,
      ringColor: 'ring-red-100',
      pulse: true
    },
    Urgent: {
      badgeBg: 'bg-amber-500',
      badgeText: 'text-white',
      borderAccent: 'border-l-amber-400',
      label: 'Urgent',
      icon: Clock,
      ringColor: 'ring-amber-50',
      pulse: false
    },
    Normal: {
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white',
      borderAccent: 'border-l-blue-400',
      label: 'Planned',
      icon: CheckCircle2,
      ringColor: 'ring-slate-50',
      pulse: false
    }
  };

  const cfg = urgencyConfig[urgencyLevel] || urgencyConfig.Normal;
  const isFulfilled = status === 'Fulfilled';
  const UrgencyIcon = cfg.icon;

  return (
    <div
      className={`relative bg-white rounded-2xl border border-l-4 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        isFulfilled
          ? 'opacity-60 border-slate-200 border-l-slate-300'
          : `border-slate-200 ${cfg.borderAccent}`
      }`}
    >
      {/* Urgency ribbon */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${isFulfilled ? 'bg-slate-50' : urgencyLevel === 'Critical' ? 'bg-red-600' : urgencyLevel === 'Urgent' ? 'bg-amber-500' : 'bg-blue-600'}`}>
        <div className="flex items-center gap-2">
          <UrgencyIcon className={`w-3.5 h-3.5 ${isFulfilled ? 'text-slate-400' : 'text-white'} ${cfg.pulse ? 'animate-pulse' : ''}`} />
          <span className={`text-[11px] font-extrabold uppercase tracking-widest ${isFulfilled ? 'text-slate-400' : 'text-white'}`}>
            {isFulfilled ? 'Fulfilled' : cfg.label}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-medium ${isFulfilled ? 'text-slate-400' : 'text-white/80'}`}>
          <Clock className="w-3 h-3" />
          {getFormattedTime(createdAt)}
        </div>
      </div>

      <div className="p-5">
        {/* Patient row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">{patientName}</h3>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate font-medium">{hospitalName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{city}</span>
              </div>
            </div>
          </div>

          {/* Blood badge */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-lg shadow-red-500/25">
            <Droplet className="w-3.5 h-3.5 fill-white/60 mb-0.5" />
            <span className="text-2xl font-black leading-none">{requiredBloodGroup}</span>
            <span className="text-[9px] font-bold mt-0.5 bg-white/20 px-1.5 py-0.5 rounded-full">
              {unitsRequired}U
            </span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic leading-relaxed">
            "{notes}"
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100">
          {isFulfilled ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Donor matched — transfusion arranged
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold active:scale-95 transition shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Now
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>

              {/* Owner controls */}
              {showActions && (
                <>
                  {onMarkFulfilled && (
                    <button
                      onClick={() => onMarkFulfilled(id)}
                      className="px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition whitespace-nowrap"
                    >
                      ✓ Fulfilled
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(id)}
                      className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition flex-shrink-0"
                      title="Delete request"
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
    </div>
  );
};
