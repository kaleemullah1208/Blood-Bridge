import React from 'react';
import { Users, Activity, HeartHandshake, Clock } from 'lucide-react';

export const StatsCounter = ({ totalDonors = 0, activeRequestsCount = 0, livesSaved = 1420 }) => {
  const stats = [
    {
      id: 'donors',
      label: 'Registered Donors',
      value: totalDonors > 0 ? totalDonors : '3,250+',
      icon: Users,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      description: 'Ready to respond'
    },
    {
      id: 'active-req',
      label: 'Active Emergencies',
      value: activeRequestsCount,
      icon: Activity,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-100',
      description: 'Needs urgent matching'
    },
    {
      id: 'lives',
      label: 'Lives Impacted',
      value: `${livesSaved.toLocaleString()}+`,
      icon: HeartHandshake,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      description: 'Successful transfusions'
    },
    {
      id: 'response',
      label: 'Avg. Match Speed',
      value: '< 15 Mins',
      icon: Clock,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      description: 'Real-time alert delivery'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            className="group relative overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3.5 rounded-2xl border ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                <IconComponent className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      })}
    </div>
  );
};
