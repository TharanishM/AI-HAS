import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Trash2, ShieldAlert } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const AdminAppointments = () => {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await API.put(`/appointments/${id}/status`, {
        status: 'Cancelled',
        cancellationReason: 'Cancelled by administrator'
      });
      if (res.data.success) {
        addToast('Appointment cancelled successfully', 'info');
        fetchAppointments();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error cancelling appointment', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-brand-500" /> Audit Appointments
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Audit and moderate booked consultations, schedule cancellations, or review clinical visit statuses.
        </p>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : appointments.length === 0 ? (
        <div className="glass-panel border p-16 rounded-3xl text-center text-slate-400 dark:text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-500" />
          <p className="font-semibold text-sm">No appointments on file.</p>
        </div>
      ) : (
        <GlassCard hoverEffect={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 font-semibold">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Time Slot</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app._id} className="border-b border-slate-100/50 dark:border-slate-800/40 text-slate-655 dark:text-slate-400">
                    <td className="py-3 font-semibold text-slate-800 dark:text-white">
                      {app.patientId?.name || 'Deleted Patient'}
                    </td>
                    <td className="py-3">
                      Dr. {app.doctorId?.name || 'Deleted Doctor'}
                    </td>
                    <td className="py-3">{new Date(app.date).toLocaleDateString()}</td>
                    <td className="py-3">{app.timeSlot}</td>
                    <td className="py-3 max-w-[150px] truncate">{app.reason}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          app.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : app.status === 'Cancelled' || app.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {['Pending', 'Accepted', 'Rescheduled'].includes(app.status) ? (
                        <button
                          onClick={() => handleCancelAppointment(app._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                          title="Force cancel appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px] pr-2">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AdminAppointments;
