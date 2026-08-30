import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, Mic, Volume2 } from 'lucide-react';
import { SignalingCallPayload } from '../utils/signaling';

interface IncomingCallOverlayProps {
  incomingCall: SignalingCallPayload | null;
  onAcceptCall: (callData: SignalingCallPayload) => void;
  onRejectCall: (callData: SignalingCallPayload) => void;
}

export const IncomingCallOverlay: React.FC<IncomingCallOverlayProps> = ({
  incomingCall,
  onAcceptCall,
  onRejectCall,
}) => {
  const [ringtonePlaying, setRingtonePlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthAudioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Play synthesized pleasant ringtone if external audio is blocked or fails
  const playSynthesizedRing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      synthAudioCtxRef.current = ctx;

      const playChime = () => {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;
        // Dual frequency chord (E5 & B5)
        [659.25, 987.77].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.2);
        });
      };

      playChime();
      synthIntervalRef.current = setInterval(playChime, 2500);
    } catch (e) {
      console.warn('Synthesizer ringtone note:', e);
    }
  };

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthAudioCtxRef.current) {
      try {
        synthAudioCtxRef.current.close();
      } catch (e) {}
      synthAudioCtxRef.current = null;
    }
  };

  // Play Ringtone on mount/trigger
  useEffect(() => {
    if (incomingCall) {
      setRingtonePlaying(true);
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((err) => {
            console.log('Audio autoplay blocked, falling back to Web Audio Synth chime:', err);
            playSynthesizedRing();
          });
      } else {
        playSynthesizedRing();
      }

      // Try browser vibration if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([400, 200, 400, 200, 600]);
        } catch (e) {}
      }
    } else {
      stopAllAudio();
    }

    return () => {
      stopAllAudio();
    };
  }, [incomingCall]);

  if (!incomingCall || incomingCall.status !== 'ringing') return null;

  const handleAccept = () => {
    setRingtonePlaying(false);
    stopAllAudio();
    onAcceptCall(incomingCall);
  };

  const handleReject = () => {
    setRingtonePlaying(false);
    stopAllAudio();
    onRejectCall(incomingCall);
  };

  return (
    <div
      id="glasschat-incoming-call-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl animate-fade-in font-sans select-none p-4"
    >
      {/* Background Audio Ringtone */}
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/1360/1360-preview.mp3"
        loop
        preload="auto"
      />

      {/* Main Glassmorphic Call Card */}
      <div className="relative w-full max-w-sm p-8 bg-[#0F1316]/90 border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col items-center text-center backdrop-blur-3xl overflow-hidden ring-1 ring-cyan-500/30">
        
        {/* Top Glowing Ambient Accents */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Pulse Waves around Avatar */}
        <div className="relative mb-6 flex items-center justify-center mt-2">
          <div className="absolute w-36 h-36 rounded-full bg-cyan-500/20 animate-ping" />
          <div className="absolute w-28 h-28 rounded-full bg-emerald-500/25 animate-pulse" />
          <img
            src={
              incomingCall.callerAvatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
            }
            alt={incomingCall.callerName}
            referrerPolicy="no-referrer"
            className="relative w-24 h-24 rounded-3xl object-cover border-2 border-cyan-400 shadow-2xl z-10"
          />
        </div>

        {/* Caller Information */}
        <h2 className="text-2xl font-black text-white tracking-wide mb-1">
          {incomingCall.callerName || 'Unknown Caller'}
        </h2>
        
        <p className="text-xs text-cyan-400 font-semibold mb-2">
          {incomingCall.callerPhone || incomingCall.callerHandle || '+1 (555) 019-2834'}
        </p>

        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900/90 rounded-full border border-white/10 text-xs text-gray-200 mb-8 shadow-inner">
          {incomingCall.callType === 'video' ? (
            <>
              <Video className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="font-semibold text-cyan-300">GlassChat HD Video Call...</span>
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-300">GlassChat Crystal Voice Call...</span>
            </>
          )}
        </div>

        {/* Call Controls (Accept / Decline Buttons) */}
        <div className="flex items-center justify-between w-full px-6">
          {/* Decline / Reject Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              id="incoming-call-decline-btn"
              onClick={handleReject}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition-all transform hover:scale-105"
              title="Decline Call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <span className="text-xs text-gray-400 font-bold">Decline</span>
          </div>

          {/* Accept Call Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              id="incoming-call-accept-btn"
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-400/50 active:scale-95 transition-all transform hover:scale-105 animate-bounce"
              title="Accept Call"
            >
              {incomingCall.callType === 'video' ? (
                <Video className="w-7 h-7" />
              ) : (
                <Phone className="w-7 h-7" />
              )}
            </button>
            <span className="text-xs text-emerald-400 font-bold">Accept</span>
          </div>
        </div>

        {/* PGV Creation Security Indicator */}
        <div className="mt-7 text-[10px] text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>256-bit AES WebRTC Protected Call</span>
        </div>
      </div>
    </div>
  );
};
export default IncomingCallOverlay;
