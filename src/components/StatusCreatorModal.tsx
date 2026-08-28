import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Type, Shield, Lock } from 'lucide-react';
import { Story, ThemeMode, UserProfile } from '../types';

interface StatusCreatorModalProps {
  currentUser: UserProfile;
  theme: ThemeMode;
  onClose: () => void;
  onPublishStory: (story: Partial<Story>) => void;
}

export const StatusCreatorModal: React.FC<StatusCreatorModalProps> = ({
  currentUser,
  theme,
  onClose,
  onPublishStory,
}) => {
  const isGold = theme === 'gold-light';
  const [storyType, setStoryType] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedBg, setSelectedBg] = useState(
    'linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #1A1A1E 100%)'
  );
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80'
  );
  const [privacy, setPrivacy] = useState<'all' | 'except' | 'only'>('all');

  const bgOptions = [
    {
      name: 'Liquid Gold Silk',
      value: 'linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #1A1A1E 100%)',
    },
    {
      name: 'Emerald Obsidian',
      value: 'linear-gradient(135deg, #0B0D0E 0%, #064e3b 50%, #047857 100%)',
    },
    {
      name: 'Cosmic Amethyst',
      value: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)',
    },
    {
      name: 'Sunset Bronze',
      value: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #fb923c 100%)',
    },
  ];

  const photoPresets = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
  ];

  const handlePublish = () => {
    if (storyType === 'text' && !textContent.trim()) return;

    onPublishStory({
      type: storyType,
      textContent: storyType === 'text' ? textContent : undefined,
      contentUrl: storyType === 'image' ? selectedPhotoUrl : undefined,
      backgroundColor: storyType === 'text' ? selectedBg : undefined,
      caption: caption.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="status-creator-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
    >
      <div
        className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
          isGold
            ? 'bg-white/95 border-[#D4AF37]/50 text-slate-900'
            : 'bg-[#121619]/95 border-emerald-500/40 text-slate-100'
        } backdrop-blur-3xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-lg font-bold">Add 24h GlassChat Status</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Type Toggle: Text vs Photo */}
        <div className="flex items-center space-x-2 mb-4 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <button
            onClick={() => setStoryType('text')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
              storyType === 'text'
                ? 'bg-[#D4AF37] text-slate-950 shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text Status</span>
          </button>
          <button
            onClick={() => setStoryType('image')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
              storyType === 'image'
                ? 'bg-[#D4AF37] text-slate-950 shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo / Visual</span>
          </button>
        </div>

        {/* Content Area */}
        {storyType === 'text' ? (
          <div className="space-y-4">
            {/* Live Visual Preview */}
            <div
              style={{ background: selectedBg }}
              className="h-44 w-full rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white shadow-inner relative"
            >
              <p className="text-base font-bold font-display max-w-xs overflow-hidden">
                {textContent || 'Type your story status thoughts...'}
              </p>
            </div>

            {/* Text Input */}
            <textarea
              rows={3}
              placeholder="What is happening? Share updates with contacts..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />

            {/* Background Color Swatches */}
            <div>
              <span className="text-xs font-semibold text-slate-500 mb-2 block">
                Liquid Glass Background
              </span>
              <div className="flex items-center space-x-3">
                {bgOptions.map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => setSelectedBg(bg.value)}
                    style={{ background: bg.value }}
                    className={`h-9 flex-1 rounded-xl border-2 transition-transform ${
                      selectedBg === bg.value
                        ? 'border-slate-900 dark:border-white scale-105 shadow-md'
                        : 'border-transparent opacity-80'
                    }`}
                    title={bg.name}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Photo preset selector */}
            <span className="text-xs font-semibold text-slate-500 block">Select Visual Asset</span>
            <div className="grid grid-cols-4 gap-2">
              {photoPresets.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="Preset"
                  referrerPolicy="no-referrer"
                  onClick={() => setSelectedPhotoUrl(url)}
                  className={`h-20 w-full object-cover rounded-xl cursor-pointer border-2 transition-transform ${
                    selectedPhotoUrl === url
                      ? 'border-[#D4AF37] scale-105 shadow-lg'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>
        )}

        {/* Privacy Selector */}
        <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Audience: My Contacts</span>
          </div>
          <span className="text-[10px] text-slate-400">Expires in 24 Hours</span>
        </div>

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-slate-950 font-bold shadow-lg hover:brightness-110 active:scale-98 transition-all"
        >
          Share Status Update
        </button>
      </div>
    </div>
  );
};
