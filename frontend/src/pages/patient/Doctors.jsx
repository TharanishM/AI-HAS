import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../services/api';
import { Search, Filter, Star, Briefcase, IndianRupee, Calendar, ChevronRight, Building } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { ListSkeleton } from '../../components/LoadingSkeleton';
import { ImageLoader } from '../../components/ImageLoader';

const PatientDoctors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availableDay, setAvailableDay] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const hospitalId = queryParams.get('hospitalId');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedDept) params.department = selectedDept;
      if (minExperience) params.experience = minExperience;
      if (minRating) params.rating = minRating;
      if (availableDay) params.availability = availableDay;
      if (hospitalId) params.hospitalId = hospitalId;

      const res = await API.get('/doctors', { params });
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, [location.search]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDept('');
    setMinExperience('');
    setMinRating('');
    setAvailableDay('');
    setTimeout(() => {
      API.get('/doctors').then(res => {
        if (res.data.success) setDoctors(res.data.doctors);
      });
    }, 100);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Find Medical Specialists</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Search and filter doctors by specialization, clinical department, experience, and scheduling availability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {}
        <div className="lg:col-span-1">
          <GlassCard hoverEffect={false} className="sticky top-24">
            <h2 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-500" /> Filters
            </h2>

            <form onSubmit={handleFilterSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex flex-col gap-1.5">
                <label>Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Min Experience (Years)</label>
                <select
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                >
                  <option value="">Any Experience</option>
                  <option value="5">5+ Years</option>
                  <option value="10">10+ Years</option>
                  <option value="15">15+ Years</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                >
                  <option value="">Any Rating</option>
                  <option value="4.0">4.0 ★ & above</option>
                  <option value="4.5">4.5 ★ & above</option>
                  <option value="4.8">4.8 ★ & above</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label>Availability Day</label>
                <select
                  value={availableDay}
                  onChange={(e) => setAvailableDay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                >
                  <option value="">Any Day</option>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-all text-center mt-2"
              >
                Apply Filters
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-2 bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold border border-slate-200 dark:border-slate-800 transition-all text-center"
              >
                Clear Filters
              </button>
            </form>
          </GlassCard>
        </div>

        {}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDoctors()}
              placeholder="Search doctors by name or clinical specialization (e.g. Sarah, Cardiology)..."
              className="w-full pl-10 pr-24 py-3 rounded-2xl glass-input text-sm text-slate-800 dark:text-white"
            />
            <button
              onClick={fetchDoctors}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-brand-500/10"
            >
              Search
            </button>
          </div>

          {loading ? (
            <ListSkeleton />
          ) : doctors.length === 0 ? (
            <div className="glass-panel rounded-3xl border p-16 text-center text-slate-400 dark:text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-500" />
              <p className="font-semibold text-sm">No doctors match your criteria.</p>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-brand-500 hover:underline mt-2 inline-block"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {doctors.map((doc) => (
                <GlassCard key={doc._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-start sm:items-center gap-5">
                    {doc.userId?.avatar ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-brand-500/20">
                        <ImageLoader
                          src={`http://localhost:5000${doc.userId.avatar}`}
                          alt={doc.userId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-100 dark:bg-brand-950 text-brand-500 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl">
                        {doc.userId?.name?.charAt(0) || 'D'}
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white">
                          Dr. {doc.userId?.name || 'Unknown'}
                        </h3>
                        <span className="text-[10px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-full">
                          {doc.departmentId?.name || 'General'}
                        </span>
                      </div>
                      
                      {doc.hospital && (
                        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" /> {doc.hospital.name}
                        </p>
                      )}

                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                        {doc.specialization}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {doc.experience} Years Exp
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {doc.rating.toFixed(1)} Rating
                        </span>
                        <span className="flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> ₹{doc.fees} Consultation
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${doc.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          <span className="font-semibold">{doc.isOnline ? 'Online' : 'Offline'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => navigate(`/patient/book/${doc.userId._id}?hospitalId=${doc.hospitalId || ''}`)}
                      className="w-full sm:flex-1 md:w-44 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5"
                    >
                      Book Visit <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const rating = window.prompt('Enter your rating (1-5):');
                        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
                          alert('Please enter a valid rating between 1 and 5');
                          return;
                        }
                        const comment = window.prompt('Enter your review comment:');
                        if (!comment) return;

                        API.post(`/doctors/${doc.userId._id}/reviews`, { rating: Number(rating), comment })
                          .then((res) => {
                            if (res.data.success) {
                              alert('Review submitted successfully!');
                              fetchDoctors();
                            }
                          })
                          .catch((err) => {
                            alert('Failed to submit review: ' + (err.response?.data?.message || err.message));
                          });
                      }}
                      className="w-full sm:flex-1 md:w-44 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-[11px] transition-all"
                    >
                      Submit Review
                    </button>
                    {}
                    <div className="text-center md:text-left mt-1 text-[10px] text-slate-400 leading-relaxed">
                      Available days:{' '}
                      <span className="font-semibold text-slate-500 dark:text-slate-300">
                        {doc.availability ? (Array.isArray(doc.availability) ? doc.availability.map(a => a.day.substring(0, 3)).join(', ') : '') : ''}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDoctors;
