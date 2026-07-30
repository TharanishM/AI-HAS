import React from 'react';
import { useAuth } from '../../context/AuthContext';
import PatientDashboard from '../patient/Dashboard';
import DoctorDashboard from '../doctor/DoctorDashboard';
import AdminDashboard from '../admin/AdminDashboard';
import { Activity } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Activity className="w-10 h-10 text-brand-500 animate-bounce" />
        <span className="text-sm text-slate-400 mt-2 font-medium">Loading Dashboard...</span>
      </div>
    );
  }

  if (!user) return null;

  switch (user.role) {
    case 'Patient':
      return <PatientDashboard />;
    case 'Doctor':
      return <DoctorDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="text-center p-8 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl border border-red-200">
          Unknown role: {user.role}. Please contact support.
        </div>
      );
  }
};

export default Dashboard;
