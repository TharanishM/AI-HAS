import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Heart, User, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'Patient',
      title: 'Patient',
      description: 'Book appointments, view medical reports, and consult the AI health adviser.',
      icon: User,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'Doctor',
      title: 'Doctor',
      description: 'Manage your daily consultation schedule, update availability, and write prescriptions.',
      icon: Heart,
      color: 'from-brand-500 to-indigo-600',
      shadow: 'shadow-brand-500/20',
      bgLight: 'bg-brand-50 dark:bg-brand-950/20',
      iconColor: 'text-brand-500',
    },
    {
      id: 'Admin',
      title: 'Admin',
      description: 'Monitor hospital operations, manage departments, manage doctors, and view stats.',
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      bgLight: 'bg-amber-50 dark:bg-amber-950/20',
      iconColor: 'text-amber-500',
    },
  ];

  const handleSelect = (roleId) => {
    localStorage.setItem('selectedRole', roleId);
    navigate(`/login?role=${roleId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-brand-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20 px-6 py-12 relative overflow-hidden">
      {}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col items-center">
        {}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 bg-brand-500 rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl shadow-brand-500/30"
          >
            <Activity className="w-10 h-10" />
          </motion.div>
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight"
          >
            Hospital Appointment System
          </motion.h1>
          <motion.p
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium"
          >
            Please select your portal role to sign in to your dashboard
          </motion.p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => handleSelect(role.id)}
                className="cursor-pointer glass-panel p-8 rounded-3xl border border-white/40 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between items-center text-center relative overflow-hidden group"
              >
                {}
                <div className={`absolute -inset-2 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity blur-xl rounded-3xl`}></div>

                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl ${role.bgLight} flex items-center justify-center ${role.iconColor} mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                    {role.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                    {role.description}
                  </p>
                </div>

                <div className="mt-8 w-full">
                  <span className={`w-full py-3 bg-gradient-to-r ${role.color} text-white font-semibold rounded-xl inline-block shadow-lg ${role.shadow} transition-all duration-300 group-hover:brightness-105 text-sm`}>
                    Enter Portal
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
