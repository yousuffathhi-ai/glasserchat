// Premium Chat Wallpapers & Surface Backgrounds for GlassChat Pro
// Designed for crystal-clear readability in both dark and light modes

export interface WallpaperPreset {
  id: string;
  name: string;
  category: 'cyber' | 'luxury' | 'minimal' | 'nature' | 'art';
  thumbnailUrl: string;
  description: string;
  // CSS styles applied to background surface
  getStyle: (theme: 'sophisticated-dark' | 'gold-light' | 'dark-emerald', opacity: number) => {
    background: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    opacity?: number;
  };
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'obsidian-matrix',
    name: 'Obsidian Matrix',
    category: 'cyber',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=80',
    description: 'Deep black glass with subtle cyber circuit nodes and neon grid lines.',
    getStyle: (theme, opacity = 0.8) => ({
      background: `
        radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 60%),
        linear-gradient(rgba(11, 13, 14, 0.94), rgba(11, 13, 14, 0.96)),
        repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(204, 255, 0, 0.04) 40px, rgba(204, 255, 0, 0.04) 41px),
        repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(6, 182, 212, 0.04) 40px, rgba(6, 182, 212, 0.04) 41px)
      `,
      opacity,
    }),
  },
  {
    id: 'liquid-gold',
    name: 'Liquid Gold Honeycomb',
    category: 'luxury',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    description: 'Geometric golden hexagonal mesh with frosted champagne reflections.',
    getStyle: (theme, opacity = 0.85) => ({
      background: theme === 'gold-light'
        ? `radial-gradient(circle at top right, rgba(212, 175, 55, 0.15), transparent 70%),
           radial-gradient(circle at bottom left, rgba(245, 158, 11, 0.1), transparent 60%),
           linear-gradient(135deg, #FAF8F5 0%, #F3EFEA 100%)`
        : `radial-gradient(circle at top right, rgba(212, 175, 55, 0.12), transparent 70%),
           radial-gradient(circle at bottom left, rgba(184, 134, 11, 0.08), transparent 60%),
           linear-gradient(135deg, #12151A 0%, #0E1013 100%)`,
      opacity,
    }),
  },
  {
    id: 'cyber-cyan',
    name: 'Cyber Constellations',
    category: 'cyber',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80',
    description: 'Interconnected glowing data nodes with deep space atmosphere.',
    getStyle: (theme, opacity = 0.75) => ({
      background: `
        radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
        linear-gradient(180deg, #090B0E 0%, #0D1217 100%)
      `,
      opacity,
    }),
  },
  {
    id: 'emerald-aurora',
    name: 'Emerald Aurora',
    category: 'nature',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&auto=format&fit=crop&q=80',
    description: 'Subtle northern lights glow with soft emerald and jade waves.',
    getStyle: (theme, opacity = 0.8) => ({
      background: `
        radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.15), transparent 70%),
        radial-gradient(ellipse at 100% 100%, rgba(5, 150, 105, 0.1), transparent 60%),
        linear-gradient(180deg, #08100C 0%, #0B1410 100%)
      `,
      opacity,
    }),
  },
  {
    id: 'frosted-minimal',
    name: 'Frosted Minimal Glass',
    category: 'minimal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&auto=format&fit=crop&q=80',
    description: 'Clean micro-dot lattice with maximum focus on messages.',
    getStyle: (theme, opacity = 0.9) => ({
      background: theme === 'gold-light'
        ? `radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px), linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)`
        : `radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(180deg, #111418 0%, #0B0D0E 100%)`,
      backgroundSize: '24px 24px, 100% 100%',
      opacity,
    }),
  },
  {
    id: 'doodle-pattern',
    name: 'Encrypted Doodles',
    category: 'art',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    description: 'Classic messaging icons and lock doodles softly woven into the background.',
    getStyle: (theme, opacity = 0.7) => ({
      background: theme === 'gold-light'
        ? `radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 80%),
           linear-gradient(#FAF8F5, #F5F2ED)`
        : `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.06) 0%, transparent 80%),
           linear-gradient(#101317, #0B0D0E)`,
      opacity,
    }),
  },
  {
    id: 'midnight-solid',
    name: 'Midnight Obsidian',
    category: 'minimal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&auto=format&fit=crop&q=80',
    description: 'Pure, deep obsidian slate for absolute contrast and OLED battery preservation.',
    getStyle: (theme, opacity = 1) => ({
      background: theme === 'gold-light' ? '#F4F4F6' : '#0B0D0E',
      opacity,
    }),
  },
];

export function getChatWallpaperStyle(
  wallpaperIdOrUrl: string = 'obsidian-matrix',
  theme: 'sophisticated-dark' | 'gold-light' | 'dark-emerald' = 'sophisticated-dark',
  opacity: number = 0.85
) {
  // Check preset
  const preset = WALLPAPER_PRESETS.find((p) => p.id === wallpaperIdOrUrl);
  if (preset) {
    return preset.getStyle(theme, opacity);
  }

  // Custom image URL fallback
  if (wallpaperIdOrUrl && (wallpaperIdOrUrl.startsWith('http') || wallpaperIdOrUrl.startsWith('data:'))) {
    return {
      backgroundImage: `linear-gradient(rgba(11, 13, 14, ${1 - opacity * 0.5}), rgba(11, 13, 14, ${1 - opacity * 0.5})), url(${wallpaperIdOrUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: 1,
    };
  }

  // Default fallback
  return WALLPAPER_PRESETS[0].getStyle(theme, opacity);
}
