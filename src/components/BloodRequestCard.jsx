import React from 'react';
import { Phone, MessageCircle, MapPin, Building2, Droplet, Clock, CheckCircle2, Trash2 } from 'lucide-react';

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

  // Format relative timestamp
  const getFormattedTime = (dateVal) => {
    if (!dateVal) return 'Just now';
    const date = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Clean phone number for links
  const cleanPhone = (contactPhone || '').replace(/[^0-9+]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Hello, I saw your emergency request for ${requiredBloodGroup} blood for patient ${patientName} at ${hospitalName}, ${city}. I would like to assist.`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappMsg}`;

  // Urgency styling map
  const urgencyStyles = {
    Critical: {
      badge: 'bg-red-600 text-white animate-pulse',
      border: 'border-red-500 shadow-red-100',
      pill: 'bg-red-100 text-red-800 border-red-200',
      label: 'CRITICAL EMERGENCY'
    },
    Urgent: {
      badge: 'bg-amber-500 text-white',
      border: 'border-amber-400 shadow-amber-50',
      pill: 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'URGENT REQUIREMENT'
    },
    Normal: {
      badge: 'bg-blue-600 text-white',
      border: 'border-slate-200 shadow-slate-50',
      pill: 'bg-blue-50 text-blue-800 border-blue-200',
      label: 'STANDARD REQUEST'
    }
  };

  const style = urgencyStyles[urgencyLevel] || urgencyStyles.Normal;
  const isFulfilled = status === 'Fulfilled';

  return (
    <div className={`relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl ${isFulfilled ? 'opacity-70 border-slate-200 bg-slate-50/70' : `${style.border} shadow-md`}`}>
      {/* Top Banner Ribbon */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full ${style.badge}`}>
            {urgencyLevel === 'Critical' && <span className="inline-block w-2 h-2 rounded-full bg-white mr-1.5 animate-ping" />}
            {style.label}
          </span>
          {isFulfilled && (
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Fulfilled
            </span>
          )}
        </div>
        <div className="flex items-center text-xs text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5 mr-1" />
          {getFormattedTime(createdAt)}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {patientName}
            </h3>
            <div className="mt-2 space-y-1.5 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="font-medium text-slate-800 truncate">{hospitalName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">{city}</span>
              </div>
            </div>
          </div>

          {/* Blood Badge */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-md shadow-red-500/20 min-w-[76px]">
            <div className="flex items-center gap-0.5 text-xs font-semibold opacity-90">
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>Group</span>
            </div>
            <span className="text-2xl font-black tracking-tight">{requiredBloodGroup}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full mt-1">
              {unitsRequired} {unitsRequired > 1 ? 'Units' : 'Unit'}
            </span>
          </div>
        </div>

        {/* Patient Notes */}
        {notes && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
            "{notes}"
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {!isFulfilled ? (
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <a
                href={`tel:${cleanPhone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden xs:inline">WhatsApp</span>
              </a>
            </div>
          ) : (
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Donor matched successfully
            </div>
          )}

          {/* Owner options (Dashboard) */}
          {showActions && (
            <div className="flex items-center gap-2 ml-auto">
              {!isFulfilled && onMarkFulfilled && (
                <button
                  onClick={() => onMarkFulfilled(id)}
                  className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition"
                >
                  Mark Fulfilled
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                  title="Delete Request"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
