import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Layers, Plus, ToggleLeft, ToggleRight, XCircle, FileText, Heart, Activity } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const AdminDepartments = () => {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'Activity',
  });
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments/all');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleToggleStatus = async (dept) => {
    try {
      const res = await API.delete(`/departments/${dept._id}`);
      if (res.data.success) {
        addToast(`Department status changed successfully`, 'success');
        fetchDepartments();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error updating status', 'error');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      addToast('Please fill all fields', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await API.post('/departments', form);
      if (res.data.success) {
        addToast('Department created successfully!', 'success');
        setShowAddModal(false);
        setForm({ name: '', description: '', icon: 'Activity' });
        fetchDepartments();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error creating department', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-500" /> Manage Departments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Create medical departments, configure clinical descriptions, and manage operational status.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/10"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <GlassCard hoverEffect={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 font-semibold">
                  <th className="pb-3">Department Name</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept._id} className="border-b border-slate-100/50 dark:border-slate-800/40 text-slate-655 dark:text-slate-400">
                    <td className="py-3 font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <div className="p-1.5 bg-brand-50 text-brand-500 dark:bg-brand-950/20 dark:text-brand-400 rounded-lg">
                        <Activity className="w-4 h-4" />
                      </div>
                      {dept.name}
                    </td>
                    <td className="py-3 max-w-[300px] truncate">{dept.description}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          dept.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {dept.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(dept)}
                        className={`p-1.5 rounded-xl transition-all ${
                          dept.status === 'Active'
                            ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Toggle active status"
                      >
                        {dept.status === 'Active' ? (
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
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800">
            <div className="flex justify-between items-center border-b pb-3 mb-5 dark:border-slate-805">
              <h3 className="font-bold text-base text-slate-850 dark:text-white flex items-center gap-1.5">
                <Layers className="w-5 h-5 text-brand-500" /> Create Department
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
              {}
              <div className="flex flex-col gap-1.5">
                <label>Department Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Pulmonology"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                />
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Theme Icon Name</label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                >
                  <option value="Activity">Activity</option>
                  <option value="Heart">Heart</option>
                  <option value="Brain">Brain</option>
                  <option value="Wind">Wind</option>
                  <option value="Eye">Eye</option>
                  <option value="Droplet">Droplet</option>
                </select>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Clinic Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Describe focus and capabilities..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-855 dark:text-white resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Confirm Creation <Plus className="w-4 h-4" />
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

export default AdminDepartments;
