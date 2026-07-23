import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import { Search, MapPin, Phone, Clock, Star, ArrowRight, Map, Heart, Compass } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';

const Hospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [cities, setCities] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedHospitalForMap, setSelectedHospitalForMap] = useState(null);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await API.get('/hospitals', {
        params: {
          search,
          city: selectedCity,
          department: selectedDept,
          sort: sortBy
        }
      });
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [search, selectedCity, selectedDept, sortBy]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await API.get('/hospitals');
        if (res.data.success) {
          const list = res.data.hospitals;
          const uniqueCities = [...new Set(list.map(h => h.city))];
          setCities(uniqueCities);

          const allDepts = [];
          list.forEach(h => {
            if (Array.isArray(h.departments)) {
              allDepts.push(...h.departments);
            }
          });
          setDepartments([...new Set(allDepts)]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchMetadata();
  }, []);

  const openMap = (hospital) => {
    setSelectedHospitalForMap(hospital);
    setShowMapModal(true);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-900 dark:to-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/10">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Compass className="w-8 h-8 text-white animate-pulse" /> Find Hospitals
          </h1>
          <p className="text-brand-100 text-sm mt-1">
            Browse registered hospitals, check departments, and consult leading practitioners in India.
          </p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        {}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm text-slate-800 dark:text-white"
            placeholder="Search hospitals..."
          />
        </div>

        {}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 py-3 rounded-2xl glass-input text-sm text-slate-800 dark:text-white"
        >
          <option value="">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-4 py-3 rounded-2xl glass-input text-sm text-slate-800 dark:text-white"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 rounded-2xl glass-input text-sm text-slate-800 dark:text-white"
        >
          <option value="rating">Sort by Rating</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : hospitals.length === 0 ? (
        <div className="glass-panel rounded-2xl border p-12 text-center text-slate-400 dark:text-slate-500">
          <Map className="w-12 h-12 mx-auto mb-3 opacity-30 text-brand-500" />
          <p className="font-semibold text-sm">No hospitals match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <GlassCard key={hospital.id} className="flex flex-col h-full overflow-hidden p-0 relative group">
              {}
              <div className="h-40 w-full overflow-hidden relative bg-slate-200 dark:bg-slate-800">
                {hospital.banner ? (
                  <img
                    src={`http://localhost:5000${hospital.banner}`}
                    alt={hospital.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-brand-500/20 to-indigo-500/20 flex items-center justify-center text-brand-500">
                    <Map className="w-12 h-12 opacity-50" />
                  </div>
                )}
                {}
                <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 p-1 shadow-lg overflow-hidden border border-white/20">
                  {hospital.logo ? (
                    <img
                      src={`http://localhost:5000${hospital.logo}`}
                      alt="logo"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-black text-sm">
                      {hospital.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {}
              <div className="p-6 flex flex-col flex-1 gap-4 justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-snug group-hover:text-brand-500 transition-colors">
                      {hospital.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-semibold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {hospital.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{hospital.address}, {hospital.city}</span>
                  </div>

                  {}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {Array.isArray(hospital.departments) &&
                      hospital.departments.map((dept, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-semibold"
                        >
                          {dept}
                        </span>
                      ))}
                  </div>

                  {}
                  <div className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand-500" />
                      <span>{hospital.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{hospital.openingHours}</span>
                    </div>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to={`/patient/hospitals/${hospital.id}`}
                    className="py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 transition-all"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => openMap(hospital)}
                    className="py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all"
                  >
                    View Map
                  </button>
                  <Link
                    to={`/patient/doctors?hospitalId=${hospital.id}`}
                    className="py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold text-center transition-all"
                  >
                    Doctors
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {}
      {showMapModal && selectedHospitalForMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-2xl flex flex-col gap-4 border border-white/20 p-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" /> Map: {selectedHospitalForMap.name}
              </h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
              >
                ✕
              </button>
            </div>

            {}
            <div className="h-80 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border relative flex flex-col items-center justify-center">
              {}
              <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800/80 flex flex-col items-center justify-center gap-2 p-6 text-center">
                <div className="p-4 bg-brand-500 text-white rounded-full animate-bounce shadow-xl">
                  <MapPin className="w-8 h-8" />
                </div>
                <div className="z-10">
                  <span className="font-bold text-slate-800 dark:text-white text-sm block">
                    {selectedHospitalForMap.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block max-w-md mx-auto mt-1">
                    Latitude: {selectedHospitalForMap.latitude || 13.0601} • Longitude: {selectedHospitalForMap.longitude || 80.2505}
                  </span>
                </div>
              </div>

              {}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedHospitalForMap.latitude || 13.0601},${selectedHospitalForMap.longitude || 80.2505}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900/90 text-white hover:bg-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
                >
                  Open in Google Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospitalForMap.latitude || 13.0601},${selectedHospitalForMap.longitude || 80.2505}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-brand-500 text-white hover:bg-brand-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
                >
                  Get Directions
                </a>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Hospitals;
