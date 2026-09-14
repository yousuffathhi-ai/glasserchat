import React, { useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Clipboard,
  Smile,
  Camera,
  Music,
  Contact as ContactIcon,
  BarChart2,
  Calendar,
  MapPin,
  X,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface AttachmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (
    action:
      | 'document'
      | 'media'
      | 'paste-image'
      | 'sticker-maker'
      | 'camera'
      | 'audio'
      | 'contact'
      | 'poll'
      | 'event'
      | 'location'
  ) => void;
  theme?: ThemeMode;
}

export const AttachmentSheet: React.FC<AttachmentSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  theme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const items = [
    {
      id: 'document' as const,
      label: 'Document & Files',
      desc: 'PDF, docs, code, archives',
      icon: FileText,
      gradient: 'from-[#007AFF] to-[#00F0FF]',
      iconColor: 'text-[#00F0FF]',
      ringColor: 'ring-[#007AFF]/40',
    },
    {
      id: 'media' as const,
      label: 'Photos & Videos',
      desc: 'Gallery & high-res media',
      icon: ImageIcon,
      gradient: 'from-[#FF007F] to-[#8A2BE2]',
      iconColor: 'text-[#FF007F]',
      ringColor: 'ring-[#FF007F]/40',
    },
    {
      id: 'paste-image' as const,
      label: 'Paste Image',
      desc: 'From clipboard or image URL',
      icon: Clipboard,
      gradient: 'from-[#8A2BE2] to-[#007AFF]',
      iconColor: 'text-[#8A2BE2]',
      ringColor: 'ring-[#8A2BE2]/40',
    },
    {
      id: 'sticker-maker' as const,
      label: 'Sticker Maker',
      desc: 'Custom cutouts & badges',
      icon: Smile,
      gradient: 'from-[#FFD700] to-[#FF007F]',
      iconColor: 'text-[#FFD700]',
      ringColor: 'ring-[#FFD700]/40',
    },
    {
      id: 'camera' as const,
      label: 'Camera Access',
      desc: 'Instant live snapshot',
      icon: Camera,
      gradient: 'from-[#00F0FF] to-[#007AFF]',
      iconColor: 'text-[#00F0FF]',
      ringColor: 'ring-[#00F0FF]/40',
    },
    {
      id: 'audio' as const,
      label: 'Audio Files & Notes',
      desc: 'Voice notes, tracks, music',
      icon: Music,
      gradient: 'from-[#FF007F] to-[#FFD700]',
      iconColor: 'text-[#FF007F]',
      ringColor: 'ring-[#FF007F]/40',
    },
    {
      id: 'contact' as const,
      label: 'Contact Card',
      desc: 'Share contact details',
      icon: ContactIcon,
      gradient: 'from-[#007AFF] to-[#8A2BE2]',
      iconColor: 'text-[#007AFF]',
      ringColor: 'ring-[#007AFF]/40',
    },
    {
      id: 'poll' as const,
      label: 'Poll Creation',
      desc: 'Interactive voting card',
      icon: BarChart2,
      gradient: 'from-[#FFD700] to-[#00F0FF]',
      iconColor: 'text-[#FFD700]',
      ringColor: 'ring-[#FFD700]/40',
    },
    {
      id: 'event' as const,
      label: 'Event Scheduling',
      desc: 'Meetups with RSVP RSVP',
      icon: Calendar,
      gradient: 'from-[#FF007F] to-[#00F0FF]',
      iconColor: 'text-[#FF007F]',
      ringColor: 'ring-[#FF007F]/40',
    },
    {
      id: 'location' as const,
      label: 'Location Sharing',
      desc: 'GPS pin & live coordinates',
      icon: MapPin,
      gradient: 'from-[#00F0FF] to-[#8A2BE2]',
      iconColor: 'text-[#00F0FF]',
      ringColor: 'ring-[#00F0FF]/40',
    },
  ];

  return (
    <div
      id="attachment-sheet-backdrop"
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="attachment-sheet-panel"
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[rgba(15,20,32,0.92)] border border-[#00F0FF]/30 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(0,240,255,0.15)] text-white backdrop-blur-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF007F] animate-pulse" />
            <h3 className="text-sm font-black font-display uppercase tracking-wider text-white">
              Share & Create Attachment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 10-Item Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectAction(item.id);
                onClose();
              }}
              className="flex items-center space-x-3 p-3 rounded-2xl bg-[#151922]/80 hover:bg-[#1C212E] border border-white/5 hover:border-[#00F0FF]/30 transition-all text-left group hover:scale-[1.02]"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} p-0.5 flex-shrink-0 shadow-md group-hover:ring-2 ${item.ringColor} transition-all`}
              >
                <div className="w-full h-full rounded-[10px] bg-[#0E1117] flex items-center justify-center">
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-100 truncate group-hover:text-[#00F0FF] transition-colors">
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span>End-to-End Encrypted Transfers</span>
          <span className="text-[#FFD700] font-bold">ConvoSphere Media</span>
        </div>
      </div>
    </div>
  );
};
