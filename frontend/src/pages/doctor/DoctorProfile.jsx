import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API, { BACKEND_URL } from '../../services/api';
import { User, Phone, Briefcase, FileText, IndianRupee, Save, Upload, BookOpen } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

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

const DoctorProfile = () => {
  const { user, profile, updateProfile, setUser, loading } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Male',
    specialization: profile?.specialization || '',
    experience: profile?.experience || 0,
    fees: profile?.fees || 0,
    qualifications: formatArrayToString(profile?.qualifications),
    biography: profile?.biography || '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user || profile) {
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        gender: user?.gender || 'Male',
        specialization: profile?.specialization || '',
        experience: profile?.experience || 0,
        fees: profile?.fees || 0,
        qualifications: formatArrayToString(profile?.qualifications),
        biography: profile?.biography || '',
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
        experience: Number(formData.experience),
        fees: Number(formData.fees),
        qualifications: typeof formData.qualifications === 'string'
          ? formData.qualifications.split(',').map((q) => q.trim()).filter(Boolean)
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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Doctor Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage clinical metadata, specialization, fees, and patient-facing biography.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false} className="flex flex-col items-center text-center p-6">
            <div className="relative group">
              {user.avatar ? (
                <img
                  src={`${BACKEND_URL}${user.avatar}`}
                  alt={user.name}
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-brand-500/25"
                />
              ) : (
                <div className="w-28 h-28 bg-brand-100 dark:bg-brand-950 text-brand-500 rounded-3xl flex items-center justify-center font-bold text-4xl border-4 border-brand-500/10">
                  {user.name.charAt(0)}
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

            <h3 className="font-bold text-slate-850 dark:text-white mt-4 text-lg">{user.name}</h3>
            <span className="text-xs font-semibold text-brand-500 mt-1">{user.role}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{user.email}</span>

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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Medical Specialization</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                    placeholder="e.g. Heart Rhythm Management"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Experience (Years)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Consultation Fees (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center pointer-events-none">
                    <IndianRupee className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    name="fees"
                    value={formData.fees}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
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
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label>Qualifications (comma-separated)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                    <FileText className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white"
                    placeholder="e.g. MD - Harvard, FACC"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label>Biography / Doctor Summary</label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell patients about your clinical focus and background..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-800 dark:text-white resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full md:col-span-2 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 mt-4 disabled:opacity-50"
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

export default DoctorProfile;
