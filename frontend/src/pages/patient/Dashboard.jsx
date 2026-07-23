import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, Video, FileText, ArrowRight, UserCheck, AlertCircle, Trash2, Download, Bot } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { CardSkeleton, ListSkeleton } from '../../components/LoadingSkeleton';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const appointmentsRes = await API.get('/appointments');
      const recordsRes = await API.get('/appointments/medical-records');
      const aiRes = await API.get('/ai/history');
      const billsRes = await API.get('/payments/history');

      if (appointmentsRes.data.success) {
        setAppointments(appointmentsRes.data.appointments);
      }
      if (recordsRes.data.success) {
        setMedicalRecords(recordsRes.data.records);
      }
      if (aiRes.data.success) {
        setAiHistory(aiRes.data.history);
      }
      if (billsRes.data.success) {
        setBills(billsRes.data.bills || billsRes.data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayBill = async (billId, amount) => {
    try {
      // 1. Create order on backend
      const orderRes = await API.post('/payments/create-order', { billId, amount });
      if (!orderRes.data.success) {
        addToast('Failed to initialize payment order', 'error');
        return;
      }
      const { orderId, amount: orderAmount, currency } = orderRes.data;

      // 2. Open Razorpay Checkout Checkout
      const options = {
        key: 'rzp_test_dummykey', // Client dummy key placeholder
        amount: orderAmount,
        currency,
        name: 'AI Hospital Appointment System',
        description: `Billing Payment for invoice #${billId}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyRes = await API.post('/payments/verify', {
              billId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              addToast('Payment successful & verified!', 'success');
              fetchData();
            } else {
              addToast('Payment verification failed', 'error');
            }
          } catch (err) {
            addToast('Error during payment verification', 'error');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      // Ensure Razorpay SDK is loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error initiating payment', 'error');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await API.put(`/appointments/${id}/status`, {
        status: 'Cancelled',
        cancellationReason: 'Cancelled by patient'
      });
      if (res.data.success) {
        addToast('Appointment cancelled successfully', 'info');
        fetchData();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error cancelling appointment', 'error');
    }
  };

  const handleDownloadReceipt = (appt) => {
    const printWindow = window.open('', '_blank');
    const doctorObj = appt.doctorId || {};
    const doctorName = doctorObj.name || 'Doctor';
    const doctorSpecialization = doctorObj.specialization || 'Physician';
    const doctorFees = doctorObj.doctor?.fees || 'N/A';
    const hospitalName = appt.hospital?.name || appt.doctor?.doctor?.hospital?.name || 'Clinic';
    const hospitalAddress = appt.hospital?.address || appt.doctor?.doctor?.hospital?.address || '';

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
                <div class="hospital-name">${hospitalName}</div>
                <div class="hospital-address">${hospitalAddress}</div>
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
                <div class="detail-value">Dr. ${doctorName}</div>
              </div>
              <div>
                <div class="detail-label">Specialization</div>
                <div class="detail-value">${doctorSpecialization}</div>
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
              <span style="color: #059669;">₹ ${doctorFees}</span>
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

  const nextAppointment = appointments.find(
    (app) => app.status === 'Pending' || app.status === 'Accepted' || app.status === 'Rescheduled'
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-900 dark:to-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/10">
        <div>
          <h1 className="text-3xl font-bold">Hello, {user.name}!</h1>
          <p className="text-brand-100 text-sm mt-1">
            Check your dashboard for scheduled appointments, prescriptions, and health insights.
          </p>
        </div>
        <Link
          to="/patient/hospitals"
          className="px-6 py-3 bg-white text-brand-600 font-semibold rounded-2xl hover:bg-brand-50 transition-all text-sm flex items-center gap-2 shadow-lg shadow-black/5"
        >
          Book Appointment <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold block uppercase">
                Active Booking
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">
                {appointments.filter((a) => ['Pending', 'Accepted', 'Rescheduled'].includes(a.status)).length}
              </span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold block uppercase">
                Medical Records
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">
                {medicalRecords.length}
              </span>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold block uppercase">
                Total Consultations
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">
                {appointments.filter((a) => a.status === 'Completed').length}
              </span>
            </div>
          </GlassCard>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-500" /> Scheduled Appointments
          </h2>

          {loading ? (
            <ListSkeleton />
          ) : nextAppointment ? (
            <GlassCard className="flex flex-col gap-5 border-l-4 border-l-brand-500">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  {nextAppointment.doctorId?.avatar ? (
                    <img
                      src={`http://localhost:5000${nextAppointment.doctorId.avatar}`}
                      alt={nextAppointment.doctorId.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-brand-100 dark:bg-brand-950 text-brand-500 rounded-xl flex items-center justify-center font-bold">
                      {nextAppointment.doctorId?.name?.charAt(0) || 'D'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">
                      Dr. {nextAppointment.doctorId?.name || 'Unknown'}
                    </h3>
                    <span className="text-xs text-brand-500 font-medium">
                      Status: {nextAppointment.status} • Token: {nextAppointment.tokenNumber}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReceipt(nextAppointment)}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all"
                    title="Download Receipt"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(nextAppointment._id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                    title="Cancel Appointment"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span>{new Date(nextAppointment.date).toLocaleDateString('en-GB')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" />
                  <span>{nextAppointment.timeSlot}</span>
                </div>
                {nextAppointment.appointmentNumber && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-500" />
                    <span className="font-mono">No: {nextAppointment.appointmentNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-500" />
                  <span>Reason: {nextAppointment.reason}</span>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="glass-panel rounded-2xl border p-12 text-center text-slate-400 dark:text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-500" />
              <p className="font-semibold text-sm">No upcoming appointments scheduled.</p>
              <Link
                to="/patient/hospitals"
                className="text-xs font-semibold text-brand-500 hover:underline mt-2 inline-block"
              >
                Schedule one now
              </Link>
            </div>
          )}

          {}
          {appointments.length > 0 && (
            <GlassCard hoverEffect={false}>
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Appointment History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">Doctor</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Slot</th>
                      <th className="pb-3">Token</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .filter((app) => app._id !== nextAppointment?._id)
                      .slice(0, 5)
                      .map((app) => (
                        <tr key={app._id} className="border-b border-slate-100/50 dark:border-slate-800/40 text-slate-600 dark:text-slate-400">
                           <td className="py-3 font-semibold text-slate-800 dark:text-white">
                            Dr. {app.doctorId?.name || 'Unknown'}
                          </td>
                          <td className="py-3">{new Date(app.date).toLocaleDateString('en-GB')}</td>
                          <td className="py-3">{app.timeSlot}</td>
                          <td className="py-3 font-bold text-brand-500">{app.tokenNumber || 'N/A'}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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
                            <button
                              onClick={() => handleDownloadReceipt(app)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-brand-500"
                              title="Print Receipt"
                            >
                              <Download className="w-4 h-4 inline" />
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
          {aiHistory.length > 0 && (
            <GlassCard hoverEffect={false}>
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-500" /> AI Consultation History
              </h3>
              <div className="flex flex-col gap-3">
                {aiHistory.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-xl text-xs flex flex-col gap-1.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-white">Symptoms: {item.symptomDescription}</span>
                      <span className="text-slate-400 font-normal">{new Date(item.date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Recommended Specialty: <strong className="text-indigo-500">{item.recommendedDepartment}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {}
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" /> Prescriptions & Records
          </h2>

          {loading ? (
            <ListSkeleton />
          ) : medicalRecords.length > 0 ? (
            <div className="flex flex-col gap-4">
              {medicalRecords.slice(0, 3).map((rec) => (
                <GlassCard key={rec._id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-white">
                        {rec.diagnosis}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        Prescribed by Dr. {rec.doctorId?.name || 'Unknown'} • {new Date(rec.date).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 border-t pt-2 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Medicines</span>
                    {Array.isArray(rec.prescription)
                      ? rec.prescription.map((m, idx) => (
                          <span key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                            💊 {m.medicineName} - {m.dosage} ({m.duration})
                          </span>
                        ))
                      : null}
                  </div>
                </GlassCard>
              ))}
              <Link
                to="/patient/medical-records"
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 text-center flex items-center justify-center gap-1 mt-1"
              >
                View all medical history <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="glass-panel border p-8 rounded-2xl text-center text-slate-400 dark:text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
              <p className="text-xs">No medical records filed yet.</p>
            </div>
          )}

          {}
          <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-brand-500/10 border-brand-500/20 text-slate-800 dark:text-white">
            <h3 className="font-bold flex items-center gap-2 text-indigo-500">
              🤖 AI Symptom Checker
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4 leading-relaxed">
              Describe symptoms to identify health conditions, locate target medical clinics, and match with doctors.
            </p>
            <Link
              to="/patient/ai-assistant"
              className="w-full py-2.5 bg-indigo-500 text-white rounded-xl font-semibold text-xs text-center block hover:bg-indigo-600 transition-all"
            >
              Analyze Symptoms Now
            </Link>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="font-bold text-slate-800 dark:text-white mb-3 text-sm flex items-center gap-2">
              💳 Payments & Invoices
            </h3>
            {bills.length > 0 ? (
              <div className="flex flex-col gap-3">
                {bills.slice(0, 3).map((bill) => (
                  <div key={bill._id} className="p-3 bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-white block">
                        Dr. {bill.doctorId?.name || 'Consultation'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(bill.createdAt || bill.billingDate).toLocaleDateString('en-GB')} • ₹{bill.amount}
                      </span>
                    </div>
                    {bill.status === 'Paid' ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full font-bold text-[10px]">
                        Paid
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePayBill(bill._id, bill.amount)}
                        className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg text-[10px] transition-all"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No invoices pending payment.</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
