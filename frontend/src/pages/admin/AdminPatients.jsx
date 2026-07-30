import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Search, X, User, Save } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'O+',
    address: '',
    allergies: '',
    medicalHistory: ''
  });

  const { addToast } = useToast();

  const fetchPatients = async () => {
    try {
      const res = await API.get('/admin/patients');
      if (res.data.success) {
        setPatients(res.data.patients);
      }
    } catch (err) {
      addToast('Failed to fetch patients.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      dateOfBirth: '',
      bloodGroup: 'O+',
      address: '',
      allergies: '',
      medicalHistory: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (pat) => {
    setEditingPatient(pat);
    setFormData({
      name: pat.userId?.name || '',
      email: pat.userId?.email || '',
      phone: pat.userId?.phone || '',
      gender: pat.userId?.gender || 'Male',
      dateOfBirth: pat.dateOfBirth || '',
      bloodGroup: pat.bloodGroup || 'O+',
      address: pat.address || '',
      allergies: Array.isArray(pat.allergies) ? pat.allergies.join(', ') : '',
      medicalHistory: Array.isArray(pat.medicalHistory) ? pat.medicalHistory.join(', ') : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient? This action will permanently remove their user account.')) return;
    try {
      const res = await API.delete(`/admin/patients/${id}`);
      if (res.data.success) {
        addToast('Patient deleted successfully.', 'success');
        fetchPatients();
      }
    } catch (err) {
      addToast('Failed to delete patient.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map(s => s.trim()) : []
      };

      if (editingPatient) {
        const res = await API.put(`/admin/patients/${editingPatient.id}`, payload);
        if (res.data.success) {
          addToast('Patient profile updated successfully!', 'success');
          setShowModal(false);
          fetchPatients();
        }
      } else {
        const res = await API.post('/admin/patients', payload);
        if (res.data.success) {
          addToast('Patient profile created successfully!', 'success');
          setShowModal(false);
          fetchPatients();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save patient profile.', 'error');
    }
  };

  const filteredPatients = patients.filter(pat => 
    (pat.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pat.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pat.userId?.phone || '').includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Patients Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, update, and manage all registered patient profiles.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      <GlassCard className="p-4 border border-white/20">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient by name, email or phone..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
          />
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-panel overflow-x-auto border border-white/20 rounded-2xl">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-100/50 dark:bg-slate-900/50 text-xs text-slate-700 dark:text-slate-350 uppercase border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Birth Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredPatients.map(pat => (
                <tr key={pat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-white">
                    {pat.userId?.name}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs">{pat.userId?.email}</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">{pat.userId?.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-rose-500">{pat.bloodGroup}</td>
                  <td className="px-6 py-4">{pat.dateOfBirth}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(pat)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pat.id)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg text-rose-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-450">
                    No patients found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-2xl border border-white/20 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-850 dark:text-white flex items-center gap-1.5">
                <User className="w-5 h-5 text-brand-500" /> {editingPatient ? 'Edit Patient Profile' : 'Add New Patient'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex flex-col gap-1">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="Tharanish Kumar"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="tharanish@gmail.com"
                />
              </div>

              {!editingPatient && (
                <div className="flex flex-col gap-1">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                    placeholder="•••••••• (Default: patient123)"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label>Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="+91 99887 76655"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label>Date of Birth</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label>Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="22, Race Course Road, Coimbatore"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label>Allergies (Comma separated)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="Penicillin, Dust"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label>Medical History (Comma separated)</label>
                <input
                  type="text"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="Hypertension, Asthma"
                />
              </div>

              <button
                type="submit"
                className="w-full md:col-span-2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 mt-2"
              >
                <Save className="w-4 h-4" /> Save Patient
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
