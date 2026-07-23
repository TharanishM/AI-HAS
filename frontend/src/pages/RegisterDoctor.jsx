import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Phone, Heart, Award, Wallet, Clock, BookOpen, MapPin, Sparkles, Image, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    specialization: '',
    departmentId: '',
    hospitalId: '',
    experience: '',
    fees: '',
    biography: '',
    languages: [],
    availability: [],
    newHospitalName: '',
    newHospitalAddress: '',
    newHospitalCity: 'Coimbatore',
    newHospitalState: 'Tamil Nadu',
    newHospitalPinCode: '',
    newHospitalPhone: '',
    newHospitalEmail: '',
    newHospitalEmergencyContact: '',
    // Custom dept fields
    newDepartmentName: '',
    newDepartmentDescription: '',
  });

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [showCustomHospital, setShowCustomHospital] = useState(false);
  const [showCustomDepartment, setShowCustomDepartment] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const availableLanguages = ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu', 'Kannada'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [hospRes, deptRes] = await Promise.all([
          API.get('/hospitals'),
          API.get('/departments')
        ]);
        if (hospRes.data.success) setHospitals(hospRes.data.hospitals);
        if (deptRes.data.success) setDepartments(deptRes.data.departments);
      } catch (err) {
        addToast('Failed to load hospitals or departments.', 'error');
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHospitalChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setShowCustomHospital(true);
      setFormData({ ...formData, hospitalId: '', newHospitalName: '' });
    } else {
      setShowCustomHospital(false);
      setFormData({ ...formData, hospitalId: val, newHospitalName: '' });
    }
  };

  const handleDepartmentChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setShowCustomDepartment(true);
      setFormData({ ...formData, departmentId: '', newDepartmentName: '' });
    } else {
      setShowCustomDepartment(false);
      setFormData({ ...formData, departmentId: val, newDepartmentName: '' });
    }
  };

  const handleLanguageToggle = (lang) => {
    const current = [...formData.languages];
    if (current.includes(lang)) {
      setFormData({ ...formData, languages: current.filter(l => l !== lang) });
    } else {
      setFormData({ ...formData, languages: [...current, lang] });
    }
  };

  const handleDayToggle = (day) => {
    const current = [...formData.availability];
    const exists = current.find(d => d.day === day);
    if (exists) {
      setFormData({ ...formData, availability: current.filter(d => d.day !== day) });
    } else {
      setFormData({
        ...formData,
        availability: [
          ...current,
          { day, slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] }
        ]
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showCustomHospital && !formData.hospitalId) {
      addToast('Please select a hospital or add a new one.', 'warning');
      return;
    }
    if (!showCustomDepartment && !formData.departmentId) {
      addToast('Please select a department or add a new one.', 'warning');
      return;
    }

    setLoadingLocal(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'languages' || key === 'availability') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const res = await API.post('/auth/register-doctor', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        addToast('Registration submitted! Awaiting Admin Approval.', 'success');
        navigate('/login?role=Doctor');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-brand-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20 px-6 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-white/40 dark:border-slate-800/60"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor Portal Registration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Join the Coimbatore multispeciality hospital network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-white rounded-xl transition-all border border-slate-200 dark:border-slate-800">
              Upload Profile Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
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
                  placeholder="Dr. Rajesh Kumar"
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="dr.rajesh@hospital.com"
                />
              </div>
            </div>
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

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number (Indian)</label>
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
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Gender */}
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

            {/* Specialization */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Specialization</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Award className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                  placeholder="Interventional Cardiology"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Experience (Years)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Award className="w-5 h-5 text-emerald-500" />
                </span>
                <input
                  type="number"
                  required
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Consultation Fees */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Consultation Fees (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                  placeholder="500"
                />
              </div>
            </div>

            {/* Hospital assignment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hospital</label>
              <select
                name="hospitalId"
                value={formData.hospitalId || (showCustomHospital ? 'new' : '')}
                onChange={handleHospitalChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
              >
                <option value="">Select Hospital</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
                <option value="new">+ Add New Hospital (Requires Approval)</option>
              </select>
            </div>

            {/* Department assignment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Department</label>
              <select
                name="departmentId"
                value={formData.departmentId || (showCustomDepartment ? 'new' : '')}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
                <option value="new">+ Add New Department (Requires Approval)</option>
              </select>
            </div>
          </div>

          {/* Conditional Hospital fields */}
          <AnimatePresence>
            {showCustomHospital && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-brand-500/30 bg-brand-500/5 p-5 rounded-2xl flex flex-col gap-4"
              >
                <h4 className="text-sm font-bold text-brand-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Add New Hospital Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    name="newHospitalName"
                    value={formData.newHospitalName}
                    onChange={handleChange}
                    placeholder="New Hospital Name"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    name="newHospitalAddress"
                    value={formData.newHospitalAddress}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    name="newHospitalPhone"
                    value={formData.newHospitalPhone}
                    onChange={handleChange}
                    placeholder="Hospital Phone Number"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="email"
                    required
                    name="newHospitalEmail"
                    value={formData.newHospitalEmail}
                    onChange={handleChange}
                    placeholder="Hospital Email"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    name="newHospitalPinCode"
                    value={formData.newHospitalPinCode}
                    onChange={handleChange}
                    placeholder="Pin Code (e.g. 641018)"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    name="newHospitalEmergencyContact"
                    value={formData.newHospitalEmergencyContact}
                    onChange={handleChange}
                    placeholder="Emergency Contact"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conditional Dept fields */}
          <AnimatePresence>
            {showCustomDepartment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-brand-500/30 bg-brand-500/5 p-5 rounded-2xl flex flex-col gap-4"
              >
                <h4 className="text-sm font-bold text-brand-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Add New Department Details
                </h4>
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    required
                    name="newDepartmentName"
                    value={formData.newDepartmentName}
                    onChange={handleChange}
                    placeholder="New Department Name"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <textarea
                    required
                    name="newDepartmentDescription"
                    value={formData.newDepartmentDescription}
                    onChange={handleChange}
                    placeholder="Department Description..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white min-h-[80px]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Qualifications & Biography */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Qualifications (Comma Separated)</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="MBBS, MD - General Medicine, DM - Cardiology"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Biography</label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                placeholder="Write a short description about your experience, achievements, and specialized treatments..."
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white min-h-[100px]"
              />
            </div>
          </div>

          {/* Languages spoken */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Languages Spoken</label>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map(lang => {
                const selected = formData.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageToggle(lang)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selected
                        ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                        : 'border-slate-350 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Available Consulting Days</label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => {
                const selected = formData.availability.some(d => d.day === day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selected
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                        : 'border-slate-350 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 flex items-center justify-center gap-2 mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loadingLocal ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Submit Registration Request'
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Already have a doctor account?{' '}
          <Link
            to="/login?role=Doctor"
            className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterDoctor;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Phone, Heart, Award, Wallet, Clock, BookOpen, MapPin, Sparkles, Image, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    specialization: '',
    departmentId: '',
    hospitalId: '',
    experience: '',
    fees: '',
    biography: '',
    languages: [],
    availability: [],
    // Custom hospital fields
    newHospitalName: '',
    newHospitalAddress: '',
    newHospitalCity: 'Coimbatore',
    newHospitalState: 'Tamil Nadu',
    newHospitalPinCode: '',
    newHospitalPhone: '',
    newHospitalEmail: '',
    newHospitalEmergencyContact: '',
    // Custom dept fields
    newDepartmentName: '',
    newDepartmentDescription: '',
  });

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [showCustomHospital, setShowCustomHospital] = useState(false);
  const [showCustomDepartment, setShowCustomDepartment] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const availableLanguages = ['Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu', 'Kannada'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [hospRes, deptRes] = await Promise.all([
          API.get('/hospitals'),
          API.get('/departments')
        ]);
        if (hospRes.data.success) setHospitals(hospRes.data.hospitals);
        if (deptRes.data.success) setDepartments(deptRes.data.departments);
      } catch (err) {
        addToast('Failed to load hospitals or departments.', 'error');
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHospitalChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setShowCustomHospital(true);
      setFormData({ ...formData, hospitalId: '', newHospitalName: '' });
    } else {
      setShowCustomHospital(false);
      setFormData({ ...formData, hospitalId: val, newHospitalName: '' });
    }
  };

  const handleDepartmentChange = (e) => {
    const val = e.target.value;
    if (val === 'new') {
      setShowCustomDepartment(true);
      setFormData({ ...formData, departmentId: '', newDepartmentName: '' });
    } else {
      setShowCustomDepartment(false);
      setFormData({ ...formData, departmentId: val, newDepartmentName: '' });
    }
  };

  const handleLanguageToggle = (lang) => {
    const current = [...formData.languages];
    if (current.includes(lang)) {
      setFormData({ ...formData, languages: current.filter(l => l !== lang) });
    } else {
      setFormData({ ...formData, languages: [...current, lang] });
    }
  };

  const handleDayToggle = (day) => {
    const current = [...formData.availability];
    const exists = current.find(d => d.day === day);
    if (exists) {
      setFormData({ ...formData, availability: current.filter(d => d.day !== day) });
    } else {
      setFormData({
        ...formData,
        availability: [
          ...current,
          { day, slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] }
        ]
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showCustomHospital && !formData.hospitalId) {
      addToast('Please select a hospital or add a new one.', 'warning');
      return;
    }
    if (!showCustomDepartment && !formData.departmentId) {
      addToast('Please select a department or add a new one.', 'warning');
      return;
    }

    setLoadingLocal(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'languages' || key === 'availability') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }

      const res = await API.post('/auth/register-doctor', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        addToast('Registration submitted! Awaiting Admin Approval.', 'success');
        navigate('/login?role=Doctor');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-brand-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/20 px-6 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl glass-panel p-8 rounded-3xl shadow-2xl relative z-10 border border-white/40 dark:border-slate-800/60"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor Portal Registration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Join the Coimbatore multispeciality hospital network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-900">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-white rounded-xl transition-all border border-slate-200 dark:border-slate-800">
              Upload Profile Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
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
                  placeholder="Dr. Rajesh Kumar"
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="dr.rajesh@hospital.com"
                />
              </div>
            </div>

            {/* Password */}
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

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number (Indian)</label>
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
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Gender */}
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

            {/* Specialization */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Specialization</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Award className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                  placeholder="Interventional Cardiology"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Experience (Years)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Award className="w-5 h-5 text-emerald-500" />
                </span>
                <input
                  type="number"
                  required
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Consultation Fees */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Consultation Fees (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
                  placeholder="500"
                />
              </div>
            </div>

            {/* Hospital assignment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hospital</label>
              <select
                name="hospitalId"
                value={formData.hospitalId || (showCustomHospital ? 'new' : '')}
                onChange={handleHospitalChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
              >
                <option value="">Select Hospital</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
                <option value="new">+ Add New Hospital (Requires Approval)</option>
              </select>
            </div>

            {/* Department assignment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Department</label>
              <select
                name="departmentId"
                value={formData.departmentId || (showCustomDepartment ? 'new' : '')}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
                <option value="new">+ Add New Department (Requires Approval)</option>
              </select>
            </div>
          </div>

          {/* Conditional Hospital fields */}
          <AnimatePresence>
            {showCustomHospital && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-brand-500/30 bg-brand-500/5 p-5 rounded-2xl flex flex-col gap-4"
              >
                <h4 className="text-sm font-bold text-brand-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Add New Hospital Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    name="newHospitalName"
                    value={formData.newHospitalName}
                    onChange={handleChange}
                    placeholder="New Hospital Name"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    name="newHospitalAddress"
                    value={formData.newHospitalAddress}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    name="newHospitalPhone"
                    value={formData.newHospitalPhone}
                    onChange={handleChange}
                    placeholder="Hospital Phone Number"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="email"
                    required
                    name="newHospitalEmail"
                    value={formData.newHospitalEmail}
                    onChange={handleChange}
                    placeholder="Hospital Email"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    name="newHospitalPinCode"
                    value={formData.newHospitalPinCode}
                    onChange={handleChange}
                    placeholder="Pin Code (e.g. 641018)"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    name="newHospitalEmergencyContact"
                    value={formData.newHospitalEmergencyContact}
                    onChange={handleChange}
                    placeholder="Emergency Contact"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conditional Dept fields */}
          <AnimatePresence>
            {showCustomDepartment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-brand-500/30 bg-brand-500/5 p-5 rounded-2xl flex flex-col gap-4"
              >
                <h4 className="text-sm font-bold text-brand-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Add New Department Details
                </h4>
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    required
                    name="newDepartmentName"
                    value={formData.newDepartmentName}
                    onChange={handleChange}
                    placeholder="New Department Name"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                  <textarea
                    required
                    name="newDepartmentDescription"
                    value={formData.newDepartmentDescription}
                    onChange={handleChange}
                    placeholder="Department Description..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white min-h-[80px]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Qualifications & Biography */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Qualifications (Comma Separated)</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="MBBS, MD - General Medicine, DM - Cardiology"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Biography</label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                placeholder="Write a short description about your experience, achievements, and specialized treatments..."
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-800 dark:text-white min-h-[100px]"
              />
            </div>
          </div>

          {/* Languages spoken */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Languages Spoken</label>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map(lang => {
                const selected = formData.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageToggle(lang)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selected
                        ? 'bg-brand-500 border-brand-500 text-white shadow-md'
                        : 'border-slate-350 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Available Consulting Days</label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(day => {
                const selected = formData.availability.some(d => d.day === day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selected
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-md'
                        : 'border-slate-350 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 flex items-center justify-center gap-2 mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loadingLocal ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Submit Registration Request'
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          Already have a doctor account?{' '}
          <Link
            to="/login?role=Doctor"
            className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterDoctor;
