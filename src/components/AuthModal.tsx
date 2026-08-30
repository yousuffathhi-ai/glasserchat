import React, { useState, useRef } from 'react';
import {
  Sparkles,
  User,
  AtSign,
  Phone,
  Lock,
  Camera,
  Upload,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Users,
  LogIn,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  registeredUsers: UserProfile[];
  onRegister: (userData: {
    name: string;
    handle: string;
    email?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    pinLock?: string;
  }) => void;
  onLogin: (userId: string) => void;
  theme: ThemeMode;
  canDismiss?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  registeredUsers,
  onRegister,
  onLogin,
  theme,
  canDismiss = false,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';

  // Mode: 'register' | 'login' | 'switch'
  const [mode, setMode] = useState<'register' | 'login' | 'switch'>(
    registeredUsers.length > 0 ? 'login' : 'register'
  );

  // Registration Fields
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [bio, setBio] = useState('Liquid Gold & E2EE Enthusiast ✨');
  const [pinLock, setPinLock] = useState('1234');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Camera Snapshot State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle custom image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const res = event.target.result as string;
          setAvatarPreview(res);
          setSelectedAvatar(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Start live webcam for avatar
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
    }
  };

  // Capture snapshot from webcam
  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 400;
    canvas.height = videoRef.current.videoHeight || 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setAvatarPreview(dataUrl);
      setSelectedAvatar(dataUrl);
    }
    // Stop stream
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setIsCameraActive(false);
  };

  // Submit Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!handle.trim()) {
      setErrorMsg('Please choose a username or handle.');
      return;
    }

    // Check if handle already taken
    const formatted = handle.startsWith('@') ? handle.toLowerCase() : `@${handle.toLowerCase()}`;
    const handleExists = registeredUsers.some(
      (u) => u.handle.toLowerCase() === formatted
    );
    if (handleExists) {
      setErrorMsg('This handle is already registered. Please choose another.');
      return;
    }

    onRegister({
      name: name.trim(),
      handle: handle.trim(),
      email: emailOrPhone.includes('@') ? emailOrPhone.trim() : undefined,
      phone: !emailOrPhone.includes('@') && emailOrPhone ? emailOrPhone.trim() : undefined,
      bio: bio.trim(),
      avatar: selectedAvatar,
      pinLock: pinLock || '1234',
    });

    if (onClose) onClose();
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your username, handle or email.');
      return;
    }

    const clean = loginIdentifier.trim().toLowerCase();
    const found = registeredUsers.find(
      (u) =>
        u.handle.toLowerCase() === (clean.startsWith('@') ? clean : `@${clean}`) ||
        u.email?.toLowerCase() === clean ||
        u.name.toLowerCase() === clean
    );

    if (!found) {
      setErrorMsg('No registered account found with these details. Please register first.');
      return;
    }

    onLogin(found.id);
    if (onClose) onClose();
  };

  return (
    <div
      id="glasschat-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300 select-none overflow-y-auto"
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-6 md:p-8 border shadow-[0_20px_80px_rgba(0,0,0,0.8)] transition-all relative ${
          isSophisticatedDark
            ? 'bg-[#121417] border-[#D4AF37]/35 text-slate-100'
            : isGold
            ? 'bg-white border-[#D4AF37]/40 text-slate-900'
            : 'bg-[#0F1316] border-emerald-500/35 text-slate-100'
        } backdrop-blur-3xl`}
      >
        {/* Dismiss Button if allowed */}
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* High-Class GlassChat Hero Banner */}
        <div className="relative mb-6 p-5 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden text-center flex flex-col items-center">
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Logo Mark */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0F172A] to-[#1E293B] border border-cyan-400/40 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)] mb-2.5">
            <img src="/icon.svg" alt="GlassChat Logo" className="w-9 h-9 object-contain" />
          </div>

          {/* Cyan to Emerald Text Gradient Title */}
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent mb-1">
            GlassChat
          </h1>

          {/* Tagline: Clear as Glass, Class as Always */}
          <p className="text-[11px] sm:text-xs font-extrabold text-gray-300 tracking-widest uppercase mb-3">
            Clear as Glass, Class as Always
          </p>

          {/* Feature Highlights Strip */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-white/10 w-full text-[10px] sm:text-[11px] font-semibold text-slate-300">
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
              <span>⚡ Crystal Clear WebRTC Calls</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <span>🔒 End-to-End Encrypted</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-white/10 flex items-center gap-1">
              <span>📱 Full PWA Support</span>
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/30 border border-[#D4AF37]/20 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up / Register</span>
          </button>

          {registeredUsers.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}

          {registeredUsers.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setMode('switch');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'switch'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Accounts ({registeredUsers.length})</span>
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* ================= REGISTER MODE ================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Avatar Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2 text-center">
                Choose Profile Avatar
              </label>
              
              <div className="flex flex-col items-center justify-center mb-3">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl border-2 border-[#D4AF37] p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                    <img
                      src={selectedAvatar}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-[14px] object-cover"
                    />
                  </div>
                </div>

                {/* Avatar presets */}
                <div className="flex items-center space-x-2 mt-3 overflow-x-auto max-w-full pb-1">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedAvatar === av
                          ? 'border-[#D4AF37] scale-110 shadow-md ring-2 ring-[#D4AF37]/50'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  
                  {/* Upload custom button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload Custom Photo"
                    className="w-9 h-9 rounded-xl border border-dashed border-[#D4AF37]/60 flex items-center justify-center text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37] shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {/* Live Camera Snapshot */}
                  <button
                    type="button"
                    onClick={startCamera}
                    title="Take Camera Photo"
                    className="w-9 h-9 rounded-xl border border-dashed border-[#D4AF37]/60 flex items-center justify-center text-slate-400 hover:text-[#D4AF37] hover:border-[#D4AF37] shrink-0"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Live Camera Snapshot View */}
                {isCameraActive && (
                  <div className="mt-3 p-3 rounded-2xl bg-black/60 border border-[#D4AF37]/30 flex flex-col items-center">
                    <video ref={videoRef} className="w-48 h-36 rounded-xl object-cover mb-2" autoPlay playsInline />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={captureCameraSnapshot}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs font-bold"
                      >
                        Capture Snapshot
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCameraActive(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Full Name <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Shahfiya Farwin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-[#D4AF37]/25 text-slate-100 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Handle */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Username / Handle <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. @shahfiya"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-[#D4AF37]/25 text-slate-100 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Email / Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Email or Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. shahfiyafarwin@gmail.com or +1 (555) 019-2834"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-[#D4AF37]/25 text-slate-100 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Custom Tagline / Status
              </label>
              <input
                type="text"
                placeholder="e.g. Building the future of encrypted liquid glass ✨"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-[#D4AF37]/25 text-slate-100 outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Security PIN */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Security Passcode PIN (4 digits)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  maxLength={6}
                  placeholder="1234"
                  value={pinLock}
                  onChange={(e) => setPinLock(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-[#D4AF37]/25 text-slate-100 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#B8860B] text-slate-950 font-black text-sm shadow-[0_4px_24px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <span>Complete Registration & Enter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ================= SIGN IN MODE ================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Username, Handle or Email
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. @shahfiya or user@example.com"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-black/40 border border-[#D4AF37]/25 text-slate-100 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Passcode PIN (Optional)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="1234"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-black/40 border border-[#D4AF37]/25 text-slate-100 outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Quick list of registered accounts */}
            {registeredUsers.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">
                  Or choose a registered account:
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {registeredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        onLogin(user.id);
                        if (onClose) onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 hover:bg-[#1C2027] border border-[#D4AF37]/20 hover:border-[#D4AF37] cursor-pointer transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl object-cover border border-[#D4AF37]/50"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-100">{user.name}</p>
                          <p className="text-[10px] text-slate-400">{user.handle}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#D4AF37] flex items-center space-x-1">
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#B8860B] text-slate-950 font-black text-sm shadow-[0_4px_24px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all flex items-center justify-center space-x-2 mt-4"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ================= SWITCH ACCOUNT MODE ================= */}
        {mode === 'switch' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Select any registered account to switch active session immediately:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {registeredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onLogin(user.id);
                    if (onClose) onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-black/40 hover:bg-[#1C2027] border border-[#D4AF37]/25 hover:border-[#D4AF37] cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-[#D4AF37]"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-[#D4AF37] font-medium">{user.handle}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{user.bio}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs font-bold">
                    Switch
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setName('');
                setHandle('');
                setEmailOrPhone('');
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#D4AF37]/50 text-xs font-bold text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center space-x-1.5 transition-all mt-3"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Another New User</span>
            </button>
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center space-x-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>256-bit AES GCM Local Zero-Knowledge Isolation</span>
        </div>
      </div>
    </div>
  );
};
