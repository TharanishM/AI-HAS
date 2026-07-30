import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Search, X, FileText, Save } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const AdminMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: ''
  });

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [recRes, patRes, docRes] = await Promise.all([
        API.get('/admin/medical-records'),
        API.get('/admin/patients'),
        API.get('/doctors')
      ]);

      if (recRes.data.success) setRecords(recRes.data.records);
      if (patRes.data.success) setPatients(patRes.data.patients);
      if (docRes.data.success) setDoctors(docRes.data.doctors);
    } catch (err) {
      addToast('Failed to load medical records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      patientId: '',
      doctorId: '',
      diagnosis: '',
      treatment: '',
      prescriptions: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      patientId: rec.patientId?.id || rec.patientId || '',
      doctorId: rec.doctorId?.id || rec.doctorId || '',
      diagnosis: rec.diagnosis || '',
      treatment: rec.treatment || '',
      prescriptions: Array.isArray(rec.prescriptions) ? rec.prescriptions.join(', ') : '',
      notes: rec.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) return;
    try {
      const res = await API.delete(`/admin/medical-records/${id}`);
      if (res.data.success) {
        addToast('Medical record deleted successfully.', 'success');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to delete medical record.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      addToast('Please select a patient and a doctor.', 'warning');
      return;
    }

    try {
      const payload = {
        ...formData,
        prescriptions: formData.prescriptions ? formData.prescriptions.split(',').map(s => s.trim()) : []
      };

      if (editingRecord) {
        const res = await API.put(`/admin/medical-records/${editingRecord.id}`, payload);
        if (res.data.success) {
          addToast('Medical record updated successfully!', 'success');
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await API.post('/admin/medical-records', payload);
        if (res.data.success) {
          addToast('Medical record created successfully!', 'success');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      addToast('Failed to save medical record.', 'error');
    }
  };

  const filteredRecords = records.filter(r => 
    (r.patientId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.doctorId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Medical Records</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, input, update and view clinical history, diagnoses and prescriptions.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Record
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
            placeholder="Search record by diagnosis, patient or doctor..."
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
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Diagnosis</th>
                <th className="px-6 py-4">Treatment</th>
                <th className="px-6 py-4">Prescriptions</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-6 py-4 font-bold text-slate-855 dark:text-white">{r.patientId?.name || 'Guest'}</td>
                  <td className="px-6 py-4">{r.doctorId?.name}</td>
                  <td className="px-6 py-4 font-semibold text-brand-500">{r.diagnosis}</td>
                  <td className="px-6 py-4 text-xs max-w-[200px] truncate">{r.treatment}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-indigo-500">
                    {Array.isArray(r.prescriptions) ? r.prescriptions.join(', ') : 'None'}
                  </td>
                  <td className="px-6 py-4 text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg text-rose-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-450">
                    No medical records found.
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
          <GlassCard className="w-full max-w-lg border border-white/20 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-850 dark:text-white flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-brand-500" /> {editingRecord ? 'Edit Clinical Record' : 'Add New Medical Record'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex flex-col gap-1">
                <label>Patient</label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  disabled={!!editingRecord}
                >
                  <option value="">Choose Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.userId?.id || p.userId}>{p.userId?.name || p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label>Attending Doctor</label>
                <select
                  required
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  disabled={!!editingRecord}
                >
                  <option value="">Choose Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.userId?.id || d.userId}>{d.user?.name || d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label>Diagnosis</label>
                <input
                  type="text"
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="e.g. Acute Viral Bronchitis"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>Treatment Plan</label>
                <input
                  type="text"
                  required
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="e.g. 5 days of rest, hydration, cough suppressants"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>Prescriptions (Comma separated)</label>
                <input
                  type="text"
                  value={formData.prescriptions}
                  onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="e.g. Paracetamol 650mg, Cough Syrup"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white min-h-[80px]"
                  placeholder="Additional patient observation details..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 mt-2"
              >
                <Save className="w-4 h-4" /> Save Record
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminMedicalRecords;
