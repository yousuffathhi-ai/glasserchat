import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMsg('Camera unavailable in preview frame or permission denied. Tap "Use Photo Sample" below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleSnap = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleUsePreset = () => {
    const sample = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';
    setCapturedImage(sample);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#0E1118] border border-[#00F0FF]/30 shadow-2xl p-6 text-slate-100 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black font-display text-white">Live Camera Capture</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder or Preview */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10 mb-4 flex items-center justify-center">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Viewfinder crosshairs */}
          {!capturedImage && (
            <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 border-t-2 border-l-2 border-[#00F0FF] absolute top-2 left-2" />
              <div className="w-6 h-6 border-t-2 border-r-2 border-[#00F0FF] absolute top-2 right-2" />
              <div className="w-6 h-6 border-b-2 border-l-2 border-[#00F0FF] absolute bottom-2 left-2" />
              <div className="w-6 h-6 border-b-2 border-r-2 border-[#00F0FF] absolute bottom-2 right-2" />
            </div>
          )}

          {errorMsg && !capturedImage && (
            <div className="absolute inset-0 bg-black/80 p-4 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-rose-300 mb-3">{errorMsg}</p>
              <button
                type="button"
                onClick={handleUsePreset}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#007AFF] text-white text-xs font-bold"
              >
                Use Photo Sample
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setCapturedImage(null);
                  startCamera();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#007AFF] text-white text-xs font-bold shadow-lg flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Send Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title="Flip Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSnap}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF007F] via-[#00F0FF] to-[#007AFF] p-1 shadow-lg hover:scale-105 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-[#00F0FF]" />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleUsePreset}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title="Sample Photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
