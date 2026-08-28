import React from 'react';
import { X, Download, Share2, Sparkles, ZoomIn, Maximize2 } from 'lucide-react';

interface MediaLightboxModalProps {
  mediaUrl: string;
  caption?: string;
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  mediaUrl,
  caption,
  onClose,
}) => {
  return (
    <div
      id="media-lightbox-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-200 select-none"
    >
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
        {/* Top Control Bar */}
        <div className="absolute -top-12 inset-x-0 flex items-center justify-between text-white px-2">
          <span className="text-xs font-semibold text-slate-300">Media Preview</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = mediaUrl;
                link.download = 'glasschat_media.jpg';
                link.click();
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Frame */}
        <img
          src={mediaUrl}
          alt="Expanded Media"
          referrerPolicy="no-referrer"
          className="max-h-[80vh] w-auto object-contain rounded-3xl border border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.25)]"
        />

        {caption && (
          <div className="mt-3 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs font-medium text-center max-w-lg">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
