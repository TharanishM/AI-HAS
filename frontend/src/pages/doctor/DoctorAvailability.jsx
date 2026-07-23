import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { Clock, Plus, Trash2, Save, Calendar } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const DoctorAvailability = () => {
  const { user, profile, setProfile } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [saving, setSaving] = useState(false);

  const [newSlotTime, setNewSlotTime] = useState('09:00 AM');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data.success) {
          setSchedule(res.data.profile?.availability || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlotTime) return;

    const dayIndex = schedule.findIndex((s) => s.day === selectedDay);

    if (dayIndex > -1) {
      if (schedule[dayIndex].slots.includes(newSlotTime)) {
        addToast('This timeslot is already added for ' + selectedDay, 'warning');
        return;
      }
      const updated = [...schedule];
      updated[dayIndex].slots = [...updated[dayIndex].slots, newSlotTime].sort();
      setSchedule(updated);
    } else {
      setSchedule([...schedule, { day: selectedDay, slots: [newSlotTime] }]);
    }
    addToast(`Added ${newSlotTime} to ${selectedDay}`, 'success');
  };

  const handleRemoveSlot = (day, slot) => {
    const dayIndex = schedule.findIndex((s) => s.day === day);
    if (dayIndex > -1) {
      const updated = [...schedule];
      updated[dayIndex].slots = updated[dayIndex].slots.filter((s) => s !== slot);

      if (updated[dayIndex].slots.length === 0) {
        setSchedule(schedule.filter((s) => s.day !== day));
      } else {
        setSchedule(updated);
      }
    }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/doctors/${user._id}/availability`, { availability: schedule });
      if (res.data.success) {
        addToast('Schedule details saved successfully', 'success');
        setProfile({ ...profile, availability: schedule });
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Error updating schedule', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Availability Schedule</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Configure your weekly consulting days and active appointment hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false} className="sticky top-24">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-500" /> Add Working Slot
            </h3>

            <form onSubmit={handleAddSlot} className="flex flex-col gap-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
              <div className="flex flex-col gap-1.5">
                <label>Day of Week</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-slate-800 dark:text-white"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Timeslot</label>
                <select
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-slate-800 dark:text-white"
                >
                  {[
                    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
                    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-all text-center mt-2 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Slot
              </button>
            </form>
          </GlassCard>
        </div>

        {}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard hoverEffect={false}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" /> Active Weekly Schedule
              </h3>
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/10 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Schedule
                  </>
                )}
              </button>
            </div>

            {schedule.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-500 py-12">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-500" />
                <p className="font-semibold text-sm">No working slots configured.</p>
                <p className="text-xs mt-1">Use the panel on the left to add your available consult hours.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {daysOfWeek
                  .map((day) => schedule.find((s) => s.day === day))
                  .filter((s) => s !== undefined)
                  .map((sched) => (
                    <div
                      key={sched.day}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-850 flex flex-col gap-3"
                    >
                      <h4 className="font-bold text-sm text-slate-850 dark:text-white border-b pb-2 dark:border-slate-800">
                        {sched.day}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {sched.slots.map((slot) => (
                          <div
                            key={slot}
                            className="pl-3 pr-1.5 py-1 bg-white dark:bg-slate-950/40 border dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 group hover:border-rose-300 dark:hover:border-rose-900 transition-all"
                          >
                            <span>{slot}</span>
                            <button
                              onClick={() => handleRemoveSlot(sched.day, slot)}
                              className="text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete Slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
