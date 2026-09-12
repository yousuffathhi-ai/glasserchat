import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  FileText,
  ExternalLink,
  Play,
  Volume2,
  FileSpreadsheet,
  FileCheck,
} from 'lucide-react';

interface MediaLightboxModalProps {
  mediaUrl: string;
  mediaType?: 'image' | 'video' | 'document' | string;
  fileName?: string;
  fileSize?: string;
  caption?: string;
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  mediaUrl,
  mediaType,
  fileName,
  fileSize,
  caption,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Auto-detect type if not provided
  const detectedType = (() => {
    if (mediaType) return mediaType;
    const lower = (mediaUrl || '').toLowerCase();
    if (lower.startsWith('data:video') || lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) {
      return 'video';
    }
    if (lower.startsWith('data:application') || lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.xlsx') || lower.endsWith('.txt')) {
      return 'document';
    }
    return 'image';
  })();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = fileName || `glasschat_attachment_${Date.now()}`;
    link.click();
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, z - 0.25));

  return (
    <div
      id="media-lightbox-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between text-white px-3 py-2 mb-2 bg-slate-900/60 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-xs font-semibold text-slate-200 truncate">
              {fileName || (detectedType === 'video' ? 'Video Player' : detectedType === 'document' ? 'Document Attachment' : 'Media Preview')}
            </span>
            {fileSize && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-mono">
                {fileSize}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {detectedType === 'image' && (
              <>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-xl bg-[#D4AF37] text-slate-950 hover:brightness-110 font-bold"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Container */}
        <div className="flex-1 flex items-center justify-center w-full max-h-[75vh] overflow-hidden rounded-3xl">
          {/* 1. VIDEO VIEWER */}
          {detectedType === 'video' && (
            <div className="relative w-full max-h-[75vh] flex items-center justify-center bg-black/80 rounded-3xl border border-[#D4AF37]/30 shadow-2xl p-2">
              <video
                src={mediaUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-[0_0_50px_rgba(212,175,55,0.2)]"
              />
            </div>
          )}

          {/* 2. DOCUMENT VIEWER */}
          {detectedType === 'document' && (
            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-[#14181E] border border-[#D4AF37]/30 shadow-2xl max-w-md w-full text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white truncate max-w-xs">
                  {fileName || 'Document Attachment'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {fileSize || 'Encrypted document archive'} • 256-bit AES
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full pt-2">
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 border border-white/10"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Tab</span>
                </a>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. IMAGE VIEWER */}
          {detectedType === 'image' && (
            <div className="relative overflow-auto max-h-[75vh] w-full flex items-center justify-center">
              <img
                src={mediaUrl}
                alt={caption || 'Expanded Media'}
                referrerPolicy="no-referrer"
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                className="max-h-[72vh] w-auto object-contain rounded-3xl border border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.25)]"
              />
            </div>
          )}
        </div>

        {/* Caption */}
        {caption && (
          <div className="mt-3 px-4 py-2 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md text-white text-xs font-medium text-center max-w-lg">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
