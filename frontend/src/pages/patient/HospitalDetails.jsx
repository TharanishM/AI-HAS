import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { MapPin, Phone, Clock, Star, Search, ShieldAlert, Heart, Calendar, Building } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const HospitalDetails = () => {
  const { hospitalId } = useParams();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [docSearch, setDocSearch] = useState('');
  const [docSpec, setDocSpec] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/hospitals/${hospitalId}`);
        if (res.data.success) {
          setHospital(res.data.hospital);
          setDoctors(res.data.doctors);
        }
      } catch (error) {
        console.error('Error fetching hospital details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [hospitalId]);

  if (loading) {
    return <CardSkeleton />;
  }

  if (!hospital) {
    return (
      <div className="glass-panel border p-8 rounded-2xl text-center text-rose-500">
        Hospital not found.
      </div>
    );
  }

  const filteredDoctors = doctors.filter((doc) => {
    const nameMatch = doc.user?.name?.toLowerCase().includes(docSearch.toLowerCase());
    const specMatch = docSpec ? doc.specialization === docSpec : true;
    return nameMatch && specMatch;
  });

  const specializations = [...new Set(doctors.map((d) => d.specialization))];

  return (
    <div className="flex flex-col gap-8 w-full">
      {}
      <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[300px] flex items-end">
        {}
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800">
          {hospital.banner ? (
            <img
              src={`http://localhost:5000${hospital.banner}`}
              alt={hospital.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-brand-600 to-indigo-600 opacity-60"></div>
          )}
          {}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
        </div>

        {}
        <div className="relative z-10 p-8 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-2xl shrink-0 border border-white/20 overflow-hidden flex items-center justify-center">
              {hospital.logo ? (
                <img
                  src={`http://localhost:5000${hospital.logo}`}
                  alt="logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building className="w-10 h-10 text-brand-500" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black">{hospital.name}</h1>
              <p className="text-slate-200 text-sm mt-1.5 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-rose-500" />
                {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pinCode}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20">
              <Star className="w-4 h-4 fill-white text-white" />
              {hospital.rating.toFixed(1)}
            </div>
            <a
              href={`tel:${hospital.phone}`}
              className="px-4 py-1.5 bg-white text-slate-800 hover:bg-slate-50 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-lg"
            >
              <Phone className="w-4 h-4 text-brand-500" /> Call Clinic
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">About the Hospital</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {hospital.description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 border-t pt-6 dark:border-slate-800">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Departments
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(hospital.departments) &&
                    hospital.departments.map((dept, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-full text-xs font-semibold"
                      >
                        {dept}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Emergency Line
                </span>
                <div className="flex items-center gap-2 text-rose-500 font-bold">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <span>{hospital.emergencyContact}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Heart className="w-6 h-6 text-brand-500" /> Assigned Doctors
              </h2>

              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute inset-y-0 left-3 flex items-center text-slate-400 w-4 h-4 mt-3" />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-slate-800 dark:text-white"
                    placeholder="Search doctor..."
                  />
                </div>
                <select
                  value={docSpec}
                  onChange={(e) => setDocSpec(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl glass-input text-slate-800 dark:text-white"
                >
                  <option value="">All Specialties</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="glass-panel border p-8 rounded-2xl text-center text-slate-400">
                No doctors assigned to this hospital matching the search criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDoctors.map((doc) => (
                  <GlassCard key={doc._id} className="flex gap-4 p-4 items-center justify-between">
                    <div className="flex gap-4 items-center">
                      {doc.user?.avatar ? (
                        <img
                          src={`http://localhost:5000${doc.user.avatar}`}
                          alt={doc.user.name}
                          className="w-14 h-14 rounded-2xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
                          {doc.user?.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                          Dr. {doc.user?.name}
                        </h4>
                        <p className="text-xs text-brand-500 font-medium">{doc.specialization}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Experience: {doc.experience} Years • Fees: ₹{doc.fees}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/patient/book/${doc.userId}?hospitalId=${hospital.id}`}
                      className="p-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-md flex items-center justify-center"
                      title="Book Appointment"
                    >
                      <Calendar className="w-4 h-4" />
                    </Link>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex flex-col gap-6">
          <GlassCard>
            <h3 className="font-bold text-slate-800 dark:text-white mb-3">Working Hours</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
              <Clock className="w-4.5 h-4.5 text-indigo-500" />
              <span>{hospital.openingHours}</span>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white mb-3">Map & Coordinates</h3>
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 relative flex flex-col justify-end p-4">
              {}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-100 dark:bg-slate-800/80">
                <MapPin className="w-8 h-8 text-rose-500 animate-bounce mb-2" />
                <span className="text-xs font-bold text-slate-800 dark:text-white">{hospital.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Lat: {hospital.latitude || 13.0601} • Lng: {hospital.longitude || 80.2505}
                </span>
              </div>

              {}
              <div className="relative z-10 grid grid-cols-2 gap-2 w-full">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude || 13.0601},${hospital.longitude || 80.2505}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 bg-slate-900/90 text-white text-center rounded-xl text-[10px] font-bold shadow-lg"
                >
                  Open Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude || 13.0601},${hospital.longitude || 80.2505}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 bg-brand-500 text-white text-center rounded-xl text-[10px] font-bold shadow-lg"
                >
                  Directions
                </a>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;
