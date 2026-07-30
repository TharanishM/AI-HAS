import React, { useState, useEffect } from 'react';
import API, { BACKEND_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Plus, Star, ToggleLeft, ToggleRight, XCircle, Stethoscope, Briefcase, Mail, Lock, Phone, Building } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const AdminDoctors = () => {
  const { addToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
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
    qualifications: '',
    biography: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchDoctorsAndDepts = async () => {
    try {
      const docRes = await API.get('/doctors');
      const deptRes = await API.get('/departments');
      const hospRes = await API.get('/hospitals');

      if (docRes.data.success) setDoctors(docRes.data.doctors);
      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments);
        if (deptRes.data.departments.length > 0) {
          setForm((prev) => ({ ...prev, departmentId: deptRes.data.departments[0].id || deptRes.data.departments[0]._id }));
        }
      }
      if (hospRes.data.success) {
        setHospitals(hospRes.data.hospitals);
        if (hospRes.data.hospitals.length > 0) {
          setForm((prev) => ({ ...prev, hospitalId: hospRes.data.hospitals[0].id }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsAndDepts();
  }, []);

  const handleToggleStatus = async (doctor) => {
    try {
      const res = await API.put(`/admin/doctors/${doctor._id}/status`);
      if (res.data.success) {
        addToast(`Doctor status toggled successfully`, 'success');
        fetchDoctorsAndDepts();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error updating status', 'error');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.departmentId) {
      addToast('Please select a department', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
        fees: Number(form.fees),
        qualifications: form.qualifications.split(',').map(q => q.trim()).filter(q => q),
      };

      const res = await API.post('/admin/doctors', payload);
      if (res.data.success) {
        addToast('Doctor onboarding completed successfully!', 'success');
        setShowAddModal(false);
        setForm({
          name: '',
          email: '',
          password: '',
          phone: '',
          gender: 'Male',
          specialization: '',
          departmentId: departments[0]?._id || '',
          hospitalId: hospitals[0]?.id || '',
          experience: '',
          fees: '',
          qualifications: '',
          biography: '',
        });
        fetchDoctorsAndDepts();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error creating doctor account', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Physician Registry</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Register new physicians, configure clinical departments, and moderate doctor accounts.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-lg shadow-brand-500/20 text-xs"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <GlassCard hoverEffect={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Doctor</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Hospital</th>
                  <th className="pb-3">Specialization</th>
                  <th className="pb-3">Experience</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id} className="border-b border-slate-100/50 dark:border-slate-800/40 text-slate-650 dark:text-slate-400">
                    <td className="py-3 pl-2 font-semibold text-slate-850 dark:text-white flex items-center gap-2">
                      {doc.userId.avatar ? (
                        <img
                          src={`${BACKEND_URL}${doc.userId.avatar}`}
                          alt={doc.userId.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-brand-100 dark:bg-brand-950 text-brand-500 rounded-lg flex items-center justify-center font-bold">
                          {doc.userId.name.charAt(0)}
                        </div>
                      )}
                      Dr. {doc.userId.name}
                    </td>
                    <td className="py-3 font-medium text-slate-700 dark:text-slate-300">{doc.departmentId?.name}</td>
                    <td className="py-3 text-slate-500">{doc.hospital?.name || 'Unassigned'}</td>
                    <td className="py-3">{doc.specialization}</td>
                    <td className="py-3">{doc.experience} Years</td>
                    <td className="py-3 flex items-center gap-0.5 mt-2">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {doc.rating.toFixed(1)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          doc.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <button
                        onClick={() => handleToggleStatus(doc)}
                        className={`p-1.5 rounded-xl transition-all ${
                          doc.status === 'Active'
                            ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Toggle active status"
                      >
                        {doc.status === 'Active' ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] border border-white/20 dark:border-slate-800">
            <div className="flex justify-between items-center border-b pb-3 mb-5 dark:border-slate-805">
              <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center gap-1.5">
                <Stethoscope className="w-5 h-5 text-brand-500" /> Onboard Doctor Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
              {}
              <div className="flex flex-col gap-1.5">
                <label>Doctor Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Gregory House"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                />
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="house@hospital.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
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
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 99999 99999"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Department</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-855 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id || d._id} value={d.id || d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Assigned Hospital</label>
                <select
                  value={form.hospitalId}
                  onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-855 dark:text-white"
                >
                  <option value="">No Hospital Assignment</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Specialization Focus</label>
                <input
                  type="text"
                  required
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  placeholder="e.g. Diagnostic Pathology"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-855 dark:text-white"
                />
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
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="12"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-slate-855 dark:text-white"
                  />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Consultation Fees (₹)</label>
                <input
                  type="number"
                  required
                  value={form.fees}
                  onChange={(e) => setForm({ ...form, fees: e.target.value })}
                  placeholder="500"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-855 dark:text-white"
                />
              </div>

              {}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label>Qualifications (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={form.qualifications}
                  onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                  placeholder="e.g. MBBS, MD General Medicine, DNB Cardiology"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-855 dark:text-white"
                />
              </div>

              {}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label>Biography</label>
                <textarea
                  value={form.biography}
                  onChange={(e) => setForm({ ...form, biography: e.target.value })}
                  rows={3}
                  placeholder="Clinical research background details..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-855 dark:text-white resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:col-span-2 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirm Onboarding <Plus className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
