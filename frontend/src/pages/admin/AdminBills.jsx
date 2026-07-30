import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Search, X, Wallet, Save, FileText, CheckCircle2 } from 'lucide-react';
import GlassCard from '../../components/GlassCard';

const AdminBills = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    amount: '',
    status: 'Unpaid',
    paymentMethod: 'Pending',
    billingDate: new Date().toISOString().slice(0, 10)
  });

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [billRes, patRes, docRes] = await Promise.all([
        API.get('/admin/bills'),
        API.get('/admin/patients'),
        API.get('/doctors')
      ]);

      if (billRes.data.success) setBills(billRes.data.bills);
      if (patRes.data.success) setPatients(patRes.data.patients);
      if (docRes.data.success) setDoctors(docRes.data.doctors);
    } catch (err) {
      addToast('Failed to load billing information.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingBill(null);
    setFormData({
      patientId: '',
      doctorId: '',
      amount: '',
      status: 'Unpaid',
      paymentMethod: 'Pending',
      billingDate: new Date().toISOString().slice(0, 10)
    });
    setShowModal(true);
  };

  const handleOpenEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      patientId: bill.patientId?.id || bill.patientId || '',
      doctorId: bill.doctorId?.id || bill.doctorId || '',
      amount: bill.amount || '',
      status: bill.status || 'Unpaid',
      paymentMethod: bill.paymentMethod || 'Pending',
      billingDate: bill.billingDate || new Date().toISOString().slice(0, 10)
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice/billing record?')) return;
    try {
      const res = await API.delete(`/admin/bills/${id}`);
      if (res.data.success) {
        addToast('Invoice deleted successfully.', 'success');
        fetchData();
      }
    } catch (err) {
      addToast('Failed to delete invoice.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      addToast('Please select a patient and a doctor.', 'warning');
      return;
    }

    try {
      if (editingBill) {
        const res = await API.put(`/admin/bills/${editingBill.id}`, formData);
        if (res.data.success) {
          addToast('Invoice updated successfully!', 'success');
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await API.post('/admin/bills', formData);
        if (res.data.success) {
          addToast('Invoice created successfully!', 'success');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      addToast('Failed to save billing record.', 'error');
    }
  };

  const filteredBills = bills.filter(b => 
    (b.patientId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.doctorId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Payments & Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track bills, consultation payments, transaction history, and generate invoices.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <GlassCard className="p-4 border border-white/20">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice by number, patient or doctor..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 dark:text-white"
          />
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-panel overflow-x-auto border border-white/20 rounded-2xl">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-100/50 dark:bg-slate-900/50 text-xs text-slate-700 dark:text-slate-350 uppercase border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Consultant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filteredBills.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-6 py-4 font-mono font-semibold text-brand-500">{b.invoiceNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-white">{b.patientId?.name || 'Guest'}</td>
                  <td className="px-6 py-4">{b.doctorId?.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-white">₹{b.amount?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      b.status === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : b.status === 'Unpaid'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">{b.paymentMethod}</td>
                  <td className="px-6 py-4 text-xs">{b.billingDate}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg text-rose-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-450">
                    No billing records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-lg border border-white/20 p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-850 dark:text-white flex items-center gap-1.5">
                <Wallet className="w-5 h-5 text-brand-500" /> {editingBill ? 'Edit Invoice Details' : 'Create Billing Record'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex flex-col gap-1">
                <label>Select Patient</label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  disabled={!!editingBill}
                >
                  <option value="">Choose Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.userId?.id || p.userId}>{p.userId?.name || p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label>Select Doctor</label>
                <select
                  required
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  disabled={!!editingBill}
                >
                  <option value="">Choose Doctor</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.userId?.id || d.userId}>{d.user?.name || d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  placeholder="e.g. 500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label>Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="NetBanking">NetBanking</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label>Billing Date</label>
                <input
                  type="date"
                  required
                  value={formData.billingDate}
                  onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-850 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 mt-2"
              >
                <Save className="w-4 h-4" /> Save Record
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AdminBills;
