import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import GlassCard from './GlassCard';
import { MapPin, Navigation, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

const HospitalRouteMap = ({
  hospitalLatitude,
  hospitalLongitude,
  hospitalName,
  hospitalAddress
}) => {
  const [patientCoords, setPatientCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt'); // prompt, granted, denied, unsupported
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Check geolocation support
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
    }
  }, []);

  // Request location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      return;
    }

    setLoading(true);
    setError(null);

    // Ask user for permission message
    const confirmation = window.confirm(
      "Allow AI-HAS to access your location to calculate the distance and route to the hospital."
    );

    if (!confirmation) {
      setPermissionState('denied');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPatientCoords({ lat: latitude, lng: longitude });
        setPermissionState('granted');
        setLoading(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        setPermissionState('denied');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fetch routing information (OSRM)
  const fetchRoute = async (patLat, patLng, hospLat, hospLng) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${patLng},${patLat};${hospLng},${hospLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0];
        setDistance((route.distance / 1000).toFixed(1)); // meters to km
        setDuration(Math.round(route.duration / 60)); // seconds to minutes
        return route.geometry.coordinates.map((coord) => [coord[1], coord[0]]); // GeoJSON is [lng, lat]
      }
      throw new Error('Routing service returned error code');
    } catch (err) {
      console.warn('OSRM routing failed, falling back to straight line:', err);
      // Fallback: Haversine straight line distance
      const straightLineDist = calculateHaversine(patLat, patLng, hospLat, hospLng);
      setDistance(straightLineDist.toFixed(1) + ' (approx.)');
      // Assume average speed 25 km/h for estimation
      setDuration(Math.round((straightLineDist / 25) * 60));
      return [
        [patLat, patLng],
        [hospLat, hospLng]
      ];
    }
  };

  // Straight line distance fallback formula
  const calculateHaversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize and update Map
  useEffect(() => {
    if (!hospitalLatitude || !hospitalLongitude) return;
    if (permissionState !== 'granted' || !patientCoords) return;

    // Wait a brief tick to ensure DOM is rendered
    const timer = setTimeout(async () => {
      if (!mapContainerRef.current) return;

      // Clean up previous map if exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      try {
        const routeCoords = await fetchRoute(
          patientCoords.lat,
          patientCoords.lng,
          hospitalLatitude,
          hospitalLongitude
        );

        // Initialize Map
        const map = L.map(mapContainerRef.current).setView(
          [hospitalLatitude, hospitalLongitude],
          13
        );
        mapRef.current = map;

        // Add Dark Mode/Sleek Theme Tiles (CartoDB Dark Matter matches dark theme)
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            attribution: '&copy; OpenStreetMap &copy; CartoDB',
            subdomains: 'abcd',
            maxZoom: 20
          }
        ).addTo(map);

        // Custom Markers
        const patientIcon = L.divIcon({
          html: `<div class="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-lg border border-white animate-pulse"><span class="text-sm">📍</span></div>`,
          className: 'custom-div-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const hospitalIcon = L.divIcon({
          html: `<div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-white"><span class="text-base">🏥</span></div>`,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        // Add Markers
        L.marker([patientCoords.lat, patientCoords.lng], { icon: patientIcon })
          .addTo(map)
          .bindPopup('Your Current Location');

        L.marker([hospitalLatitude, hospitalLongitude], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(`<strong>${hospitalName}</strong><br/>${hospitalAddress}`);

        // Draw Polyline Route
        L.polyline(routeCoords, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '5, 8'
        }).addTo(map);

        // Fit map boundaries to fit route
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (err) {
        console.error('Leaflet initialization failed:', err);
        setError('Unable to load route information right now.');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [patientCoords, permissionState, hospitalLatitude, hospitalLongitude]);

  // Open in external maps handler
  const openExternalMap = () => {
    let url = '';
    if (patientCoords) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${patientCoords.lat},${patientCoords.lng}&destination=${hospitalLatitude},${hospitalLongitude}&travelmode=driving`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${hospitalLatitude},${hospitalLongitude}`;
    }
    window.open(url, '_blank');
  };

  // If coordinates are missing
  if (!hospitalLatitude || !hospitalLongitude) {
    return (
      <GlassCard className="p-5 border dark:border-slate-800/80 flex flex-col gap-4 text-center">
        <div className="flex flex-col items-center gap-2 py-4">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <h4 className="font-bold text-slate-850 dark:text-white text-sm">Hospital location is currently unavailable</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {hospitalAddress || 'Address details not set.'}
          </p>
        </div>
        <button
          onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospitalName + ' ' + hospitalAddress)}`, '_blank')}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <ExternalLink className="w-4 h-4" /> Open in Maps
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 border dark:border-slate-800/80 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
          <MapPin className="w-4.5 h-4.5 text-brand-500" /> Hospital Location & Route
        </h4>
        {permissionState === 'granted' && (
          <button
            onClick={() => requestLocation()}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
            title="Refresh Location"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-400">
        <div className="font-bold text-slate-800 dark:text-white text-sm">{hospitalName}</div>
        <div className="text-[11px] text-slate-450 mt-0.5">{hospitalAddress}</div>
      </div>

      {permissionState === 'prompt' && (
        <div className="bg-brand-500/5 border border-brand-500/20 p-5 rounded-2xl flex flex-col items-center gap-3 text-center">
          <Navigation className="w-8 h-8 text-brand-500 animate-pulse" />
          <p className="text-xs text-slate-655 dark:text-slate-400 max-w-xs leading-relaxed">
            Allow AI-HAS to access your location to calculate the distance and route to the hospital.
          </p>
          <div className="flex gap-2.5 w-full mt-1">
            <button
              onClick={requestLocation}
              className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 transition-all"
            >
              Allow Location
            </button>
            <button
              onClick={openExternalMap}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1"
            >
              Open in Maps <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {permissionState === 'denied' && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-7 h-7 text-amber-500" />
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed max-w-xs">
            Location access is required to calculate your distance from the hospital.
          </p>
          <div className="flex gap-2.5 w-full mt-1">
            <button
              onClick={requestLocation}
              className="flex-1 py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-500 dark:text-brand-400 font-bold rounded-xl text-xs transition-all"
            >
              Allow Location
            </button>
            <button
              onClick={openExternalMap}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1"
            >
              Open Route in Maps <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {permissionState === 'unsupported' && (
        <div className="bg-slate-500/5 border border-slate-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 text-center text-xs text-slate-600 dark:text-slate-400">
          <span>Your browser does not support location services.</span>
          <button
            onClick={openExternalMap}
            className="w-full mt-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          >
            Open Hospital Location <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {permissionState === 'granted' && (
        <div className="flex flex-col gap-4">
          {/* Distance and Travel Time Row */}
          {distance !== null && duration !== null && (
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-450">
                <span className="text-base">📏</span>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Distance</span>
                  <strong className="text-slate-850 dark:text-white text-sm">{distance} km</strong>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-450">
                <span className="text-base">🚗</span>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">Estimated Time</span>
                  <strong className="text-slate-850 dark:text-white text-sm">{duration} min</strong>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="h-[300px] md:h-[350px] bg-slate-100 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center border dark:border-slate-800">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-center flex flex-col gap-3">
              <span className="text-xs text-rose-500 font-medium">{error}</span>
              <button
                onClick={openExternalMap}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
              >
                Open in Maps <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              ref={mapContainerRef}
              className="h-[300px] md:h-[350px] w-full rounded-2xl border dark:border-slate-800 overflow-hidden shadow-inner z-10"
              style={{ minHeight: '300px' }}
            />
          )}

          <button
            onClick={openExternalMap}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/10 transition-all"
          >
            Open Route in Maps <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </GlassCard>
  );
};

export default HospitalRouteMap;
