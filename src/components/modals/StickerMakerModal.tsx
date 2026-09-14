import React, { useState, useRef } from 'react';
import { Smile, Sparkles, Download, Send, X, Palette, Type } from 'lucide-react';

interface StickerMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSticker: (stickerDataUrl: string) => void;
}

export const StickerMakerModal: React.FC<StickerMakerModalProps> = ({
  isOpen,
  onClose,
  onSendSticker,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [text, setText] = useState('LIT');
  const [color, setColor] = useState('#FF007F');
  const [shape, setShape] = useState<'badge' | 'circle' | 'cloud'>('badge');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const quickEmojis = ['🔥', '✨', '⚡', '💎', '🚀', '💖', '👑', '😎', '🎉', '🌟', '🦄', '💯'];
  const colors = ['#FF007F', '#007AFF', '#00F0FF', '#8A2BE2', '#FFD700', '#10B981'];

  const generateSticker = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw background shape
    ctx.clearRect(0, 0, 300, 300);

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(150, 150, 130, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    } else if (shape === 'cloud') {
      ctx.beginPath();
      ctx.arc(120, 140, 60, 0, Math.PI * 2);
      ctx.arc(180, 140, 60, 0, Math.PI * 2);
      ctx.arc(150, 110, 70, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    } else {
      // Rounded badge
      ctx.beginPath();
      ctx.roundRect(30, 30, 240, 240, 40);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    }

    // Draw Emoji
    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedEmoji, 150, 125);

    // Draw Text
    if (text) {
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText(text.toUpperCase(), 150, 205);
    }

    return canvas.toDataURL('image/png');
  };

  const handleSend = () => {
    const dataUrl = generateSticker();
    if (dataUrl) {
      onSendSticker(dataUrl);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#0E1118] border border-[#FFD700]/35 shadow-2xl p-6 text-slate-100 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black font-display text-white">Sticker Maker Studio</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Sticker Preview */}
        <div className="flex justify-center mb-5">
          <div
            className="w-44 h-44 flex flex-col items-center justify-center p-4 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            style={{
              backgroundColor: color,
              borderRadius: shape === 'circle' ? '9999px' : shape === 'cloud' ? '60px' : '36px',
              border: '4px solid white',
            }}
          >
            <span className="text-5xl select-none filter drop-shadow-md mb-1">{selectedEmoji}</span>
            <span className="text-white font-black text-sm tracking-wider uppercase drop-shadow-md truncate max-w-full">
              {text}
            </span>
          </div>
        </div>

        {/* Emoji Selector */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Pick Core Emoji
          </label>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {quickEmojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setSelectedEmoji(em)}
                className={`w-9 h-9 flex items-center justify-center text-lg rounded-xl transition-transform ${
                  selectedEmoji === em ? 'bg-white/20 scale-110 border border-[#00F0FF]' : 'hover:bg-white/10'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Caption */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Badge Caption
          </label>
          <input
            type="text"
            maxLength={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="STAMP TEXT"
            className="w-full bg-[#151922] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase tracking-wider outline-none focus:border-[#FF007F]"
          />
        </div>

        {/* Colors & Shape */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Color Tone
            </label>
            <div className="flex items-center space-x-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Shape
            </label>
            <div className="flex items-center space-x-1 bg-[#151922] p-1 rounded-xl">
              {(['badge', 'circle', 'cloud'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShape(s)}
                  className={`flex-1 text-[10px] font-bold py-1 rounded-lg capitalize transition-colors ${
                    shape === s ? 'bg-white/20 text-white' : 'text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FF007F] to-[#007AFF] text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Sticker</span>
          </button>
        </div>
      </div>
    </div>
  );
};
