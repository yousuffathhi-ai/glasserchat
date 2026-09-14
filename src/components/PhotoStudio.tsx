import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Crop,
  Sliders,
  Sparkles,
  Download,
  Send,
  X,
  Type,
  RotateCw,
  Undo2,
  Check,
  Wand2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface PhotoStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onExportImage: (dataUrl: string, caption?: string) => void;
  initialImageUrl?: string;
  theme?: ThemeMode;
}

type CropRatio = 'original' | '1:1' | '4:5' | '16:9' | '9:16';
type FilterType = 'normal' | 'cyberpunk' | 'neon-pink' | 'golden-hour' | 'noir' | 'vhs' | 'emerald';

export const PhotoStudio: React.FC<PhotoStudioProps> = ({
  isOpen,
  onClose,
  onExportImage,
  initialImageUrl,
  theme,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(
    initialImageUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80'
  );
  const [activeTool, setActiveTool] = useState<'filters' | 'crop' | 'adjust' | 'text' | 'ai'>('filters');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('normal');
  const [cropRatio, setCropRatio] = useState<CropRatio>('original');

  // Adjustments
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  // Text overlay
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [caption, setCaption] = useState('');

  // AI Prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialImageUrl) {
      setImageSrc(initialImageUrl);
    }
  }, [initialImageUrl]);

  useEffect(() => {
    renderCanvas();
  }, [imageSrc, selectedFilter, brightness, contrast, saturation, blur, overlayText, textColor, cropRatio]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      let targetWidth = img.width;
      let targetHeight = img.height;

      // Calculate target crop dimensions
      if (cropRatio === '1:1') {
        const side = Math.min(img.width, img.height);
        targetWidth = side;
        targetHeight = side;
      } else if (cropRatio === '4:5') {
        targetWidth = img.width;
        targetHeight = (img.width * 5) / 4;
      } else if (cropRatio === '16:9') {
        targetWidth = img.width;
        targetHeight = (img.width * 9) / 16;
      } else if (cropRatio === '9:16') {
        targetWidth = (img.height * 9) / 16;
        targetHeight = img.height;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Clear & Draw
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      // Apply CSS Filters directly in canvas context
      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      if (blur > 0) filterString += ` blur(${blur}px)`;

      // Preset filter adjustments
      if (selectedFilter === 'noir') {
        filterString += ' grayscale(100%) contrast(140%)';
      } else if (selectedFilter === 'cyberpunk') {
        filterString += ' hue-rotate(290deg) saturate(180%) contrast(120%)';
      } else if (selectedFilter === 'neon-pink') {
        filterString += ' hue-rotate(330deg) saturate(220%)';
      } else if (selectedFilter === 'golden-hour') {
        filterString += ' sepia(40%) saturate(150%) brightness(105%)';
      } else if (selectedFilter === 'emerald') {
        filterString += ' hue-rotate(85deg) saturate(160%)';
      } else if (selectedFilter === 'vhs') {
        filterString += ' contrast(130%) saturate(140%)';
      }

      ctx.filter = filterString;

      // Draw cropped/centered image
      const srcX = (img.width - targetWidth) / 2;
      const srcY = (img.height - targetHeight) / 2;
      ctx.drawImage(img, srcX > 0 ? srcX : 0, srcY > 0 ? srcY : 0, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

      // VHS Grain line overlay
      if (selectedFilter === 'vhs') {
        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
        for (let y = 0; y < targetHeight; y += 8) {
          ctx.fillRect(0, y, targetWidth, 2);
        }
      }

      // Draw text overlay if any
      if (overlayText.trim()) {
        ctx.filter = 'none';
        const fontSize = Math.max(24, Math.floor(targetWidth * 0.06));
        ctx.font = `900 ${fontSize}px sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(overlayText.toUpperCase(), targetWidth / 2, targetHeight - 40);
        ctx.fillText(overlayText.toUpperCase(), targetWidth / 2, targetHeight - 40);
      }
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/imagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageSrc(data.imageUrl);
      } else {
        setAiError(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      setAiError('Network error connecting to Gemini AI generator.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSend = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
      onExportImage(dataUrl, caption);
      onClose();
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `convosphere-studio-${Date.now()}.jpg`;
      link.href = canvasRef.current.toDataURL('image/jpeg', 0.92);
      link.click();
    }
  };

  if (!isOpen) return null;

  const filters: { id: FilterType; name: string; color: string }[] = [
    { id: 'normal', name: 'Original', color: 'from-slate-600 to-slate-800' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: 'from-[#FF007F] to-[#007AFF]' },
    { id: 'neon-pink', name: 'Neon Pink', color: 'from-[#FF007F] to-purple-600' },
    { id: 'golden-hour', name: 'Golden Hour', color: 'from-[#FFD700] to-amber-600' },
    { id: 'emerald', name: 'Emerald Glow', color: 'from-[#00F0FF] to-emerald-600' },
    { id: 'noir', name: 'Dark Noir', color: 'from-zinc-800 to-black' },
    { id: 'vhs', name: 'Retro VHS', color: 'from-rose-500 to-cyan-500' },
  ];

  return (
    <div
      id="photo-studio-modal"
      className="fixed inset-0 z-50 flex flex-col bg-[#080A0F] text-slate-100 animate-fadeIn overflow-hidden select-none"
    >
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0E1118]/90 border-b border-white/10 backdrop-blur-xl z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-black font-display text-white flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#FF007F]" />
              <span>ConvoSphere Photo Studio</span>
            </h2>
            <p className="text-[10px] text-slate-400">PicsArt-grade Canvas & AI Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center space-x-1 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Open Photo</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-all"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FF007F] via-[#8A2BE2] to-[#007AFF] text-white text-xs font-bold shadow-lg hover:brightness-110 flex items-center space-x-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Chat</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-4 bg-[#05060A] overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF007F]/10 via-[#007AFF]/5 to-transparent pointer-events-none" />

        <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-[85vw] max-h-[58vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom Tool Panels */}
      <div className="bg-[#0E1118] border-t border-white/10 p-3 sm:p-4 z-20">
        {/* Sub-tool controllers */}
        <div className="mb-3 max-w-2xl mx-auto">
          {/* 1. FILTERS */}
          {activeTool === 'filters' && (
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-2xl transition-all flex-shrink-0 ${
                    selectedFilter === f.id
                      ? 'bg-gradient-to-r from-[#FF007F]/20 to-[#007AFF]/20 border border-[#00F0FF]'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} shadow-md flex items-center justify-center text-xs font-bold`}
                  >
                    {f.name.slice(0, 3)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-200">{f.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* 2. CROP TOOL */}
          {activeTool === 'crop' && (
            <div className="flex items-center justify-center space-x-2">
              {(['original', '1:1', '4:5', '16:9', '9:16'] as CropRatio[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setCropRatio(r)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    cropRatio === r
                      ? 'bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {r === 'original' ? 'Free/Orig' : r}
                </button>
              ))}
            </div>
          )}

          {/* 3. ADJUST TOOL */}
          {activeTool === 'adjust' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Brightness: {brightness}%</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#FF007F]"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Contrast: {contrast}%</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-[#007AFF]"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Saturation: {saturation}%</span>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-[#00F0FF]"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Soft Blur: {blur}px</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full accent-[#FFD700]"
                />
              </div>
            </div>
          )}

          {/* 4. TEXT OVERLAY */}
          {activeTool === 'text' && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="Type overlay text (e.g. VIBES)..."
                className="w-full sm:flex-1 bg-[#151922] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase tracking-wider outline-none focus:border-[#FF007F]"
              />
              <div className="flex items-center space-x-1.5">
                {['#FFFFFF', '#FF007F', '#00F0FF', '#FFD700', '#007AFF'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setTextColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${textColor === c ? 'scale-125 ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 5. AI GENERATOR */}
          {activeTool === 'ai' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe an image to generate with Gemini AI (e.g. Cyberpunk girl in rain)..."
                  className="flex-1 bg-[#151922] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00F0FF]"
                />
                <button
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#007AFF] text-white text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{isGeneratingAi ? 'Generating...' : 'Generate'}</span>
                </button>
              </div>
              {aiError && <p className="text-[11px] text-rose-400">{aiError}</p>}
            </div>
          )}
        </div>

        {/* Primary Tool Switcher Bar */}
        <div className="flex items-center justify-center space-x-2 border-t border-white/5 pt-2">
          {[
            { id: 'filters' as const, label: 'Filters', icon: Palette },
            { id: 'crop' as const, label: 'Free Crop', icon: Crop },
            { id: 'adjust' as const, label: 'Adjust', icon: Sliders },
            { id: 'text' as const, label: 'Text Art', icon: Type },
            { id: 'ai' as const, label: 'Gemini AI', icon: Sparkles },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF007F] to-[#007AFF] text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
