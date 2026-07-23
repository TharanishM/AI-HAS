import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, Calendar, Heart, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'O+',
    address: '',
  });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLocal(true);
    try {
      await register(formData);
      navigate('/patient');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-brand-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20 px-6 py-12 relative overflow-hidden">
      {}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-white/40 dark:border-slate-800/60"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Patient Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register to consult doctors, schedule visits, and access the AI Health Advisor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                placeholder="John Doe"
              />
            </div>
          </div>

          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                placeholder="john.doe@gmail.com"
              />
            </div>
          </div>

          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                placeholder="+1 555 0100"
              />
            </div>
          </div>

          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Date of Birth</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Calendar className="w-5 h-5" />
              </span>
              <input
                type="date"
                required
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Blood Group</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Heart className="w-5 h-5 text-rose-500" />
              </span>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Residential Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPin className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                placeholder="123 Medical Blvd, Health City"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full md:col-span-2 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 flex items-center justify-center gap-2 mt-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loadingLocal ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
