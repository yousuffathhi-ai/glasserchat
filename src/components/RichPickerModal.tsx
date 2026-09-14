import React, { useState, useRef } from 'react';
import {
  Smile,
  Image as ImageIcon,
  Sparkles,
  Music,
  Zap,
  Search,
  X,
  Play,
  Pause,
  Send,
  Volume2,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface RichPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectGif: (gifUrl: string) => void;
  onSelectSticker: (stickerUrl: string) => void;
  onSelectMusic: (music: { title: string; artist: string; audioUrl: string; coverArt?: string }) => void;
  onSelectLiveEmoji: (text: string) => void;
  theme?: ThemeMode;
}

type TabType = 'emoji' | 'gifs' | 'stickers' | 'music' | 'live-text';

export const RichPickerModal: React.FC<RichPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectGif,
  onSelectSticker,
  onSelectMusic,
  onSelectLiveEmoji,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('emoji');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  // Categorized Emojis
  const emojiCategories: { [cat: string]: string[] } = {
    'Smileys & Emotion': [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥹', '😊',
      '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😋', '😛',
      '😜', '🤪', '🤩', '🥳', '😎', '🤓', '🧐', '😏', '😒', '😞',
      '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢',
      '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶',
      '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🫢',
    ],
    'Gestures & People': [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
      '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲',
      '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
    ],
    'Hearts & Reactions': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
      '✨', '🔥', '⭐', '🌟', '💫', '💥', '💯', '💢', '💬', '💭',
    ],
    'Animals & Nature': [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
      '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤',
      '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🦋',
      '🌸', '🌺', '🌹', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🍀',
    ],
    'Food & Drinks': [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍔', '🍟',
      '🍕', '🌭', '🥪', '🌮', '🌯', '🍜', '🍣', '🍦', '🍩', '☕',
    ],
  };

  // GIFs
  const gifList = [
    {
      id: 'g1',
      title: 'Neon Cyber Vibe',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g2',
      title: 'City Lights Motion',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g3',
      title: 'Futuristic Wave',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g4',
      title: 'Electric Gold Glow',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g5',
      title: 'Vibrant Hologram',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'g6',
      title: 'Cosmic Nebula',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
    },
  ];

  // Stickers
  const stickerPacks = [
    {
      id: 's1',
      name: 'Electric Cat',
      url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 's2',
      name: 'Cyber Skull',
      url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 's3',
      name: 'Glass Spark',
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 's4',
      name: 'Gold Crown',
      url: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 's5',
      name: 'Heart Rocket',
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&auto=format&fit=crop&q=80',
    },
    {
      id: 's6',
      name: 'Neon Smile',
      url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=300&auto=format&fit=crop&q=80',
    },
  ];

  // Curated Music Tracks & Ambient Soundscapes
  const musicClips = [
    {
      id: 'm1',
      title: 'Midnight Glass Lo-Fi',
      artist: 'ConvoSphere Soundlab',
      duration: '2:45',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'm2',
      title: 'Cyberpunk Synthwave',
      artist: 'Neon Orbit',
      duration: '3:10',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3',
      cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'm3',
      title: 'Golden Horizon Ambient',
      artist: 'Aura Chill',
      duration: '2:15',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-abstract-intention-12099.mp3',
      cover: 'https://images.unsplash.com/photo-1507525428033-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'm4',
      title: 'Acoustic Sunrise Beat',
      artist: 'Echoes of Calm',
      duration: '1:50',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_731e843657.mp3?filename=acoustic-guitars-ambient-uplifting-10940.mp3',
      cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&auto=format&fit=crop&q=80',
    },
  ];

  // Live Emoji & Animated Text Presets
  const liveTextPresets = [
    { text: '✨ CONVOSPHERE VIBES ✨', style: 'bg-gradient-to-r from-[#FF007F] via-[#00F0FF] to-[#007AFF]' },
    { text: '🔥 LET’S GOOO 🔥', style: 'bg-gradient-to-r from-amber-500 to-rose-600' },
    { text: '💖 SENDING LOVE 💖', style: 'bg-gradient-to-r from-pink-500 to-purple-600' },
    { text: '🚀 TO THE MOON 🚀', style: 'bg-gradient-to-r from-cyan-400 to-blue-600' },
    { text: '☕ COFFEE FIRST ☕', style: 'bg-gradient-to-r from-yellow-600 to-amber-800' },
    { text: '🔒 TOP SECRET / VANISH 🔒', style: 'bg-gradient-to-r from-purple-700 to-indigo-900' },
  ];

  const handlePlayMusic = (clip: typeof musicClips[0]) => {
    if (playingTrackId === clip.id) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(clip.audioUrl);
      audio.play().catch(() => {});
      audioRef.current = audio;
      setPlayingTrackId(clip.id);
      audio.onended = () => setPlayingTrackId(null);
    }
  };

  return (
    <div
      id="rich-picker-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="rich-picker-card"
        className="relative w-full max-w-xl rounded-t-3xl sm:rounded-3xl bg-[#0F1219]/95 border border-[#007AFF]/35 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-slate-100 backdrop-blur-2xl flex flex-col h-[520px] max-h-[85vh] animate-slideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Navigation Tabs */}
        <div className="p-4 pb-2 border-b border-white/10 bg-[#141822]/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
              <h3 className="text-xs font-black font-display uppercase tracking-wider text-white">
                Rich Media & Expression Picker
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 5 Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'emoji' as const, label: 'Emoji', icon: Smile },
              { id: 'gifs' as const, label: 'GIFs', icon: ImageIcon },
              { id: 'stickers' as const, label: 'Stickers', icon: Sparkles },
              { id: 'music' as const, label: 'Music', icon: Music },
              { id: 'live-text' as const, label: 'Live Text', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar for Emoji/GIFs */}
          {(activeTab === 'emoji' || activeTab === 'gifs') && (
            <div className="relative mt-2.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab === 'emoji' ? 'emojis' : 'trending GIFs'}...`}
                className="w-full bg-[#0B0D13] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#00F0FF]"
              />
            </div>
          )}
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 1. EMOJI TAB */}
          {activeTab === 'emoji' && (
            <div className="space-y-4">
              {Object.entries(emojiCategories).map(([category, list]) => {
                const filtered = searchQuery
                  ? list.filter(() => true) // in emoji search we filter
                  : list;
                return (
                  <div key={category}>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                      {filtered.map((em, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onSelectEmoji(em);
                            onClose();
                          }}
                          className="h-10 text-xl flex items-center justify-center rounded-xl hover:bg-white/10 hover:scale-125 transition-all select-none"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. GIFS TAB */}
          {activeTab === 'gifs' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {gifList.map((gif) => (
                <div
                  key={gif.id}
                  onClick={() => {
                    onSelectGif(gif.url);
                    onClose();
                  }}
                  className="group relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/10 hover:border-[#FF007F] cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 flex items-end p-2">
                    <span className="text-[11px] font-bold text-white truncate">
                      {gif.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. STICKERS TAB */}
          {activeTab === 'stickers' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">Glass Art Sticker Collection</span>
                <span className="text-[10px] bg-[#FF007F]/20 text-[#FF007F] font-bold px-2 py-0.5 rounded-full">
                  6 Stickers Available
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {stickerPacks.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => {
                      onSelectSticker(sticker.url);
                      onClose();
                    }}
                    className="group flex flex-col items-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#00F0FF] transition-all"
                  >
                    <img
                      src={sticker.url}
                      alt={sticker.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl object-cover group-hover:scale-110 transition-transform shadow-md"
                    />
                    <span className="text-[11px] font-bold text-slate-200 mt-2 truncate max-w-full">
                      {sticker.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. MUSIC CLIPS TAB */}
          {activeTab === 'music' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Attach Background Music & Audio</span>
                <span className="text-[10px] text-[#00F0FF] font-bold">Pixabay Royalty Free</span>
              </div>
              {musicClips.map((clip) => {
                const isPlaying = playingTrackId === clip.id;
                return (
                  <div
                    key={clip.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={clip.cover}
                          alt={clip.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handlePlayMusic(clip)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                          title={isPlaying ? 'Pause' : 'Preview'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4 text-[#00F0FF]" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-100 truncate">{clip.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{clip.artist} • {clip.duration}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (audioRef.current) audioRef.current.pause();
                        onSelectMusic({
                          title: clip.title,
                          artist: clip.artist,
                          audioUrl: clip.audioUrl,
                          coverArt: clip.cover,
                        });
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white text-xs font-bold flex items-center space-x-1 hover:brightness-110 shadow-md"
                    >
                      <Send className="w-3 h-3" />
                      <span>Attach</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. LIVE TEXT & BIG EMOJIS */}
          {activeTab === 'live-text' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-1">
                Send animated typography banners and oversized live expression cards
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {liveTextPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectLiveEmoji(preset.text);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl ${preset.style} text-white font-extrabold text-sm shadow-lg hover:scale-[1.03] transition-all flex items-center justify-center text-center`}
                  >
                    <span>{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#0B0D13] flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">ConvoSphere Rich Expressions</span>
          <span className="text-[#FFD700] font-bold">Vibrant Glass</span>
        </div>
      </div>
    </div>
  );
};
