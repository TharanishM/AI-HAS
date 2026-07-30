import React, { useState, useEffect } from 'react';
import API, { BACKEND_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Check, X, ShieldAlert, Heart, Building2, Layers, Clock } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const AdminApprovals = () => {
  const [pending, setPending] = useState({ doctors: [], hospitals: [], departments: [] });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchApprovals = async () => {
    try {
      const res = await API.get('/admin/approvals');
      if (res.data.success) {
        setPending(res.data.pending);
      }
    } catch (err) {
      addToast('Failed to fetch pending approvals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (type, id, action) => {
    try {
      const res = await API.put(`/admin/approvals/${type}/${id}`, { status: action });
      if (res.data.success) {
        addToast(`${type.slice(0, -1)} has been ${action.toLowerCase()} successfully!`, 'success');
        fetchApprovals();
      }
    } catch (err) {
      addToast('Action execution failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalPending = pending.doctors.length + pending.hospitals.length + pending.departments.length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Approvals Panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review, approve or reject self-registered doctor profiles, custom hospitals and departments.
        </p>
      </div>

      {totalPending === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center border border-white/20">
          <Clock className="w-16 h-16 text-slate-400 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">All caught up!</h3>
          <p className="text-sm text-slate-550 dark:text-slate-450 mt-1">
            There are no pending approval requests at the moment.
          </p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Doctor Registrations */}
          {pending.doctors.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Doctor Registrations ({pending.doctors.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {pending.doctors.map(doc => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <GlassCard className="p-6 border border-white/20 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            {doc.user?.avatar ? (
                               <img src={`${BACKEND_URL}${doc.user.avatar}`} alt={doc.user?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-brand-500 text-xl">
                                {doc.user?.name?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-850 dark:text-white text-base">{doc.user?.name}</h3>
                            <p className="text-xs text-brand-500 font-semibold">{doc.specialization}</p>
                            <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1">
                              Experience: {doc.experience} Years | Fees: ₹{doc.fees}
                            </p>
                            <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5">
                              Assigned Hospital: {doc.hospital?.name || 'Pending Approval'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-100/50 dark:bg-slate-900/30 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Bio: </span>
                          {doc.biography || 'No biography details provided.'}
                        </div>

                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => handleAction('doctors', doc.id, 'Approved')}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction('doctors', doc.id, 'Rejected')}
                            className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Hospital Requests */}
          {pending.hospitals.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-500" /> Hospital Approvals ({pending.hospitals.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {pending.hospitals.map(hosp => (
                    <motion.div
                      key={hosp.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <GlassCard className="p-6 border border-white/20 flex flex-col justify-between h-full gap-4">
                        <div>
                          <h3 className="font-bold text-slate-850 dark:text-white text-base">{hosp.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <span className="font-bold">Address:</span> {hosp.address}, {hosp.city} ({hosp.pinCode})
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-bold">Phone:</span> {hosp.phone} | <span className="font-bold">Email:</span> {hosp.email}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction('hospitals', hosp.id, 'Approved')}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction('hospitals', hosp.id, 'Rejected')}
                            className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Department Requests */}
          {pending.departments.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" /> Department Approvals ({pending.departments.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {pending.departments.map(dept => (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <GlassCard className="p-6 border border-white/20 flex flex-col justify-between h-full gap-4">
                        <div>
                          <h3 className="font-bold text-slate-850 dark:text-white text-base">{dept.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {dept.description}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction('departments', dept.id, 'Approved')}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction('departments', dept.id, 'Rejected')}
                            className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
