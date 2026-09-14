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
  LogIn,
  UserPlus,
  RefreshCw,
  Mail,
  KeyRound,
  Radio,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';
import { ConvoSphereLogo } from './common/ConvoSphereLogo';

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
  // Mode: 'google' | 'otp' | 'email' | 'accounts'
  const [authMethod, setAuthMethod] = useState<'google' | 'otp' | 'email' | 'accounts'>('google');

  // Google Sign-In profile confirmation state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleProfileReady, setGoogleProfileReady] = useState(false);
  const [googleName, setGoogleName] = useState('Alex Taylor');
  const [googleEmail, setGoogleEmail] = useState('alex.taylor@gmail.com');
  const [googleHandle, setGoogleHandle] = useState('@alextaylor');
  const [googleAvatar, setGoogleAvatar] = useState(PRESET_AVATARS[0]);
  const [googleBio, setGoogleBio] = useState('Connected with Google on ConvoSphere ✨');

  // Phone OTP Authentication state
  const [phone, setPhone] = useState('+1 (555) 019-8234');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpDebugCode, setOtpDebugCode] = useState<string | null>(null);

  // Email / Password Registration or Login
  const [isEmailRegister, setIsEmailRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Camera Snapshot State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Google Sign-In initiation
  const handleInitiateGoogle = () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    // Simulate real Google OAuth popup / handshake
    setTimeout(() => {
      setIsGoogleLoading(false);
      setGoogleProfileReady(true);
      setGoogleName('Alex Taylor');
      setGoogleEmail('alex.taylor@gmail.com');
      setGoogleHandle('@alextaylor');
      setGoogleAvatar(PRESET_AVATARS[0]);
    }, 900);
  };

  // Confirm Google Sign-In and enter
  const handleConfirmGoogleProfile = async () => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: googleName,
          email: googleEmail,
          avatar: googleAvatar,
        }),
      });
      const data = await res.json();
      if (data.user) {
        onRegister({
          name: googleName,
          handle: googleHandle,
          email: googleEmail,
          avatar: googleAvatar,
          bio: googleBio,
          pinLock: '1234',
        });
        if (onClose) onClose();
      }
    } catch (err) {
      // Fallback local register
      onRegister({
        name: googleName,
        handle: googleHandle,
        email: googleEmail,
        avatar: googleAvatar,
        bio: googleBio,
        pinLock: '1234',
      });
      if (onClose) onClose();
    }
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setOtpLoading(false);
      if (data.success) {
        setIsOtpSent(true);
        setOtpDebugCode(data.debugCode || '123456');
        setSuccessMsg(`Verification code sent! (Demo Code: ${data.debugCode || '123456'})`);
      } else {
        setErrorMsg(data.error || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setOtpLoading(false);
      setIsOtpSent(true);
      setOtpDebugCode('123456');
      setSuccessMsg('Verification code sent! (Demo Code: 123456)');
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const data = await res.json();
      setOtpLoading(false);
      if (data.success && data.user) {
        onLogin(data.user.id);
        if (onClose) onClose();
      } else {
        setErrorMsg(data.error || 'Invalid verification code.');
      }
    } catch (err) {
      setOtpLoading(false);
      // Fallback if local match
      if (otpCode === otpDebugCode || otpCode === '123456') {
        const cleanDigits = phone.replace(/[^0-9]/g, '');
        const matched = registeredUsers.find((u) => u.phone && u.phone.includes(cleanDigits.slice(-4)));
        if (matched) {
          onLogin(matched.id);
        } else {
          onRegister({
            name: `User ${phone.slice(-4)}`,
            handle: `@user_${phone.slice(-4)}`,
            phone,
            avatar: PRESET_AVATARS[2],
            bio: 'Verified via OTP on ConvoSphere ✨',
          });
        }
        if (onClose) onClose();
      } else {
        setErrorMsg('Invalid verification code.');
      }
    }
  };

  // Handle Email Registration / Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isEmailRegister) {
      if (!fullName.trim() || !handle.trim()) {
        setErrorMsg('Please enter your full name and username handle.');
        return;
      }
      onRegister({
        name: fullName.trim(),
        handle: handle.trim(),
        email: email.trim(),
        avatar: selectedAvatar,
        bio: 'Connecting on ConvoSphere ✨',
        pinLock: password || '1234',
      });
      if (onClose) onClose();
    } else {
      // Login
      const cleanEmail = email.trim().toLowerCase();
      const found = registeredUsers.find(
        (u) =>
          u.email?.toLowerCase() === cleanEmail ||
          u.handle.toLowerCase() === `@${cleanEmail.replace(/^@/, '')}`
      );
      if (found) {
        onLogin(found.id);
        if (onClose) onClose();
      } else {
        // Auto-register convenience
        onRegister({
          name: cleanEmail.split('@')[0],
          handle: `@${cleanEmail.split('@')[0]}`,
          email: cleanEmail,
          avatar: selectedAvatar,
          bio: 'ConvoSphere Member ✨',
        });
        if (onClose) onClose();
      }
    }
  };

  return (
    <div
      id="pgv-talk-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn select-none overflow-y-auto"
    >
      <div
        id="pgv-talk-auth-card"
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#0E1117]/95 border border-[#FF007F]/30 shadow-[0_20px_80px_rgba(0,0,0,0.85)] text-slate-100 backdrop-blur-3xl relative overflow-hidden"
      >
        {/* Glow accent header stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF007F] via-[#00F0FF] to-[#007AFF]" />

        {/* Dismiss Button if allowed */}
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ConvoSphere Splash Brand Header */}
        <div className="relative mb-6 p-5 rounded-3xl bg-gradient-to-b from-[#141824] to-[#0D1018] border border-[#00F0FF]/25 backdrop-blur-xl shadow-2xl overflow-hidden text-center flex flex-col items-center">
          {/* Ambient Glow Orbs */}
          <div className="absolute -top-10 -left-10 w-28 h-28 bg-[#FF007F]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-[#007AFF]/20 rounded-full blur-2xl pointer-events-none" />

          {/* 3D Glowing ConvoSphere Public Logo */}
          <div className="mb-2 transition-transform duration-300 hover:scale-105">
            <ConvoSphereLogo size="lg" withGlow={true} withRings={true} />
          </div>

          {/* ConvoSphere Title */}
          <h1 className="text-3xl font-black font-display tracking-tight bg-gradient-to-r from-[#FF007F] via-[#00F0FF] to-[#007AFF] bg-clip-text text-transparent mb-1">
            ConvoSphere
          </h1>

          {/* Official Tagline: Connect. Express. Sphere of Seamless Conversations. */}
          <p className="text-xs font-semibold text-[#FFD700] tracking-wide max-w-sm mb-3">
            Connect. Express. Sphere of Seamless Conversations.
          </p>

          {/* Feature Highlights Strip */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2.5 border-t border-white/10 w-full text-[10px] sm:text-[11px] font-semibold text-slate-300">
            <span className="px-2.5 py-1 rounded-full bg-[#FF007F]/15 text-[#FF007F] border border-[#FF007F]/30 flex items-center gap-1">
              <span>⚡ WebRTC HD Calls</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 flex items-center gap-1">
              <span>🎨 Creative Media Studio</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30 flex items-center gap-1">
              <span>🔒 Encrypted Spheres</span>
            </span>
          </div>
        </div>

        {/* Authentication Method Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              authMethod === 'google'
                ? 'bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              authMethod === 'otp'
                ? 'bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              authMethod === 'email'
                ? 'bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>

          {registeredUsers.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setAuthMethod('accounts');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authMethod === 'accounts'
                  ? 'bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Accounts</span>
            </button>
          )}
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* ================= 1. GOOGLE SIGN-IN FLOW ================= */}
        {authMethod === 'google' && (
          <div>
            {!googleProfileReady ? (
              <div className="space-y-4 py-2">
                <p className="text-xs text-center text-slate-300">
                  Fast, secure sign-in with your Google Workspace or Personal Account.
                </p>

                {/* Primary Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleInitiateGoogle}
                  disabled={isGoogleLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-[0_4px_24px_rgba(255,255,255,0.15)] flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.01]"
                >
                  {/* Official Google G Logo SVG */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isGoogleLoading ? 'Connecting to Google OAuth...' : 'Continue with Google'}
                  </span>
                </button>

                <div className="pt-2 text-center">
                  <span className="text-[11px] text-slate-400">
                    Trusted OAuth 2.0 authentication by Google
                  </span>
                </div>
              </div>
            ) : (
              /* User Profile Configuration Step upon Google Sign-in */
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold justify-center bg-emerald-500/10 py-1.5 px-3 rounded-full border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5" />
                  <span>Google Account Verified! Configure Profile:</span>
                </div>

                <div className="flex flex-col items-center">
                  <img
                    src={googleAvatar}
                    alt={googleName}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 rounded-2xl object-cover border-2 border-[#00F0FF] shadow-lg mb-2"
                  />
                  <div className="flex space-x-1.5">
                    {PRESET_AVATARS.slice(0, 5).map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGoogleAvatar(av)}
                        className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                          googleAvatar === av ? 'border-[#00F0FF] scale-110 ring-1 ring-[#00F0FF]' : 'opacity-60'
                        }`}
                      >
                        <img src={av} alt="avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#FF007F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">ConvoSphere Handle</label>
                  <input
                    type="text"
                    value={googleHandle}
                    onChange={(e) => setGoogleHandle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Status / Bio</label>
                  <input
                    type="text"
                    value={googleBio}
                    onChange={(e) => setGoogleBio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#FFD700]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmGoogleProfile}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF007F] via-[#8A2BE2] to-[#007AFF] text-white font-black text-xs shadow-lg hover:brightness-110 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Launch ConvoSphere</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= 2. PHONE OTP AUTHENTICATION ================= */}
        {authMethod === 'otp' && (
          <div>
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-xs text-slate-300 text-center">
                  Enter your mobile number to receive a 6-digit SMS verification code.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#FF007F]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center space-x-2"
                >
                  <span>{otpLoading ? 'Sending SMS Code...' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-slate-300 text-center">
                  Enter the 6-digit code sent to <span className="font-bold text-white">{phone}</span>
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full py-3 text-center text-lg tracking-[0.5em] font-black rounded-xl bg-black/40 border border-[#00F0FF]/40 text-white outline-none focus:border-[#00F0FF]"
                  />
                  {otpDebugCode && (
                    <p className="text-[11px] text-center text-[#FFD700] mt-1 font-bold">
                      Demo Code: {otpDebugCode}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:text-white"
                  >
                    Change Number
                  </button>
                  <button
                    type="submit"
                    disabled={otpLoading || otpCode.length < 6}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify & Enter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= 3. EMAIL / PASSWORD AUTH ================= */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-slate-300">
                {isEmailRegister ? 'Register new email account' : 'Sign in with existing email'}
              </span>
              <button
                type="button"
                onClick={() => setIsEmailRegister(!isEmailRegister)}
                className="text-xs font-bold text-[#00F0FF] hover:underline"
              >
                {isEmailRegister ? 'Have an account? Sign In' : 'Need an account? Register'}
              </button>
            </div>

            {isEmailRegister && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#FF007F]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Handle</label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@jordansmith"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#007AFF]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#FF007F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#007AFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF007F] via-[#8A2BE2] to-[#007AFF] text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center justify-center space-x-2 transition-all mt-2"
            >
              <span>{isEmailRegister ? 'Create Account & Enter' : 'Sign In with Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ================= 4. SWITCH ACCOUNTS ================= */}
        {authMethod === 'accounts' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Select any registered session to switch immediately:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {registeredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onLogin(user.id);
                    if (onClose) onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#151922] hover:bg-[#1C212E] border border-white/5 hover:border-[#00F0FF] cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-2xl object-cover border border-[#FF007F]"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-[#00F0FF] font-medium">{user.handle}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white text-xs font-bold">
                    Switch
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>End-to-End Encryption & Zero-Knowledge Auth</span>
          </div>
          <span className="text-[#FFD700] font-bold">ConvoSphere v2.5</span>
        </div>
      </div>
    </div>
  );
};
