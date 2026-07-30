import { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  User,
  Phone,
  Stethoscope,
  Plus,
  Trash2,
  Users,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { TableSkeleton } from '../../components/LoadingSkeleton';

const DoctorDashboard = () => {
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    prescription: [{ medicineName: '', dosage: '1-0-1', duration: '5 days' }],
    labTests: '',
    notes: '',
  });
  const [savingRecord, setSavingRecord] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [reviews, setReviews] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
      
      // Fetch online status from /auth/me or doctor profile details
      const profileRes = await API.get('/auth/me');
      if (profileRes.data.success && profileRes.data.profile) {
        setIsOnline(profileRes.data.profile.isOnline || false);
        setReviews(profileRes.data.profile.reviews || []);
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

  const handleToggleOnlineStatus = async () => {
    try {
      const res = await API.put('/doctors/status');
      if (res.data.success) {
        setIsOnline(res.data.isOnline);
        addToast(`Status updated to ${res.data.isOnline ? 'Online' : 'Offline'}`, 'success');
      }
    } catch (error) {
      addToast('Failed to update online status', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/appointments/${id}/status`, { status });
      if (res.data.success) {
        addToast(`Appointment status updated to ${status}`, 'success');
        fetchAppointments();
        if (selectedAppointment?._id === id) {
          setSelectedAppointment({ ...selectedAppointment, status });
        }
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error updating status', 'error');
    }
  };

  const handlePrescriptionRowChange = (index, field, value) => {
    const updated = [...recordForm.prescription];
    updated[index][field] = value;
    setRecordForm({ ...recordForm, prescription: updated });
  };

  const addPrescriptionRow = () => {
    setRecordForm({
      ...recordForm,
      prescription: [...recordForm.prescription, { medicineName: '', dosage: '1-0-1', duration: '5 days' }],
    });
  };

  const removePrescriptionRow = (index) => {
    if (recordForm.prescription.length === 1) return;
    const updated = recordForm.prescription.filter((_, i) => i !== index);
    setRecordForm({ ...recordForm, prescription: updated });
  };

  const handleFileRecordSubmit = async (e) => {
    e.preventDefault();
    if (!recordForm.diagnosis.trim()) {
      addToast('Please enter a diagnosis', 'warning');
      return;
    }

    setSavingRecord(true);
    try {
      const payload = {
        diagnosis: recordForm.diagnosis,
        prescription: recordForm.prescription.filter((p) => p.medicineName.trim()),
        labTests: recordForm.labTests ? recordForm.labTests.split(',').map((t) => t.trim()).filter((t) => t) : [],
        notes: recordForm.notes,
      };

      const res = await API.post(`/appointments/${selectedAppointment._id}/medical-record`, payload);
      if (res.data.success) {
        addToast('Medical record & prescription filed successfully!', 'success');
        setShowRecordModal(false);
        setRecordForm({
          diagnosis: '',
          prescription: [{ medicineName: '', dosage: '1-0-1', duration: '5 days' }],
          labTests: '',
          notes: '',
        });
        fetchAppointments();
        setSelectedAppointment(null);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error submitting medical record', 'error');
    } finally {
      setSavingRecord(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending');
  const activeAppointments = appointments.filter((a) => ['Accepted', 'Rescheduled'].includes(a.status));

  const todayPatientsCount = appointments.filter((a) => a.date === todayStr && a.status !== 'Cancelled').length;
  const pendingRequestsCount = pendingAppointments.length;
  const upcomingScheduleCount = appointments.filter((a) => a.date > todayStr && ['Accepted', 'Rescheduled'].includes(a.status)).length;
  const completedAppointmentsCount = appointments.filter((a) => a.status === 'Completed').length;

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
            Doctor Portal
            <span className={`w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review pending bookings, consult patient records, and submit electronic medical records.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 px-4 rounded-xl border dark:border-slate-800 shrink-0">
          <span className="text-xs font-bold text-slate-800 dark:text-white">
            Online Status: {isOnline ? 'Active' : 'Offline'}
          </span>
          <button
            type="button"
            onClick={handleToggleOnlineStatus}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors relative ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase">Today's Patients</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{todayPatientsCount}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase">Pending Requests</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{pendingRequestsCount}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase">Upcoming Schedule</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{upcomingScheduleCount}</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase">Completed Visits</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{completedAppointmentsCount}</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {loading ? (
            <TableSkeleton />
          ) : (
            <>
              {}
              <GlassCard hoverEffect={false}>
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
                  Pending Requests ({pendingAppointments.length})
                </h3>
                {pendingAppointments.length === 0 ? (
                  <p className="text-xs text-slate-450 dark:text-slate-500">No new appointment requests.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pendingAppointments.map((app) => (
                      <div
                        key={app._id}
                        className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {app.patientId?.name || 'Unknown Patient'}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(app.date).toLocaleDateString('en-GB')} at {app.timeSlot}
                          </span>
                          <span className="text-[10px] text-brand-500 font-bold block mt-1">
                            Token: {app.tokenNumber}
                          </span>
                          <p className="text-slate-550 dark:text-slate-400 mt-1.5">Reason: {app.reason}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'Accepted')}
                            className="flex-grow sm:flex-grow-0 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all font-semibold"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                            className="flex-grow sm:flex-grow-0 px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all font-semibold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {}
              <GlassCard hoverEffect={false}>
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-brand-500 rounded-full"></span>
                  Confirmed Schedule ({activeAppointments.length})
                </h3>
                {activeAppointments.length === 0 ? (
                  <p className="text-xs text-slate-450 dark:text-slate-500">No active appointments scheduled.</p>
                ) : (
                  <>
                  <div className="md:hidden flex flex-col gap-3">
                    {activeAppointments.map((app) => (
                      <button
                        type="button"
                        key={app._id}
                        onClick={() => setSelectedAppointment(app)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
                          selectedAppointment?._id === app._id
                            ? 'border-brand-200 bg-brand-50/60 dark:border-brand-900 dark:bg-brand-950/30'
                            : 'border-slate-200 bg-slate-50/70 hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                              {app.patientId?.name || 'Unknown Patient'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {new Date(app.date).toLocaleDateString('en-GB')} · {app.timeSlot}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-brand-50 px-2 py-1 font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">Token {app.tokenNumber}</span>
                          <span className="truncate text-slate-500 dark:text-slate-400">{app.reason}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          <th className="pb-3">Patient</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Time</th>
                          <th className="pb-3">Token</th>
                          <th className="pb-3">Reason</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeAppointments.map((app) => (
                          <tr
                            key={app._id}
                            onClick={() => setSelectedAppointment(app)}
                            className={`cursor-pointer border-b border-slate-100/50 text-slate-600 transition-colors hover:bg-slate-50/70 dark:border-slate-800/40 dark:text-slate-400 dark:hover:bg-slate-850/30 ${
                              selectedAppointment?._id === app._id ? 'bg-slate-50 dark:bg-slate-850/40' : ''
                            }`}
                          >
                            <td className="py-3 font-semibold text-slate-900 dark:text-white">
                              {app.patientId?.name || 'Unknown Patient'}
                            </td>
                            <td className="py-3">{new Date(app.date).toLocaleDateString('en-GB')}</td>
                            <td className="py-3">{app.timeSlot}</td>
                            <td className="py-3 font-bold text-brand-500">{app.tokenNumber}</td>
                            <td className="max-w-[160px] truncate py-3">{app.reason}</td>
                            <td className="py-3 text-right">
                              <ChevronRight className="inline-block h-4 w-4 text-slate-400" aria-hidden="true" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
              </GlassCard>
            </>
          )}
        </div>

        {}
        <div className="lg:col-span-1">
          {selectedAppointment ? (
            <GlassCard hoverEffect={false} className="flex flex-col gap-5 border-l-4 border-l-brand-500">
              <div className="border-b pb-3 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                  Patient Profile
                </span>
                <h3 className="font-bold text-base text-slate-800 dark:text-white mt-1">
                  {selectedAppointment.patientId?.name || 'Unknown Patient'}
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  Gender: {selectedAppointment.patientId?.gender || 'Unknown'}
                </span>
                <span className="text-[10px] text-brand-500 font-bold block mt-1.5">
                  Queue Token: {selectedAppointment.tokenNumber}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-slate-655 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-450" />
                  <span>{new Date(selectedAppointment.date).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-455" />
                  <span>{selectedAppointment.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-455" />
                  <span>{selectedAppointment.patientId?.phone || 'N/A'}</span>
                </div>
              </div>

              {}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border dark:border-slate-850">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Reason for visit
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed">
                  {selectedAppointment.reason}
                </p>
              </div>

              {}
              {['Accepted', 'Rescheduled'].includes(selectedAppointment.status) && (
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => {
                      setRecordForm({
                        diagnosis: '',
                        prescription: [{ medicineName: '', dosage: '1-0-1', duration: '5 days' }],
                        labTests: '',
                        notes: '',
                      });
                      setShowRecordModal(true);
                    }}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10"
                  >
                    <Stethoscope className="w-4 h-4" /> File Medical Record
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment._id, 'Cancelled')}
                    className="w-full py-2 bg-transparent text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-500/20 rounded-xl font-semibold text-xs text-center transition-all"
                  >
                    Cancel Consultation
                  </button>
                </div>
              )}
            </GlassCard>
          ) : (
            <div className="glass-panel border p-8 rounded-2xl text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
              <User className="w-12 h-12 mb-3 opacity-30 text-brand-500" />
              <p className="font-semibold text-sm">No Patient Selected</p>
              <p className="text-xs mt-1">Select an appointment from the list to view profile details and write prescriptions.</p>
            </div>
          )}

          <GlassCard className="mt-6 p-4">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm flex items-center gap-1.5">
              ⭐ Patient Reviews & Feedback
            </h3>
            {reviews && reviews.length > 0 ? (
              <div className="flex flex-col gap-3">
                {reviews.map((rev, index) => (
                  <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-xl text-xs flex flex-col gap-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-white">{rev.patientName || 'Anonymous'}</span>
                      <span className="text-amber-500 font-semibold">⭐ {rev.rating}/5</span>
                    </div>
                    <p className="text-slate-550 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                      "{rev.comment}"
                    </p>
                    <span className="text-[9px] text-slate-400 mt-0.5">
                      {new Date(rev.createdAt || rev.date).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-450 dark:text-slate-500">No reviews submitted yet.</p>
            )}
          </GlassCard>
        </div>
      </div>

      {}
      {showRecordModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6" role="presentation">
          <div className="glass-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 p-5 shadow-2xl dark:border-slate-800 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="record-modal-title">
            <div className="mb-5 flex items-center justify-between border-b pb-3 dark:border-slate-805">
              <div>
                <h2 id="record-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Prescription & Diagnosis Form
                </h2>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Patient: {selectedAppointment.patientId?.name || 'Unknown Patient'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRecordModal(false)}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close medical record dialog"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <form onSubmit={handleFileRecordSubmit} className="flex flex-col gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
              {}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="record-diagnosis">Diagnosis / Health Condition</label>
                <input
                  id="record-diagnosis"
                  type="text"
                  required
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Bacterial Pharyngitis"
                  className="glass-input w-full text-slate-900 dark:text-white"
                />
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span id="prescribed-medicines-label">Prescribed Medicines</span>
                  <button
                    type="button"
                    onClick={addPrescriptionRow}
                    className="flex min-h-11 items-center gap-1 px-1 text-xs font-bold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" /> Add Medicine
                  </button>
                </div>

                <div className="flex flex-col gap-3" aria-labelledby="prescribed-medicines-label">
                  {recordForm.prescription.map((row, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_auto] sm:items-center sm:border-0 sm:bg-transparent sm:p-0 dark:border-slate-800 dark:bg-slate-900/50 dark:sm:bg-transparent">
                      <label className="sr-only" htmlFor={`medicine-name-${index}`}>Medicine name</label>
                      <input
                        id={`medicine-name-${index}`}
                        type="text"
                        required
                        placeholder="Medicine name"
                        value={row.medicineName}
                        onChange={(e) => handlePrescriptionRowChange(index, 'medicineName', e.target.value)}
                        className="glass-input w-full text-slate-900 dark:text-white"
                      />
                      <label className="sr-only" htmlFor={`medicine-dosage-${index}`}>Dosage</label>
                      <input
                        id={`medicine-dosage-${index}`}
                        type="text"
                        placeholder="Dosage (1-0-1)"
                        value={row.dosage}
                        onChange={(e) => handlePrescriptionRowChange(index, 'dosage', e.target.value)}
                        className="glass-input w-full text-slate-900 dark:text-white"
                      />
                      <label className="sr-only" htmlFor={`medicine-duration-${index}`}>Duration</label>
                      <input
                        id={`medicine-duration-${index}`}
                        type="text"
                        placeholder="Duration"
                        value={row.duration}
                        onChange={(e) => handlePrescriptionRowChange(index, 'duration', e.target.value)}
                        className="glass-input w-full text-slate-900 dark:text-white"
                      />
                      {recordForm.prescription.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrescriptionRow(index)}
                          className="flex min-h-11 min-w-11 items-center justify-center self-end rounded-xl text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30 sm:self-auto"
                          aria-label={`Remove medicine ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Required Lab Tests (comma-separated)</label>
                <input
                  type="text"
                  value={recordForm.labTests}
                  onChange={(e) => setRecordForm({ ...recordForm, labTests: e.target.value })}
                  placeholder="e.g. Complete Blood Count, Rapid Strep Test"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                />
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label>Instructions & Lifestyle Notes</label>
                <textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Drink plenty of warm liquids. Rest for 3 days."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={savingRecord}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50"
              >
                {savingRecord ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Submit & Complete Appointment <CheckCircle2 className="w-4.5 h-4.5" />
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

export default DoctorDashboard;
