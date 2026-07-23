import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, MapPin, Phone, Clock, FileText, Upload, Star, HelpCircle } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { ListSkeleton } from '../../components/LoadingSkeleton';

const AdminHospitals = () => {
  const { addToast } = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    phone: '',
    email: '',
    emergencyContact: '',
    openingHours: '09:00 AM - 09:00 PM',
    rating: '5.0',
    latitude: '',
    longitude: '',
    departments: []
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const availableDepts = [
    'Cardiology',
    'Neurology',
    'Dermatology',
    'General Medicine',
    'Orthopedics',
    'Pulmonology',
    'Gastroenterology',
    'Ophthalmology',
    'Urology'
  ];

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await API.get('/hospitals');
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeptToggle = (dept) => {
    const prev = formData.departments;
    if (prev.includes(dept)) {
      setFormData({ ...formData, departments: prev.filter(d => d !== dept) });
    } else {
      setFormData({ ...formData, departments: [...prev, dept] });
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      phone: '',
      email: '',
      emergencyContact: '',
      openingHours: '09:00 AM - 09:00 PM',
      rating: '5.0',
      latitude: '',
      longitude: '',
      departments: []
    });
    setLogoFile(null);
    setBannerFile(null);
    setShowModal(true);
  };

  const openEditModal = (hosp) => {
    setEditingId(hosp.id);
    setFormData({
      name: hosp.name,
      description: hosp.description || '',
      address: hosp.address,
      city: hosp.city,
      state: hosp.state,
      pinCode: hosp.pinCode,
      phone: hosp.phone,
      email: hosp.email,
      emergencyContact: hosp.emergencyContact,
      openingHours: hosp.openingHours || '09:00 AM - 09:00 PM',
      rating: hosp.rating ? String(hosp.rating) : '5.0',
      latitude: hosp.latitude ? String(hosp.latitude) : '',
      longitude: hosp.longitude ? String(hosp.longitude) : '',
      departments: hosp.departments || []
    });
    setLogoFile(null);
    setBannerFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;
    try {
      const res = await API.delete(`/hospitals/${id}`);
      if (res.data.success) {
        addToast('Hospital deleted successfully', 'success');
        fetchHospitals();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error deleting hospital', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'departments') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      if (logoFile) data.append('logo', logoFile);
      if (bannerFile) data.append('banner', bannerFile);

      if (editingId) {
        const res = await API.put(`/hospitals/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          addToast('Hospital updated successfully', 'success');
          setShowModal(false);
          fetchHospitals();
        }
      } else {
        const res = await API.post('/hospitals', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          addToast('Hospital created successfully', 'success');
          setShowModal(false);
          fetchHospitals();
        }
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error saving hospital details', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Hospital Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, update, and manage clinics, addresses, and departments.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-500/20 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Hospital
        </button>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {hospitals.map((hosp) => (
            <GlassCard key={hosp.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950 rounded-xl overflow-hidden shrink-0 border border-brand-100 flex items-center justify-center">
                  {hosp.logo ? (
                    <img src={`http://localhost:5000${hosp.logo}`} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-extrabold text-brand-600 text-base">{hosp.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {hosp.name}
                    <span className="flex items-center gap-0.5 bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      ★ {hosp.rating.toFixed(1)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {hosp.address}, {hosp.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-0 pt-3 sm:pt-0">
                <button
                  onClick={() => openEditModal(hosp)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
                  title="Edit details"
                >
                  <Edit2 className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => handleDelete(hosp.id)}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl transition-all"
                  title="Remove hospital"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto p-8 border border-white/20">
            <div className="flex justify-between items-center pb-3 border-b dark:border-slate-800">
              <h2 className="font-extrabold text-xl text-slate-800 dark:text-white">
                {editingId ? 'Edit Hospital' : 'Add Hospital'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hospital Name</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="e.g. Apollo Hospital"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="contact@hospital.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleTextChange}
                    rows="2"
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white resize-none"
                    placeholder="Brief description about facilities..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Phone</label>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Emergency Number</label>
                  <input
                    type="text"
                    required
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white font-semibold text-rose-500"
                    placeholder="102 or emergency cell"
                  />
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-4 dark:border-slate-800">
                <div className="flex flex-col gap-1.5 md:col-span-4">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Address Line</label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="Street No, Building details"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">City</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="Chennai"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">State</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="Tamil Nadu"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">PIN Code</label>
                  <input
                    type="text"
                    required
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="600006"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Opening Hours</label>
                  <input
                    type="text"
                    required
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 dark:border-slate-800">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="e.g. 13.0601"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleTextChange}
                    className="px-4 py-2.5 rounded-xl glass-input text-xs text-slate-800 dark:text-white"
                    placeholder="e.g. 80.2505"
                  />
                </div>

                {}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Logo Image</label>
                  <input
                    type="file"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="text-xs text-slate-500"
                    accept="image/*"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Banner Image</label>
                  <input
                    type="file"
                    onChange={(e) => setBannerFile(e.target.files[0])}
                    className="text-xs text-slate-500"
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t pt-4 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Available Departments</span>
                <div className="grid grid-cols-3 gap-2">
                  {availableDepts.map(dept => (
                    <label key={dept} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.departments.includes(dept)}
                        onChange={() => handleDeptToggle(dept)}
                        className="rounded accent-brand-500"
                      />
                      <span>{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              {}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminHospitals;
