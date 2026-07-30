import {
  Bot,
  Building2,
  Calendar,
  Clock,
  FileText,
  Layers,
  LayoutDashboard,
  Search,
  User,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';

export const ROLE_NAVIGATION = {
  Patient: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/hospitals', label: 'Hospitals', icon: Building2 },
    { path: '/doctors', label: 'Find Doctors', icon: Search },
    { path: '/ai-assistant', label: 'AI Health Advisor', icon: Bot },
    { path: '/medical-records', label: 'Medical History', icon: FileText },
    { path: '/profile', label: 'My Profile', icon: User },
  ],
  Doctor: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/availability', label: 'Availability Slots', icon: Clock },
    { path: '/doctor/records', label: 'Medical Records', icon: FileText },
    { path: '/profile', label: 'My Profile', icon: User },
  ],
  Admin: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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

export const getRoleNavigation = (role) => ROLE_NAVIGATION[role] || [];
