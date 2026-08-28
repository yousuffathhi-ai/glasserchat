import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Edit3,
  Volume2,
  VolumeX,
  Sparkles,
  Users,
  Maximize2,
  Minimize2,
  Radio,
  Disc,
  CheckCircle2,
  Trash2,
  X,
} from 'lucide-react';
import { CallSession, ThemeMode, UserProfile } from '../types';

interface WebRTCCallModalProps {
  callSession: CallSession;
  currentUser: UserProfile;
  theme: ThemeMode;
  onEndCall: () => void;
  onUpdateCallSession: (updater: (prev: CallSession) => CallSession) => void;
}

export const WebRTCCallModal: React.FC<WebRTCCallModalProps> = ({
  callSession,
  currentUser,
  theme,
  onEndCall,
  onUpdateCallSession,
}) => {
  const isGold = theme === 'gold-light';
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const whiteboardCanvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [isMuted, setIsMuted] = useState(callSession.isMuted);
  const [isVideoOn, setIsVideoOn] = useState(callSession.isVideoEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(callSession.isScreenSharing);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(callSession.isWhiteboardOpen);
  const [isNoiseCancellation, setIsNoiseCancellation] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [drawingColor, setDrawingColor] = useState('#D4AF37');
  const [drawingWidth, setDrawingWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [aiMinutes, setAiMinutes] = useState<{
    summary: string;
    keyDecisions: string[];
    actionItems: string[];
  } | null>(null);
  const [isGeneratingAiMinutes, setIsGeneratingAiMinutes] = useState(false);

  // Local media stream ref
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize camera and mic
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callSession.type === 'video',
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera/Mic access simulated fallback:', err);
      }
    }
    initMedia();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [callSession.type]);

  // Toggle Video
  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
    setIsVideoOn(!isVideoOn);
  };

  // Toggle Mic
  const handleToggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
    setIsMuted(!isMuted);
  };

  // Screen Sharing
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } catch (e) {
        console.warn('Screen share cancelled/failed:', e);
      }
    } else {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsScreenSharing(false);
    }
  };

  // Whiteboard drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = drawingColor;
    ctx.lineWidth = drawingWidth;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Generate AI Call Minutes & Summary
  const handleGenerateAiMinutes = async () => {
    setIsGeneratingAiMinutes(true);
    const durationMins = `${Math.floor(callDuration / 60)}m ${callDuration % 60}s`;
    const participantsList = [currentUser.name, callSession.caller.name];

    try {
      const res = await fetch('/api/ai/call-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callDuration: durationMins,
          participants: participantsList,
          topic: 'GlassChat Pro Architecture & Glassmorphism Design Review',
        }),
      });
      const data = await res.json();
      setAiMinutes(data);
    } catch (e) {
      console.warn('AI minutes generation error:', e);
    } finally {
      setIsGeneratingAiMinutes(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="webrtc-call-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
    >
      <div
        className={`relative w-full max-w-5xl h-[92vh] rounded-[32px] overflow-hidden flex flex-col border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ${
          isGold
            ? 'bg-white/80 border-[#D4AF37]/50 shadow-[0_0_50px_rgba(212,175,55,0.25)]'
            : 'bg-[#0B0D0E]/90 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)]'
        } backdrop-blur-3xl`}
      >
        {/* Top Header Overlay */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 md:p-6 flex items-center justify-between bg-gradient-to-b from-black/70 via-black/30 to-transparent text-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={callSession.caller.avatar}
                alt={callSession.caller.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#D4AF37]"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-black" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight">{callSession.caller.name}</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-slate-950">
                  HD 60FPS
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono flex items-center">
                <Radio className="w-3 h-3 text-emerald-400 mr-1 animate-pulse" />
                {formatTimer(callDuration)}
                {isRecording && (
                  <span className="ml-2 text-rose-400 font-bold flex items-center">
                    <Disc className="w-3 h-3 mr-1 animate-spin" /> REC
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* AI Minutes generator button */}
          <button
            onClick={handleGenerateAiMinutes}
            disabled={isGeneratingAiMinutes}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{isGeneratingAiMinutes ? 'Summarizing...' : 'Live AI Minutes'}</span>
          </button>
        </div>

        {/* Center Stage: Video Grid / Screen Share / Whiteboard */}
        <div className="flex-1 relative flex items-center justify-center p-4 pt-20 pb-28 overflow-hidden bg-slate-950">
          {/* 1. Whiteboard Canvas view */}
          {isWhiteboardOpen ? (
            <div className="relative w-full h-full bg-white/95 rounded-2xl overflow-hidden flex flex-col shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b text-slate-800 text-xs">
                <span className="font-bold flex items-center">
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" /> Collaborative Studio Whiteboard
                </span>
                <div className="flex items-center space-x-2">
                  {['#D4AF37', '#10B981', '#EF4444', '#3B82F6', '#000000'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setDrawingColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-5 h-5 rounded-full ring-2 ${
                        drawingColor === color ? 'ring-slate-900 scale-110' : 'ring-transparent'
                      }`}
                    />
                  ))}
                  <button
                    onClick={clearWhiteboard}
                    className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                    title="Clear Canvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <canvas
                ref={whiteboardCanvasRef}
                width={900}
                height={550}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full cursor-crosshair bg-white"
              />
            </div>
          ) : isScreenSharing ? (
            /* 2. Screen Share Stage */
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md">
                Screen Sharing Active (60fps HD)
              </span>
            </div>
          ) : (
            /* 3. Standard 1-on-1 / Group Video Stage */
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Remote Caller Video */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center border border-white/10 shadow-2xl">
                <img
                  src={callSession.caller.avatar}
                  alt={callSession.caller.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white">
                  <span className="text-xs font-bold">{callSession.caller.name}</span>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* Local Video Preview */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center border border-white/10 shadow-2xl">
                {isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#D4AF37]/60 shadow-xl"
                    />
                    <span className="text-sm font-bold text-slate-300">{currentUser.name} (You)</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white">
                  <span className="text-xs font-bold">You</span>
                  {isMuted && <MicOff className="w-3.5 h-3.5 text-rose-500" />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Minutes Summary Popover if available */}
        {aiMinutes && (
          <div className="absolute inset-x-4 md:inset-x-12 top-24 max-h-[65%] overflow-y-auto z-40 p-5 rounded-3xl bg-slate-950/95 border border-[#D4AF37]/50 text-white shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#FFD700] flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5" /> AI Minutes of Meeting & Action Items
              </h3>
              <button onClick={() => setAiMinutes(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">{aiMinutes.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-emerald-400 block mb-1">Key Decisions</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {aiMinutes.keyDecisions?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-[#FFD700] block mb-1">Next Action Items</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {aiMinutes.actionItems?.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Glass Controls Bar */}
        <div className="absolute bottom-6 inset-x-0 z-30 flex items-center justify-center space-x-3 px-4">
          <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-full bg-slate-900/85 border border-[#D4AF37]/40 shadow-2xl backdrop-blur-2xl">
            {/* Mic Button */}
            <button
              onClick={handleToggleMic}
              className={`p-3.5 rounded-full transition-transform hover:scale-110 ${
                isMuted
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Button */}
            <button
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-full transition-transform hover:scale-110 ${
                !isVideoOn
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen Share Button */}
            <button
              onClick={handleToggleScreenShare}
              className={`p-3.5 rounded-full transition-transform hover:scale-110 ${
                isScreenSharing
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Screen Share Studio"
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* Whiteboard Button */}
            <button
              onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
              className={`p-3.5 rounded-full transition-transform hover:scale-110 ${
                isWhiteboardOpen
                  ? 'bg-[#D4AF37] text-slate-950 font-bold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Interactive Collaborative Whiteboard"
            >
              <Edit3 className="w-5 h-5" />
            </button>

            {/* Noise Cancellation toggle */}
            <button
              onClick={() => setIsNoiseCancellation(!isNoiseCancellation)}
              className={`p-3.5 rounded-full transition-transform hover:scale-110 ${
                isNoiseCancellation
                  ? 'bg-emerald-600/60 text-emerald-300'
                  : 'bg-white/15 text-white'
              }`}
              title="Noise Cancellation Filter"
            >
              {isNoiseCancellation ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Live Call Record toggle */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-3.5 rounded-full transition-transform hover:scale-110 ${
                isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/15 text-white'
              }`}
              title="Record Call"
            >
              <Disc className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              id="webrtc-end-call-btn"
              onClick={onEndCall}
              className="p-3.5 rounded-full bg-rose-600 text-white font-bold transition-transform hover:scale-110 shadow-lg hover:bg-rose-700 ml-2"
              title="End Call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
