import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Send,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { VoiceRecorderHelper } from '../utils/audio';

interface VoiceNoteRecorderProps {
  isGold: boolean;
  onSendVoiceNote: (voiceData: {
    audioUrl: string;
    duration: number;
    waveform: number[];
  }) => void;
  onCancel: () => void;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  isGold,
  onSendVoiceNote,
  onCancel,
}) => {
  const [recorderState, setRecorderState] = useState<'recording' | 'preview'>('recording');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveVolume, setLiveVolume] = useState(25);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);

  const recorderRef = useRef<VoiceRecorderHelper | null>(null);
  const timerRef = useRef<any>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic waveform bars collected during recording
  const [waveformBars, setWaveformBars] = useState<number[]>([40, 60, 30, 80, 50, 90, 70, 45, 65, 85, 30, 95]);

  // Start recording on mount
  useEffect(() => {
    let mounted = true;
    const start = async () => {
      const helper = new VoiceRecorderHelper();
      recorderRef.current = helper;
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      await helper.startRecording((vol) => {
        if (!mounted) return;
        setLiveVolume(vol);
        setWaveformBars((prev) => {
          const next = [...prev.slice(1), Math.max(20, Math.min(100, vol))];
          return next;
        });
      });
    };

    start();

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recorderRef.current) {
        recorderRef.current.stopRecording();
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Stop recording and enter Instant Playback Preview mode
  const handlePauseToPreview = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recorderRef.current) {
      const finalDuration = Math.max(1, recordingSeconds);
      const res = await recorderRef.current.stopRecording();
      setRecordedAudioUrl(res.base64);
      setRecordedDuration(finalDuration);
      setRecorderState('preview');
    }
  };

  // Discard and restart recording
  const handleRestart = async () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setIsPlayingPreview(false);
    setPreviewCurrentTime(0);
    setRecordedAudioUrl(null);
    setRecorderState('recording');
    setRecordingSeconds(0);

    const helper = new VoiceRecorderHelper();
    recorderRef.current = helper;
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    await helper.startRecording((vol) => {
      setLiveVolume(vol);
      setWaveformBars((prev) => [...prev.slice(1), Math.max(20, Math.min(100, vol))]);
    });
  };

  // Toggle play/pause for preview
  const handleTogglePlayPreview = () => {
    if (!audioPreviewRef.current && recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audioPreviewRef.current = audio;

      audio.ontimeupdate = () => {
        setPreviewCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlayingPreview(false);
        setPreviewCurrentTime(0);
      };
    }

    if (audioPreviewRef.current) {
      if (isPlayingPreview) {
        audioPreviewRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioPreviewRef.current.play().catch(() => {});
        setIsPlayingPreview(true);
      }
    }
  };

  // Send voice note directly
  const handleSend = async () => {
    if (recorderState === 'recording') {
      if (timerRef.current) clearInterval(timerRef.current);
      const duration = Math.max(1, recordingSeconds);
      if (recorderRef.current) {
        const res = await recorderRef.current.stopRecording();
        onSendVoiceNote({
          audioUrl: res.base64,
          duration,
          waveform: waveformBars,
        });
      }
    } else if (recordedAudioUrl) {
      onSendVoiceNote({
        audioUrl: recordedAudioUrl,
        duration: recordedDuration,
        waveform: waveformBars,
      });
    }
  };

  return (
    <div className="flex items-center space-x-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-150 py-1 select-none">
      {/* 1. RECORDING STATE */}
      {recorderState === 'recording' ? (
        <>
          {/* Delete / Cancel draft button */}
          <button
            onClick={onCancel}
            className="p-2.5 rounded-full text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex-shrink-0"
            title="Cancel & Delete voice note"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Recording Timer with pulsating red dot */}
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-full flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-rose-400">
              {formatTime(recordingSeconds)}
            </span>
          </div>

          {/* Live Audio Waveform visualizer bars */}
          <div className="flex-1 flex items-center justify-center space-x-1 h-8 px-2 overflow-hidden">
            {waveformBars.map((height, i) => (
              <div
                key={i}
                style={{ height: `${Math.max(15, height * 0.35)}px` }}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isGold ? 'bg-[#D4AF37]' : 'bg-emerald-400'
                }`}
              />
            ))}
          </div>

          {/* Stop / Pause button to enter Preview mode */}
          <button
            onClick={handlePauseToPreview}
            className="p-2.5 rounded-full bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 transition-transform active:scale-95 shadow-md flex-shrink-0 border border-amber-500/30"
            title="Pause & Preview voice note"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          {/* Direct Send button */}
          <button
            onClick={handleSend}
            className={`p-2.5 rounded-full font-bold shadow-lg transition-transform active:scale-95 flex-shrink-0 ${
              isGold
                ? 'bg-[#D4AF37] text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
            title="Send Voice Note"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </>
      ) : (
        /* 2. INSTANT PLAYBACK PREVIEW STATE */
        <>
          {/* Discard button */}
          <button
            onClick={onCancel}
            className="p-2.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
            title="Discard voice note"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Re-record button */}
          <button
            onClick={handleRestart}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            title="Re-record"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play / Pause button for Instant Playback */}
          <button
            onClick={handleTogglePlayPreview}
            className={`p-2.5 rounded-full flex-shrink-0 transition-transform active:scale-95 ${
              isGold
                ? 'bg-[#D4AF37] text-slate-950'
                : 'bg-emerald-500 text-slate-950'
            }`}
            title={isPlayingPreview ? 'Pause preview' : 'Play preview'}
          >
            {isPlayingPreview ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Scrubber and Waveform Preview */}
          <div className="flex-1 flex flex-col justify-center px-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>{formatTime(previewCurrentTime)}</span>
              <span className="flex items-center text-[#D4AF37] font-semibold">
                <Volume2 className="w-3 h-3 mr-1" /> Voice Preview
              </span>
              <span>{formatTime(recordedDuration)}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${(previewCurrentTime / Math.max(1, recordedDuration)) * 100}%`,
                }}
                className={`h-full transition-all duration-100 ${
                  isGold ? 'bg-[#D4AF37]' : 'bg-emerald-400'
                }`}
              />
            </div>
          </div>

          {/* Send Previewed Voice Note Button */}
          <button
            onClick={handleSend}
            className={`p-2.5 rounded-full font-bold shadow-lg transition-transform active:scale-95 flex-shrink-0 ${
              isGold
                ? 'bg-[#D4AF37] text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
            title="Send Voice Note"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </>
      )}
    </div>
  );
};
