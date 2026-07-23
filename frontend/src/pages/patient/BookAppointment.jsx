import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Clock, Heart, Briefcase, FileText, CheckCircle2, FileDown } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedApptDetails, setBookedApptDetails] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const hospitalId = queryParams.get('hospitalId');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await API.get(`/doctors/${doctorId}`);
        if (res.data.success) {
          setDoctor(res.data.doctor);
        }
      } catch (error) {
        addToast('Error loading doctor details', 'error');
        navigate('/patient/doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorDetails();
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDate || !doctor) return;

    const dateObj = new Date(selectedDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = dayNames[dateObj.getDay()];

    const dayAvailability = doctor.availability.find(
      (a) => a.day.toLowerCase() === selectedDayName.toLowerCase()
    );

    if (dayAvailability) {
      setAvailableSlots(dayAvailability.slots);
      setSelectedSlot('');
    } else {
      setAvailableSlots([]);
      setSelectedSlot('');
      addToast(`Dr. ${doctor.userId.name} is not available on ${selectedDayName}s`, 'warning');
    }
  }, [selectedDate, doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !reason) {
      addToast('Please fill all required fields', 'warning');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await API.post('/appointments', {
        doctorId: doctor.userId._id,
        hospitalId: hospitalId || doctor.hospitalId,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason,
      });

      if (res.data.success) {
        setBookedApptDetails(res.data.appointment);
        setShowSuccessModal(true);
        addToast('Appointment booked successfully!', 'success');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error booking appointment', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDownloadReceipt = (appt) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <html>
        <head>
          <title>Receipt - ${appt.appointmentNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
            .receipt-card { border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px; max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
            .header { display: flex; justify-content: space-between; border-bottom: 2px dashed #e2e8f0; padding-bottom: 25px; margin-bottom: 25px; }
            .hospital-name { font-size: 22px; font-weight: 800; color: #3b82f6; }
            .hospital-address { font-size: 13px; color: #64748b; margin-top: 4px; }
            .token-section { text-align: center; margin: 30px 0; background: #eff6ff; padding: 25px; border-radius: 20px; border: 1px solid #bfdbfe; }
            .token-number { font-size: 64px; font-weight: 900; color: #2563eb; line-height: 1; margin-top: 8px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .detail-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
            .detail-value { font-size: 14px; font-weight: 600; color: #334155; margin-top: 2px; }
            .footer { border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div>
                <div class="hospital-name">${appt.hospital?.name || doctor.hospital?.name || 'HAS Clinic'}</div>
                <div class="hospital-address">${appt.hospital?.address || doctor.hospital?.address || ''}</div>
              </div>
              <div style="font-weight: 800; color: #10b981; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Confirmed</div>
            </div>
            
            <div class="details-grid">
              <div>
                <div class="detail-label">Patient Name</div>
                <div class="detail-value">${user?.name}</div>
              </div>
              <div>
                <div class="detail-label">Appointment No</div>
                <div class="detail-value" style="font-family: monospace; font-size: 13px;">${appt.appointmentNumber}</div>
              </div>
              <div>
                <div class="detail-label">Doctor Name</div>
                <div class="detail-value">Dr. ${doctor.userId.name}</div>
              </div>
              <div>
                <div class="detail-label">Department</div>
                <div class="detail-value">${doctor.departmentId.name}</div>
              </div>
              <div>
                <div class="detail-label">Appointment Date</div>
                <div class="detail-value">${new Date(appt.date).toLocaleDateString('en-GB')}</div>
              </div>
              <div>
                <div class="detail-label">Time Slot</div>
                <div class="detail-value">${appt.timeSlot}</div>
              </div>
            </div>

            <div class="token-section">
              <div class="detail-label" style="color: #1d4ed8;">Queue Token Number</div>
              <div class="token-number">${appt.tokenNumber}</div>
            </div>

            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 16px; border-top: 2px dashed #e2e8f0; padding-top: 20px; margin-bottom: 25px;">
              <span style="color: #475569;">Consultation Fee:</span>
              <span style="color: #059669;">₹ ${doctor.fees}</span>
            </div>

            <div class="footer">
              <p><strong>Notice:</strong> Please arrive at least 15 minutes before your scheduled appointment. Carry this receipt during your hospital visit. Thank you for choosing our Hospital.</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Schedule Consultation</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Pick your preferred date and slot to book a consultation.
        </p>
      </div>

      {doctor && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {}
          <div className="md:col-span-1 flex flex-col gap-6">
            <GlassCard hoverEffect={false} className="text-center p-6 flex flex-col items-center">
              {doctor.userId.avatar ? (
                <img
                  src={`http://localhost:5000${doctor.userId.avatar}`}
                  alt={doctor.userId.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-500/20 mb-4"
                />
              ) : (
                <div className="w-24 h-24 bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center font-bold text-3xl mb-4">
                  {doctor.userId.name.charAt(0)}
                </div>
              )}
              <h3 className="font-bold text-slate-800 dark:text-white">Dr. {doctor.userId.name}</h3>
              <span className="text-xs font-semibold text-brand-500 mt-1">{doctor.departmentId.name}</span>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{doctor.specialization}</p>

              {doctor.hospital && (
                <div className="mt-3 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-lg">
                  🏢 {doctor.hospital.name}
                </div>
              )}

              <div className="flex flex-col gap-2 w-full mt-6 pt-6 border-t dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-left font-medium">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">{doctor.experience} Years</span>
                </div>
                <div className="flex justify-between">
                  <span>Consult Fee:</span>
                  <span className="font-bold text-emerald-600">₹ {doctor.fees}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rating:</span>
                  <span className="font-bold text-amber-500">★ {doctor.rating.toFixed(1)}</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {}
          <div className="md:col-span-2">
            <GlassCard hoverEffect={false}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-brand-500" /> Appointment Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 dark:text-white"
                  />
                </div>

                {selectedDate && (
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-500" /> Available Time Slots
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2.5 mt-1">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-3 border rounded-xl text-center font-medium transition-all ${
                              selectedSlot === slot
                                ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/20'
                                : 'bg-white/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-800'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl text-amber-600 text-center font-medium">
                        No slots available on this day. Please select a different date.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-500" /> Reason for Visit
                  </label>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Describe symptoms, follow-up needs, or clinical concerns..."
                    className="w-full px-4 py-3 rounded-xl glass-input text-slate-800 dark:text-white resize-none text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Confirm Booking <CheckCircle2 className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {}
      {showSuccessModal && bookedApptDetails && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-lg flex flex-col gap-5 border border-white/20 p-6 shadow-2xl relative">
            <div className="text-center flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-xl shadow-emerald-500/20">
                ✓
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white mt-2">
                Appointment Booked Successfully
              </h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold">Appointment Number</span>
                <span className="font-bold text-slate-800 dark:text-white font-mono">{bookedApptDetails.appointmentNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold">Token Number</span>
                <span className="font-black text-brand-500 text-lg">{bookedApptDetails.tokenNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold">Hospital Name</span>
                <span className="font-bold text-slate-800 dark:text-white">{bookedApptDetails.hospital?.name || doctor.hospital?.name || 'Clinic'}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold">Doctor Name</span>
                <span className="font-bold text-slate-800 dark:text-white">Dr. {doctor.userId.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold">Department</span>
                <span className="font-bold text-slate-800 dark:text-white">{doctor.departmentId.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold">Appointment Date</span>
                <span className="font-bold text-slate-800 dark:text-white">{new Date(bookedApptDetails.date).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold">Time Slot</span>
                <span className="font-bold text-slate-800 dark:text-white">{bookedApptDetails.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Consultation Fee</span>
                <span className="font-bold text-emerald-600">₹ {doctor.fees}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => handleDownloadReceipt(bookedApptDetails)}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
              >
                <FileDown className="w-4 h-4" /> Download Receipt (PDF)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/patient');
                  }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs"
                >
                  My Appointments
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/patient/hospitals');
                  }}
                  className="py-2.5 bg-slate-900 text-white hover:bg-slate-950 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
