import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  Bot,
  FileText,
  User,
  Calendar,
  Layers,
  Settings,
  Users,
  Clock,
  Building2,
  Wallet,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const links = {
    Patient: [
      { path: '/patient', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/patient/hospitals', label: 'Hospitals', icon: Building2 },
      { path: '/patient/doctors', label: 'Find Doctors', icon: Search },
      { path: '/patient/ai-assistant', label: 'AI Health Advisor', icon: Bot },
      { path: '/patient/medical-records', label: 'Medical History', icon: FileText },
      { path: '/patient/profile', label: 'My Profile', icon: User },
    ],
    Doctor: [
      { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/doctor/availability', label: 'Availability Slots', icon: Clock },
      { path: '/doctor/records', label: 'Medical Records', icon: FileText },
      { path: '/doctor/profile', label: 'My Profile', icon: User },
    ],
    Admin: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/approvals', label: 'Approvals Panel', icon: UserCheck },
      { path: '/admin/hospitals', label: 'Manage Hospitals', icon: Building2 },
      { path: '/admin/doctors', label: 'Manage Doctors', icon: Users },
      { path: '/admin/patients', label: 'Manage Patients', icon: User },
      { path: '/admin/departments', label: 'Manage Departments', icon: Layers },
      { path: '/admin/appointments', label: 'Manage Appointments', icon: Calendar },
      { path: '/admin/bills', label: 'Manage Payments', icon: Wallet },
      { path: '/admin/medical-records', label: 'Manage Records', icon: FileText },
    ],
  };

  const currentLinks = links[user.role] || [];

  return (
    <aside className="w-64 glass-panel border-r min-h-[calc(100vh-73px)] p-6 hidden md:flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-3">
          Medical Portal
        </span>
        <div className="flex flex-col gap-1">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-4 bg-brand-50/50 dark:bg-brand-950/10 rounded-2xl border border-brand-100/50 dark:border-brand-900/20 text-center">
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 block mb-1">
          Need Support?
        </span>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Contact administrative helpdesk for any clinic queries.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
