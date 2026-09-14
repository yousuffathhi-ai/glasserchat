import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, Radio, X, Check } from 'lucide-react';
import { LocationData } from '../../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareLocation: (loc: LocationData) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onShareLocation,
}) => {
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [placeName, setPlaceName] = useState('San Francisco Downtown Hub');
  const [address, setAddress] = useState('Market St, San Francisco, CA');
  const [isLive, setIsLive] = useState(false);
  const [isFetchingGps, setIsFetchingGps] = useState(false);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      setIsFetchingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setPlaceName('Current GPS Location');
          setAddress(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
          setIsFetchingGps(false);
        },
        () => {
          setIsFetchingGps(false);
        },
        { timeout: 5000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const popularPlaces = [
    { name: 'San Francisco Tech Hub', address: 'Market St & 4th, CA', lat: 37.7749, lng: -122.4194 },
    { name: 'Silicon Valley Campus', address: 'Mountain View, CA', lat: 37.3861, lng: -122.0839 },
    { name: 'New York Central Hub', address: 'Broadway, New York, NY', lat: 40.7128, lng: -74.006 },
    { name: 'London Tech City', address: 'Old St, London, UK', lat: 51.5074, lng: -0.1278 },
  ];

  const handleShare = () => {
    onShareLocation({
      latitude: lat,
      longitude: lng,
      name: placeName,
      address,
      isLive,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#0E1118] border border-[#00F0FF]/30 shadow-2xl p-6 text-slate-100 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black font-display text-white">Share Location</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Map Visual Simulator */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-[#121E2E] via-[#0E1724] to-[#0A101A] border border-white/10 mb-4 flex items-center justify-center shadow-inner">
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#00F0FF_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

          {/* Radar circle pulse */}
          <div className="absolute w-28 h-28 rounded-full border border-[#00F0FF]/40 animate-ping opacity-30" />
          <div className="absolute w-16 h-16 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/50 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#00F0FF] shadow-[0_0_12px_#00F0FF]" />
          </div>

          <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{placeName}</p>
              <p className="text-[10px] text-slate-400 truncate">{address}</p>
            </div>
            {isLive && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>Live GPS</span>
              </span>
            )}
          </div>
        </div>

        {/* Live GPS Sharing Toggle */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${isLive ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-slate-400'}`}>
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Share Live Location</p>
              <p className="text-[10px] text-slate-400">Updates dynamically as you move</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              isLive ? 'bg-gradient-to-r from-[#FF007F] to-[#007AFF]' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isLive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Quick Landmarks */}
        <div className="space-y-1.5 mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or Choose Preset Hub
          </p>
          <div className="grid grid-cols-2 gap-2">
            {popularPlaces.map((place, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLat(place.lat);
                  setLng(place.lng);
                  setPlaceName(place.name);
                  setAddress(place.address);
                }}
                className={`p-2 rounded-xl text-left border transition-all ${
                  placeName === place.name
                    ? 'bg-[#00F0FF]/10 border-[#00F0FF]/50 text-white'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <p className="text-[11px] font-bold truncate">{place.name}</p>
                <p className="text-[9px] text-slate-400 truncate">{place.address}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] via-[#007AFF] to-[#8A2BE2] text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all flex items-center space-x-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isLive ? 'Share Live GPS' : 'Share Location'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
