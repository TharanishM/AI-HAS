import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Activity } from 'lucide-react';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterDoctor from './pages/RegisterDoctor';

import PatientDashboard from './pages/patient/Dashboard';
import PatientDoctors from './pages/patient/Doctors';
import BookAppointment from './pages/patient/BookAppointment';
import AIAssistant from './pages/patient/AIAssistant';
import PatientMedicalRecords from './pages/patient/MedicalRecords';
import PatientProfile from './pages/patient/PatientProfile';
import Hospitals from './pages/patient/Hospitals';
import HospitalDetails from './pages/patient/HospitalDetails';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorProfile from './pages/doctor/DoctorProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminHospitals from './pages/admin/AdminHospitals';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminPatients from './pages/admin/AdminPatients';
import AdminBills from './pages/admin/AdminBills';
import AdminMedicalRecords from './pages/admin/AdminMedicalRecords';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/role-selection" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Patient') return <Navigate to="/patient" replace />;
    if (user.role === 'Doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/role-selection" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/role-selection" replace />;
  if (user.role === 'Patient') return <Navigate to="/patient" replace />;
  if (user.role === 'Doctor') return <Navigate to="/doctor" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/role-selection" replace />;
};

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  return (
    <Routes>
      {}
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-doctor" element={<RegisterDoctor />} />

      {}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <MainLayout>
              <PatientDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/hospitals"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <MainLayout>
              <Hospitals />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/hospitals/:hospitalId"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <MainLayout>
              <HospitalDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/doctors"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <MainLayout>
              <PatientDoctors />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book/:doctorId"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <MainLayout>
              <BookAppointment />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/ai-assistant"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <MainLayout>
              <AIAssistant />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/medical-records"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <MainLayout>
              <PatientMedicalRecords />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['Patient']}>
            <MainLayout>
              <PatientProfile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <MainLayout>
              <DoctorDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <MainLayout>
              <DoctorAvailability />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/records"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <MainLayout>
              <DoctorDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['Doctor']}>
            <MainLayout>
              <DoctorProfile />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hospitals"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminHospitals />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminDoctors />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminDepartments />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminAppointments />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminApprovals />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminPatients />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bills"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminBills />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/medical-records"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
              <AdminMedicalRecords />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white">
      <div className="relative flex flex-col items-center gap-4">
        {}
        <div className="absolute w-64 h-64 bg-brand-500/20 rounded-full blur-3xl -top-12 -left-12 animate-pulse"></div>
        <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -bottom-12 -right-12 animate-pulse"></div>
        
        {}
        <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-500/40 relative z-10 animate-bounce">
          <Activity className="w-12 h-12 text-white" />
        </div>
        
        {}
        <div className="text-center mt-4 relative z-10">
          <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-brand-400">
            HAS
          </h1>
          <p className="text-xs text-slate-400 font-semibold tracking-wider mt-2 uppercase">
            Hospital Appointment System
          </p>
        </div>
        
        {}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-6 relative z-10">
          <div className="h-full bg-brand-500 rounded-full" style={{
            width: '100%',
            transformOrigin: 'left',
            animation: 'loadProgress 2.5s ease-in-out forwards'
          }}></div>
        </div>
      </div>
      
      {}
      <style>{`
        @keyframes loadProgress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ToastProvider>
      <AuthProvider>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <Router>
            <AppContent />
          </Router>
        )}
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
