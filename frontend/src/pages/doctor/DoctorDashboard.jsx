import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 font-semibold">
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
                            className={`border-b border-slate-100/50 dark:border-slate-800/40 text-slate-650 dark:text-slate-400 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-all ${
                              selectedAppointment?._id === app._id ? 'bg-slate-50 dark:bg-slate-850/40' : ''
                            }`}
                          >
                            <td className="py-3 font-semibold text-slate-850 dark:text-white">
                              {app.patientId?.name || 'Unknown Patient'}
                            </td>
                            <td className="py-3">{new Date(app.date).toLocaleDateString('en-GB')}</td>
                            <td className="py-3">{app.timeSlot}</td>
                            <td className="py-3 font-bold text-brand-500">{app.tokenNumber}</td>
                            <td className="py-3 max-w-[120px] truncate">{app.reason}</td>
                            <td className="py-3 text-right">
                              <ChevronRight className="w-4 h-4 text-slate-400 inline-block" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] border border-white/20 dark:border-slate-800">
            <div className="flex justify-between items-center border-b pb-3 mb-5 dark:border-slate-805">
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-white">
                  Prescription & Diagnosis Form
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Patient: {selectedAppointment.patientId?.name || 'Unknown Patient'}
                </span>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-slate-450 hover:text-slate-750 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileRecordSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-655 dark:text-slate-400">
              {}
              <div className="flex flex-col gap-1.5">
                <label>Diagnosis / Health Condition</label>
                <input
                  type="text"
                  required
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                  placeholder="e.g. Acute Bacterial Pharyngitis"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                />
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center mb-1">
                  <label>Prescribed Medicines</label>
                  <button
                    type="button"
                    onClick={addPrescriptionRow}
                    className="text-xs text-brand-500 hover:text-brand-650 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {recordForm.prescription.map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Medicine name"
                        value={row.medicineName}
                        onChange={(e) => handlePrescriptionRowChange(index, 'medicineName', e.target.value)}
                        className="flex-grow px-3 py-2 rounded-xl glass-input text-slate-850 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1-0-1)"
                        value={row.dosage}
                        onChange={(e) => handlePrescriptionRowChange(index, 'dosage', e.target.value)}
                        className="w-32 px-3 py-2 rounded-xl glass-input text-slate-850 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={row.duration}
                        onChange={(e) => handlePrescriptionRowChange(index, 'duration', e.target.value)}
                        className="w-28 px-3 py-2 rounded-xl glass-input text-slate-850 dark:text-white"
                      />
                      {recordForm.prescription.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrescriptionRow(index)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
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
