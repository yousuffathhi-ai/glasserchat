import React, { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Shield,
  Bell,
  HardDrive,
  Lock,
  Sparkles,
  Check,
  Smartphone,
  Info,
  Camera,
  LogOut,
  UserPlus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';

interface SettingsViewProps {
  currentUser: UserProfile;
  registeredUsers?: UserProfile[];
  theme: ThemeMode;
  onUpdateTheme: (theme: ThemeMode) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenAuthModal?: () => void;
  onSwitchAccount?: (userId: string) => void;
  onClearAllData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  registeredUsers = [],
  theme,
  onUpdateTheme,
  onUpdateProfile,
  onOpenAuthModal,
  onSwitchAccount,
  onClearAllData,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [handle, setHandle] = useState(currentUser.handle);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [e2eeAlwaysOn, setE2eeAlwaysOn] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateProfile({ name, bio, handle });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div
      id="settings-view-panel"
      className={`flex flex-col h-full w-full border-r transition-all duration-300 select-none overflow-y-auto ${
        isSophisticatedDark
          ? 'bg-[#121417]/95 border-[#D4AF37]/20 backdrop-blur-2xl text-slate-100'
          : isGold
          ? 'bg-white/80 border-[#D4AF37]/25 backdrop-blur-xl text-slate-800'
          : 'bg-[#0B0D0E]/85 border-emerald-500/20 backdrop-blur-xl text-slate-100'
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-2">
        <h2
          className={`text-2xl font-extrabold font-display ${
            isSophisticatedDark || isGold ? 'gold-text-gradient' : 'emerald-text-gradient'
          }`}
        >
          Preferences & Account
        </h2>
        <p className="text-xs text-slate-400 mt-1">GlassChat Pro • Zero Dummy Data Mode</p>
      </div>

      <div className="p-6 space-y-6 max-w-xl">
        {/* Profile Card */}
        <div
          className={`p-5 rounded-3xl border ${
            isSophisticatedDark
              ? 'bg-[#16191E] border-[#D4AF37]/35 shadow-sm'
              : isGold
              ? 'bg-white/80 border-[#D4AF37]/40 shadow-sm'
              : 'bg-[#121619]/80 border-emerald-500/30'
          }`}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl border-2 border-[#D4AF37] p-0.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-[14px] object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-base font-bold w-full bg-transparent border-b border-dashed border-[#D4AF37]/50 outline-none pb-0.5 text-slate-100"
                placeholder="Your Name"
              />
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="text-xs text-slate-400 w-full bg-transparent border-b border-dashed border-slate-700 outline-none mt-1"
                placeholder="@handle"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[11px] font-bold text-[#D4AF37] uppercase">Bio Status</label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs mt-1 outline-none ${
                isSophisticatedDark
                  ? 'bg-[#0E1013] border-[#D4AF37]/25 text-slate-100 focus:border-[#D4AF37]'
                  : 'bg-white border-slate-200 text-slate-900 focus:border-[#D4AF37]'
              }`}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSaved ? 'Profile Updated' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Registered Accounts Management */}
        <div
          className={`p-5 rounded-3xl border space-y-3 ${
            isSophisticatedDark
              ? 'bg-[#16191E] border-[#D4AF37]/35'
              : isGold
              ? 'bg-white/80 border-[#D4AF37]/40 shadow-sm'
              : 'bg-[#121619]/80 border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Registered Profiles ({registeredUsers.length})
            </h3>
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add / Switch</span>
              </button>
            )}
          </div>

          {registeredUsers.length > 0 && (
            <div className="space-y-2">
              {registeredUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-[#1A1D23] border-[#D4AF37]'
                        : 'bg-black/30 border-transparent hover:border-[#D4AF37]/30 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isCurrent && onSwitchAccount) onSwitchAccount(u.id);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-xl object-cover border border-[#D4AF37]/40"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-100 flex items-center space-x-1">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.2 rounded font-semibold">
                              ACTIVE
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">{u.handle}</p>
                      </div>
                    </div>

                    {!isCurrent && (
                      <span className="text-[11px] font-bold text-[#D4AF37]">
                        Switch
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme Appearance Selector */}
        <div
          className={`p-5 rounded-3xl border ${
            isSophisticatedDark
              ? 'bg-[#16191E] border-[#D4AF37]/35'
              : isGold
              ? 'bg-white/80 border-[#D4AF37]/40 shadow-sm'
              : 'bg-[#121619]/80 border-emerald-500/30'
          }`}
        >
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Theme Aesthetic
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onUpdateTheme('sophisticated-dark')}
              className={`p-3 rounded-2xl border flex flex-col items-center space-y-1.5 transition-all ${
                theme === 'sophisticated-dark'
                  ? 'bg-[#1E2229] border-[#D4AF37] ring-1 ring-[#D4AF37]'
                  : 'bg-[#0E1013] border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#121417] to-[#D4AF37] flex items-center justify-center text-xs text-white">
                ★
              </div>
              <span className="text-[11px] font-bold text-center">Sophisticated Dark</span>
            </button>

            <button
              onClick={() => onUpdateTheme('gold-light')}
              className={`p-3 rounded-2xl border flex flex-col items-center space-y-1.5 transition-all ${
                theme === 'gold-light'
                  ? 'bg-amber-50/80 border-[#D4AF37] ring-1 ring-[#D4AF37]'
                  : 'bg-[#0E1013] border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <Sun className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[11px] font-bold text-center">Gold Pearl</span>
            </button>

            <button
              onClick={() => onUpdateTheme('dark-emerald')}
              className={`p-3 rounded-2xl border flex flex-col items-center space-y-1.5 transition-all ${
                theme === 'dark-emerald'
                  ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500'
                  : 'bg-[#0E1013] border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <Moon className="w-5 h-5 text-emerald-400" />
              <span className="text-[11px] font-bold text-center">Dark Emerald</span>
            </button>
          </div>
        </div>

        {/* Security & Privacy Settings */}
        <div
          className={`p-5 rounded-3xl border space-y-3 ${
            isSophisticatedDark
              ? 'bg-[#16191E] border-[#D4AF37]/35'
              : isGold
              ? 'bg-white/80 border-[#D4AF37]/40 shadow-sm'
              : 'bg-[#121619]/80 border-emerald-500/30'
          }`}
        >
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Privacy & Security
          </h3>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-bold text-slate-200">256-bit AES E2EE Shield</p>
              <p className="text-[10px] text-slate-400">Enforce zero-knowledge client encryption</p>
            </div>
            <button
              onClick={() => setE2eeAlwaysOn(!e2eeAlwaysOn)}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                e2eeAlwaysOn ? 'bg-[#D4AF37]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  e2eeAlwaysOn ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-bold text-slate-200">Push Notifications</p>
              <p className="text-[10px] text-slate-400">Desktop & mobile audio haptic alerts</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                notificationsEnabled ? 'bg-[#D4AF37]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Storage Reset Option */}
        {onClearAllData && (
          <div className="pt-2">
            <button
              onClick={onClearAllData}
              className="w-full py-2.5 px-4 rounded-2xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Local Storage & Reset</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-slate-400">GlassChat Pro • Zero Dummy Data</p>
          <p className="text-[9px] text-[#D4AF37] font-bold mt-0.5">
            Crafted for high-end privacy & real registered data
          </p>
        </div>
      </div>
    </div>
  );
};
