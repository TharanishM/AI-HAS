import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Users,
  Calendar,
  Layers,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  TrendingUp,
  Download,
  Search,
  Star,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/admin/analytics');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const exportReport = () => {
    if (!stats || !stats.recentAppointments) return;
    const headers = 'Appointment ID,Patient Name,Doctor Name,Specialization,Date,Slot,Status\n';
    const rows = stats.recentAppointments
      .map(
        (app) =>
          `"${app._id}","${app.patientId?.name || 'N/A'}","Dr. ${app.doctorId?.name || 'N/A'}","${
            app.doctorId?.specialization || 'N/A'
          }","${app.date}","${app.timeSlot}","${app.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HAS_Operational_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  const filteredAppointments = stats?.recentAppointments.filter((app) => {
    const matchesSearch =
      app.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.doctorId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.doctorId?.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Admin Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            System overview, clinical capabilities, and real-time statistics.
          </p>
        </div>
        <button
          onClick={exportReport}
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 text-xs transition-all"
        >
          <Download className="w-4 h-4" /> Export Report (.CSV)
        </button>
      </div>

      {}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-brand-500">
            <div className="p-3.5 bg-brand-500/10 text-brand-500 rounded-2xl shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Total Hospitals</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{stats.totalHospitals}</span>
            </div>
          </GlassCard>

          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-indigo-500">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Total Doctors</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{stats.totalDoctors}</span>
            </div>
          </GlassCard>

          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Total Patients</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{stats.totalPatients}</span>
            </div>
          </GlassCard>

          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-rose-500">
            <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Today's Bookings</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{stats.todayAppointments}</span>
            </div>
          </GlassCard>

          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-sky-500">
            <div className="p-3.5 bg-sky-500/10 text-sky-500 rounded-2xl shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Monthly Bookings</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{stats.monthlyAppointments}</span>
            </div>
          </GlassCard>

          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-teal-500">
            <div className="p-3.5 bg-teal-500/10 text-teal-500 rounded-2xl shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Completed Visits</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{stats.breakdown.Completed}</span>
            </div>
          </GlassCard>

          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-slate-400">
            <div className="p-3.5 bg-slate-500/10 text-slate-500 rounded-2xl shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Cancelled Visits</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{stats.breakdown.Cancelled}</span>
            </div>
          </GlassCard>

          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-amber-500">
            <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl shrink-0">
              <Building className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Most Booked Hospital</span>
              <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{stats.mostBookedHospital}</span>
            </div>
          </GlassCard>

          {}
          <GlassCard className="flex items-center gap-4 border-l-4 border-l-violet-500">
            <div className="p-3.5 bg-violet-500/10 text-violet-500 rounded-2xl shrink-0">
              <Star className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block uppercase tracking-wider">Top Consulted Doctor</span>
              <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{stats.mostConsultedDoctor}</span>
            </div>
          </GlassCard>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        {stats && (
          <GlassCard hoverEffect={false} className="lg:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-500" /> Operational Outcomes
              </h3>
              <div className="flex flex-col gap-4">
                {}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                    <span>Pending Approval</span>
                    <span>{stats.breakdown.Pending}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(stats.breakdown.Pending / (stats.totalAppointments || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                    <span>Approved & Scheduled</span>
                    <span>{stats.breakdown.Accepted}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(stats.breakdown.Accepted / (stats.totalAppointments || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                    <span>Completed Checks</span>
                    <span>{stats.breakdown.Completed}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(stats.breakdown.Completed / (stats.totalAppointments || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                    <span>Cancelled</span>
                    <span>{stats.breakdown.Cancelled}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(stats.breakdown.Cancelled / (stats.totalAppointments || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {}
        {stats && (
          <GlassCard hoverEffect={false} className="lg:col-span-2">
            <h3 className="font-extrabold text-slate-800 dark:text-white mb-6">Staffing per Medical Department</h3>
            <div className="overflow-y-auto max-h-[220px] pr-2 flex flex-col gap-3">
              {stats.deptStats.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b pb-2.5 last:border-b-0 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.department}</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{item.doctors} Practitioners</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {}
      {stats && stats.recentAppointments.length > 0 && (
        <GlassCard hoverEffect={false}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <h3 className="font-extrabold text-slate-800 dark:text-white">Recent System Bookings</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute inset-y-0 left-3 flex items-center text-slate-400 w-4 h-4 mt-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-slate-800 dark:text-white"
                  placeholder="Filter name or specialty..."
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl glass-input text-slate-800 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Hospital</th>
                  <th className="pb-3">Date / Slot</th>
                  <th className="pb-3">Token No</th>
                  <th className="pb-3 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr key={app._id} className="border-b border-slate-100/50 dark:border-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50/20">
                    <td className="py-3.5 pl-2 font-bold text-slate-800 dark:text-white">{app.patientId?.name || 'N/A'}</td>
                    <td className="py-3.5">Dr. {app.doctorId?.name || 'N/A'}</td>
                    <td className="py-3.5 text-slate-500 font-medium">{app.hospital?.name || 'N/A'}</td>
                    <td className="py-3.5">
                      {new Date(app.date).toLocaleDateString('en-GB')} at {app.timeSlot}
                    </td>
                    <td className="py-3.5 font-bold text-brand-600">{app.tokenNumber || 'N/A'}</td>
                    <td className="py-3.5 pr-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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

export default AdminDashboard;
