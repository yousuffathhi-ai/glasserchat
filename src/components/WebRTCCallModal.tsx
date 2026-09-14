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
  Wifi,
  SwitchCamera,
} from 'lucide-react';
import { CallSession, ThemeMode, UserProfile } from '../types';
import { webrtcPeer } from '../utils/webrtcPeer';

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
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
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
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [drawingColor, setDrawingColor] = useState('#D4AF37');
  const [drawingWidth, setDrawingWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [aiMinutes, setAiMinutes] = useState<{
    summary: string;
    keyDecisions: string[];
    actionItems: string[];
  } | null>(null);
  const [isGeneratingAiMinutes, setIsGeneratingAiMinutes] = useState(false);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize WebRTC PeerJS Calling Engine
  useEffect(() => {
    let isCancelled = false;

    async function setupPeerCall() {
      try {
        await webrtcPeer.init(currentUser.id);
        if (isCancelled) return;

        const localStream = await webrtcPeer.getLocalStream(callSession.type);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Listen for remote WebRTC stream
        webrtcPeer.onRemoteStream((remoteStream) => {
          if (isCancelled) return;
          setHasRemoteStream(true);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        webrtcPeer.onCallClosed(() => {
          if (!isCancelled) {
            onEndCall();
          }
        });

        // Determine remote partner ID
        const targetUserId = callSession.caller.id;
        if (targetUserId && targetUserId !== currentUser.id) {
          // Caller initiates PeerJS call to remote peer
          webrtcPeer.callUser(targetUserId, localStream);
        } else {
          // Receiver answers call
          webrtcPeer.answerCall(localStream);
        }
      } catch (err) {
        console.warn('WebRTC PeerJS initialization fallback:', err);
      }
    }

    setupPeerCall();

    return () => {
      isCancelled = true;
      webrtcPeer.endCall();
    };
  }, [currentUser.id, callSession.caller.id, callSession.type]);

  // Toggle Video Track
  const handleToggleVideo = () => {
    const enabled = webrtcPeer.toggleVideo();
    setIsVideoOn(enabled);
  };

  // Toggle Mic Track
  const handleToggleMic = () => {
    const enabled = webrtcPeer.toggleMic();
    setIsMuted(!enabled);
  };

  // Camera Switch (Front/Back)
  const handleSwitchCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextMode },
          audio: !isMuted,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Switch camera error or fallback:', err);
    }
  };

  // Screen Sharing via PeerJS
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      const screenStream = await webrtcPeer.startScreenShare();
      if (screenStream) {
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          webrtcPeer.stopScreenShare();
        };
      }
    } else {
      webrtcPeer.stopScreenShare();
      setIsScreenSharing(false);
    }
  };

  const handleEndCall = () => {
    webrtcPeer.endCall();
    onEndCall();
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
          topic: 'ConvoSphere Pro Architecture & Glassmorphism Design Review',
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
            /* 3. IMO-STYLE FULLSCREEN CALL SCREEN: Remote full background with top-right PIP */
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {/* Fullscreen Remote Video Stream */}
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${hasRemoteStream ? 'block' : 'hidden'}`}
                />
                {!hasRemoteStream && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={callSession.caller.avatar}
                      alt={callSession.caller.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-50 blur-md scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60" />
                    <div className="absolute flex flex-col items-center text-center p-6">
                      <div className="relative mb-4">
                        <img
                          src={callSession.caller.avatar}
                          alt={callSession.caller.name}
                          referrerPolicy="no-referrer"
                          className="w-28 h-28 rounded-full object-cover ring-4 ring-[#D4AF37] shadow-2xl"
                        />
                        <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-black flex items-center justify-center">
                          <Wifi className="w-3.5 h-3.5 text-white" />
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{callSession.caller.name}</h3>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-full backdrop-blur-md flex items-center">
                        <Radio className="w-3 h-3 mr-1.5 animate-pulse" /> IMO HD Encrypted Call Connected
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Self-View PIP Window at Top-Right (IMO Style) */}
              <div
                className="absolute top-4 right-4 w-28 h-38 sm:w-36 sm:h-48 md:w-44 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/40 z-30 bg-slate-900 cursor-pointer hover:scale-105 transition-transform"
                title="Your Camera (PIP Self-View)"
              >
                {isVideoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-900 text-center">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D4AF37] mb-1"
                    />
                    <span className="text-[10px] font-bold text-slate-300">You (Off)</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-white flex items-center space-x-1">
                  <span>You</span>
                  {isMuted && <MicOff className="w-2.5 h-2.5 text-rose-400" />}
                </div>
              </div>

              {/* Remote User Name Pill at bottom left */}
              <div className="absolute bottom-24 left-6 z-20 flex items-center space-x-2 text-white bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                <span className="text-xs font-bold">{callSession.caller.name}</span>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
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

        {/* IMO-Style Bottom Overlay Controls: Mute Mic, Camera Switch, Camera Off, and Red End Call Button */}
        <div className="absolute bottom-6 inset-x-0 z-30 flex items-center justify-center space-x-3 px-4">
          <div className="flex items-center space-x-3 p-3 rounded-full bg-slate-950/85 border border-white/20 shadow-2xl backdrop-blur-2xl">
            {/* 1. Mute Mic Button */}
            <button
              id="call-toggle-mic-btn"
              onClick={handleToggleMic}
              className={`p-3.5 rounded-full transition-all hover:scale-110 active:scale-95 ${
                isMuted
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* 2. Camera Switch Button (IMO style flip camera) */}
            <button
              id="call-switch-camera-btn"
              onClick={handleSwitchCamera}
              className="p-3.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-all hover:scale-110 active:scale-95"
              title="Switch Camera (Front/Back)"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            {/* 3. Camera Off / Video Toggle Button */}
            <button
              id="call-toggle-video-btn"
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-full transition-all hover:scale-110 active:scale-95 ${
                !isVideoOn
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen Share Button */}
            <button
              onClick={handleToggleScreenShare}
              className={`p-3.5 rounded-full transition-all hover:scale-110 hidden sm:flex ${
                isScreenSharing
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Share Screen"
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* Whiteboard Button */}
            <button
              onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
              className={`p-3.5 rounded-full transition-all hover:scale-110 hidden sm:flex ${
                isWhiteboardOpen
                  ? 'bg-[#D4AF37] text-slate-950 font-bold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              title="Collaborative Whiteboard"
            >
              <Edit3 className="w-5 h-5" />
            </button>

            {/* 4. Red End Call Button */}
            <button
              id="webrtc-end-call-btn"
              onClick={handleEndCall}
              className="p-4 rounded-full bg-rose-600 text-white font-bold transition-all hover:scale-110 shadow-xl shadow-rose-600/40 hover:bg-rose-700 active:scale-95 ml-1"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
