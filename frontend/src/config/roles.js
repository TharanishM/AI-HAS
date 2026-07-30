import { Heart, Shield, Stethoscope } from 'lucide-react';

export const ROLE_ORDER = ['Patient', 'Doctor', 'Admin'];

export const ROLE_THEMES = {
  Patient: {
    colorName: 'blue',
    primaryBg: 'bg-blue-500 hover:bg-blue-600',
    primaryText: 'text-blue-600 dark:text-blue-400',
    focusRing: 'focus:ring-blue-500/20 focus:border-blue-500',
    accentColor: 'accent-blue-500',
    shadow: 'shadow-blue-500/20 hover:shadow-blue-500/30',
    border: 'border-blue-500/20',
    glow: 'bg-blue-400/15',
    icon: Heart,
    title: 'Patient Portal',
    subtitle: 'Access your health records and book appointments',
    buttonText: 'Sign In as Patient',
    navActive: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20',
    navAccent: 'text-blue-600 dark:text-blue-400',
  },
  Doctor: {
    colorName: 'emerald',
    primaryBg: 'bg-emerald-500 hover:bg-emerald-600',
    primaryText: 'text-emerald-600 dark:text-emerald-400',
    focusRing: 'focus:ring-emerald-500/20 focus:border-emerald-500',
    accentColor: 'accent-emerald-500',
    shadow: 'shadow-emerald-500/20 hover:shadow-emerald-500/30',
    border: 'border-emerald-500/20',
    glow: 'bg-emerald-500/10',
    icon: Stethoscope,
    title: 'Doctor Portal',
    subtitle: 'Manage your consultations, patients, and schedule',
    buttonText: 'Sign In as Doctor',
    navActive: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    navAccent: 'text-emerald-600 dark:text-emerald-400',
  },
  Admin: {
    colorName: 'purple',
    primaryBg: 'bg-purple-600 hover:bg-purple-700',
    primaryText: 'text-purple-600 dark:text-purple-400',
    focusRing: 'focus:ring-purple-500/20 focus:border-purple-500',
    accentColor: 'accent-purple-500',
    shadow: 'shadow-purple-500/20 hover:shadow-purple-500/30',
    border: 'border-purple-500/20',
    glow: 'bg-purple-500/10',
    icon: Shield,
    title: 'Admin Portal',
    subtitle: 'System administration, reports, and clinical management',
    buttonText: 'Sign In as Admin',
    navActive: 'bg-purple-600 text-white shadow-lg shadow-purple-500/20',
    navAccent: 'text-purple-600 dark:text-purple-400',
  },
};

export const getRoleTheme = (role) => ROLE_THEMES[role] || ROLE_THEMES.Patient;
