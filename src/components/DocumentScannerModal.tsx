import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  Sparkles,
  Crop,
  Check,
  RotateCw,
  FileText,
  Sliders,
  Share2,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface DocumentScannerModalProps {
  theme: ThemeMode;
  onClose: () => void;
  onShareDocument: (docData: { name: string; size: string; textPreview: string; imageUrl: string }) => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  theme,
  onClose,
  onShareDocument,
}) => {
  const isGold = theme === 'gold-light';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'magic' | 'bw' | 'grayscale' | 'original'>('magic');
  const [extractedOcrText, setExtractedOcrText] = useState<string>('');
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.warn('Document camera fallback:', err);
      }
    }
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    // Simulated capture or canvas capture
    const sampleDoc =
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80';
    setCapturedImage(sampleDoc);
    setExtractedOcrText(
      'CONFIDENTIAL AGREEMENT\nProject: GlassChat Pro Suite\nClient: PGV Creation\nSecurity: 256-bit AES End-to-End Encryption\nStatus: Verified and Approved'
    );
  };

  const handleShare = () => {
    onShareDocument({
      name: 'Scanned_Contract_PGV.pdf',
      size: '2.4 MB',
      textPreview: extractedOcrText,
      imageUrl: capturedImage || '',
    });
    onClose();
  };

  return (
    <div
      id="document-scanner-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
    >
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 border shadow-2xl ${
          isGold
            ? 'bg-white border-[#D4AF37]/50 text-slate-900'
            : 'bg-[#121619] border-emerald-500/40 text-slate-100'
        } backdrop-blur-3xl`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-lg font-bold">Built-in Physical Document Scanner</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!capturedImage ? (
          /* Live Camera Viewfinder with Document Boundary Overlay */
          <div className="relative h-80 rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-dashed border-[#D4AF37]/60">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

            {/* Document alignment frame */}
            <div className="absolute inset-8 border-2 border-[#D4AF37] rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <span className="text-[11px] font-bold text-[#FFD700] bg-black/60 px-2 py-0.5 rounded w-max">
                Align document inside frame
              </span>
              <span className="text-[11px] font-mono text-white/80 self-end bg-black/60 px-2 py-0.5 rounded">
                Auto Edge Detection: Active
              </span>
            </div>

            {/* Shutter Button */}
            <button
              onClick={handleCapture}
              className="absolute bottom-4 p-4 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] text-slate-950 shadow-2xl hover:scale-110 active:scale-95 transition-transform"
            >
              <Camera className="w-6 h-6 font-bold" />
            </button>
          </div>
        ) : (
          /* Scanned Result with Filters & OCR Text Extraction */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtered Document Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-black h-56 border border-[#D4AF37]/40 flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Scanned Document"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover ${
                    filterMode === 'bw'
                      ? 'contrast-200 grayscale'
                      : filterMode === 'grayscale'
                      ? 'grayscale'
                      : filterMode === 'magic'
                      ? 'contrast-125 saturate-150'
                      : ''
                  }`}
                />
              </div>

              {/* OCR Extracted Text */}
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 text-xs font-bold text-[#AA820A] dark:text-emerald-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Instant OCR Text Recognition</span>
                  </div>
                  <pre className="text-[11px] text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {extractedOcrText}
                  </pre>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-black/10">
                  <span>Pages: 1 (PDF Ready)</span>
                  <span>Size: 2.4 MB</span>
                </div>
              </div>
            </div>

            {/* Filter Swatches */}
            <div className="flex items-center space-x-2">
              {[
                { id: 'magic', label: 'Magic Color ✨' },
                { id: 'bw', label: 'B&W Document' },
                { id: 'grayscale', label: 'Grayscale' },
                { id: 'original', label: 'Original' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterMode(filter.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    filterMode === filter.id
                      ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Actions: Retake vs Share */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-black/5"
              >
                Retake Scan
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-slate-950 font-bold text-xs shadow-md hover:brightness-110"
              >
                Share PDF Document in Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
