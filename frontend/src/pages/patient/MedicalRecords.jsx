import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FileText, Stethoscope, User, Calendar, ClipboardList } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { ListSkeleton } from '../../components/LoadingSkeleton';

const PatientMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await API.get('/appointments/medical-records');
        if (res.data.success) {
          setRecords(res.data.records);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Medical History & Prescriptions</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review past consultations, clinical diagnoses, and prescriptions recommended by your doctors.
        </p>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : records.length === 0 ? (
        <div className="glass-panel border p-16 rounded-3xl text-center text-slate-400 dark:text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-500" />
          <p className="font-semibold text-sm">No medical records on file.</p>
          <p className="text-xs mt-1">Records appear here once a doctor completes your visit and files a prescription.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {records.map((rec) => (
            <GlassCard key={rec._id} className="p-6 border-l-4 border-l-emerald-500">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-850 dark:text-white">
                      Diagnosis: {rec.diagnosis}
                    </h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5" /> Dr. {rec.doctorId?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 self-end sm:self-start">
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    {new Date(rec.date).toLocaleDateString()}
                  </div>
                  <a
                    href={`http://localhost:5000/api/appointments/medical-records/${rec._id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    Download Prescription PDF
                  </a>
                </div>
              </div>

              {}
              {Array.isArray(rec.prescription) && rec.prescription.length > 0 && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                    💊 Prescribed Medicines
                  </span>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-105 dark:border-slate-850 text-slate-400 font-semibold">
                          <th className="pb-2">Medicine Name</th>
                          <th className="pb-2">Dosage</th>
                          <th className="pb-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rec.prescription.map((m, idx) => (
                          <tr key={idx} className="border-b border-slate-50/50 dark:border-slate-900/50 text-slate-700 dark:text-slate-300">
                            <td className="py-2.5 font-medium">{m.medicineName}</td>
                            <td className="py-2.5">{m.dosage}</td>
                            <td className="py-2.5">{m.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {}
              {Array.isArray(rec.labTests) && rec.labTests.length > 0 && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1">
                    <ClipboardList className="w-4 h-4 text-emerald-500" /> Required Lab Tests
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rec.labTests.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-lg text-xs font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {}
              {rec.notes && (
                <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    Clinical Notes
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-1">
                    {rec.notes}
                  </p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientMedicalRecords;
