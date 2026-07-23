import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { User, Phone, MapPin, Calendar, Heart, Save, ShieldAlert, Upload } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const formatArrayToString = (val) => {
  if (!val) return '';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.join(', ');
      return val;
    } catch (e) {
      return val;
    }
  }
  return '';
};

const PatientProfile = () => {
  const { user, profile, updateProfile, setUser, loading } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Male',
    dateOfBirth: formatDateForInput(profile?.dateOfBirth),
    bloodGroup: profile?.bloodGroup || 'O+',
    address: profile?.address || '',
    allergies: formatArrayToString(profile?.allergies),
    medicalHistory: formatArrayToString(profile?.medicalHistory),
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user || profile) {
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        gender: user?.gender || 'Male',
        dateOfBirth: formatDateForInput(profile?.dateOfBirth),
        bloodGroup: profile?.bloodGroup || 'O+',
        address: profile?.address || '',
        allergies: formatArrayToString(profile?.allergies),
        medicalHistory: formatArrayToString(profile?.medicalHistory),
      });
    }
  }, [user, profile]);

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);

    setUploading(true);
    try {
      const res = await API.post('/auth/avatar', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setUser(res.data.user);
        addToast('Profile picture uploaded successfully', 'success');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        allergies: typeof formData.allergies === 'string'
          ? formData.allergies.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
        medicalHistory: typeof formData.medicalHistory === 'string'
          ? formData.medicalHistory.split(',').map((m) => m.trim()).filter(Boolean)
          : [],
      };

      await updateProfile(payload);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your personal details, emergency info, and medical history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false} className="flex flex-col items-center text-center p-6">
            <div className="relative group">
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                  alt={user?.name || 'User'}
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-brand-500/25"
                />
              ) : (
                <div className="w-28 h-28 bg-brand-100 dark:bg-brand-950 text-brand-500 rounded-3xl flex items-center justify-center font-bold text-4xl border-4 border-brand-500/10">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
              )}

              <label className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
                <Upload className="w-6 h-6 animate-pulse" />
              </label>
            </div>

            <h3 className="font-bold text-slate-850 dark:text-white mt-4 text-lg">{user?.name}</h3>
            <span className="text-xs font-semibold text-brand-500 mt-1">{user?.role}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{user?.email}</span>

            {uploading && (
              <span className="text-xs font-semibold text-brand-500 mt-2 animate-pulse">
                Uploading avatar...
              </span>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard hoverEffect={false}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-semibold text-slate-650 dark:text-slate-400">
              {}
              <div className="flex flex-col gap-1.5">
                <label>Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Date of Birth</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    required
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Blood Group</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-rose-500">
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </span>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Residential Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label>Allergies (comma-separated)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                  </span>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                    placeholder="e.g. Penicillin, Peanuts"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label>Chronic Conditions / Medical History (comma-separated)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <ShieldAlert className="w-4 h-4 text-brand-500" />
                  </span>
                  <input
                    type="text"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                    placeholder="e.g. Asthma, Hypertension"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full md:col-span-2 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 flex items-center justify-center gap-1.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Save Profile <Save className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
