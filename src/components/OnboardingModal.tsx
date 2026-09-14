import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Video,
  Camera,
  Layers,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Pause,
  Shield,
  Palette,
  Paperclip,
  Share2,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  features: string[];
  mockupVisual: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(true);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      title: 'Welcome to ConvoSphere',
      subtitle: 'Connect. Express. Sphere of Seamless Conversations.',
      description:
        'A next-generation private messaging and media suite built on futuristic glassmorphic design. Calm on the surface, extraordinarily powerful underneath.',
      badge: 'THE ARCHITECTURE',
      icon: Sparkles,
      accentColor: 'from-[#FF007F] to-[#007AFF]',
      features: [
        'End-to-End Encrypted private messaging',
        'Vibrant Dark Glassmorphism aesthetic',
        'Zero dummy data — live registered contacts',
        'Cross-platform PWA offline capabilities',
      ],
      mockupVisual: 'welcome',
    },
    {
      title: 'Spherical Communication Dashboard',
      subtitle: 'Effortless Categorization & Quick Access',
      description:
        'Instantly filter conversations with smart pill buttons (All, Unread, Favourites, Groups) and navigate between Chats, Updates, Communities, and Calls seamlessly.',
      badge: 'DASHBOARD NAVIGATION',
      icon: MessageSquare,
      accentColor: 'from-[#007AFF] to-[#00F0FF]',
      features: [
        'Top search bar with instantaneous fuzzy search',
        'Pill filters: All, Unread, Favourites, Groups',
        'Stories & status updates carousel',
        'Vibrant Floating Action Button (FAB) for instant chats',
      ],
      mockupVisual: 'chats',
    },
    {
      title: 'WebRTC HD Voice & Video Calling',
      subtitle: 'Crystal-Clear WebRTC Conferencing with PIP',
      description:
        'Engage in peer-to-peer audio and video calls featuring a responsive Picture-in-Picture (PIP) camera preview, hardware mute, camera flipping, and synthesized ringtone feedback.',
      badge: 'WEBRTC CALLING',
      icon: Video,
      accentColor: 'from-[#FF007F] to-[#8A2BE2]',
      features: [
        'Responsive full-screen video with draggable PIP',
        'Dynamic call invite links using current domain',
        'Synthetic Web Audio ringtones and connected chimes',
        'AI-generated meeting minutes and action items',
      ],
      mockupVisual: 'calls',
    },
    {
      title: 'Creative Media Studio & AI',
      subtitle: 'Embedded Canvas Image Editor & AI Generator',
      description:
        'Craft stunning visuals directly inside ConvoSphere. Import original ratio photos, use Free Crop presets, apply Cyberpunk or Golden Hour filters, and generate assets with Gemini AI.',
      badge: 'CREATIVE SUITE',
      icon: Palette,
      accentColor: 'from-[#00F0FF] to-[#FFD700]',
      features: [
        'Free Crop presets: 1:1, 4:5, 16:9, 9:16, Story',
        'Real-time filters: Cyberpunk, Neon Pink, VHS, Noir',
        'Gemini-powered text-to-image AI prompt generator',
        'Canvas brush drawing, text stickers, and instant chat export',
      ],
      mockupVisual: 'studio',
    },
    {
      title: '10-Item Attachment Sheet & Rich Pickers',
      subtitle: 'Comprehensive Media, Polls, Events & Music',
      description:
        'Tap the plus button to launch an intuitive 10-item action menu for Documents, Live Camera, Stickers, Polls with real-time voting, Event scheduling, Geolocation, and Audio clips.',
      badge: 'RICH MEDIA SHARING',
      icon: Paperclip,
      accentColor: 'from-[#FFD700] to-[#FF007F]',
      features: [
        'Interactive Polls with live vote tallying',
        'Event scheduling with RSVP status tracking',
        'Searchable Emojis, GIFs, Stickers & Music clips',
        'Live Camera snapshot and custom sticker maker',
      ],
      mockupVisual: 'attachments',
    },
  ];

  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      id="onboarding-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="onboarding-modal-card"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0F1218]/95 border border-[#FF007F]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-slate-100 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent header stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF007F] via-[#00F0FF] to-[#007AFF]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors z-20"
          title="Skip Tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8">
          {/* Top Tag & Title */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#FF007F]/20 to-[#007AFF]/20 text-[#00F0FF] border border-[#00F0FF]/30">
              {step.badge}
            </span>
            <span className="text-xs text-slate-400">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mb-1">
            {step.title}
          </h2>
          <p className="text-sm font-semibold text-[#FFD700] mb-4">
            {step.subtitle}
          </p>

          {/* Interactive Simulated Video / Feature Showcase Box */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#161B26] to-[#0D1017] border border-white/10 p-5 mb-6 shadow-inner min-h-[170px] flex flex-col justify-between">
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br ${step.accentColor} opacity-20 blur-3xl pointer-events-none`} />

            <div className="relative z-10 flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.accentColor} p-0.5 flex-shrink-0 shadow-lg`}>
                <div className="w-full h-full rounded-[14px] bg-[#0F1218] flex items-center justify-center text-white">
                  <step.icon className="w-6 h-6 text-[#00F0FF]" />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {step.description}
                </p>

                {/* Key feature chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
                  {step.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs text-slate-200 bg-white/5 border border-white/5 rounded-xl px-2.5 py-1.5"
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated interactive video scrub bar */}
            <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                  title={isPlayingDemo ? 'Pause Demo' : 'Play Demo'}
                >
                  {isPlayingDemo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <span>Interactive Visual Demo: Active</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold">PGV Live Engine</span>
              </div>
            </div>
          </div>

          {/* Stepper Dots & Navigation Footer */}
          <div className="flex items-center justify-between pt-2">
            {/* Step Indicators */}
            <div className="flex items-center space-x-2">
              {tourSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-7 bg-gradient-to-r from-[#FF007F] to-[#007AFF]'
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-2.5">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center space-x-1 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF007F] via-[#8A2BE2] to-[#007AFF] text-white text-xs font-bold shadow-lg shadow-[#FF007F]/20 hover:brightness-110 flex items-center space-x-1.5 transition-all"
              >
                <span>{currentStep === tourSteps.length - 1 ? 'Start Using ConvoSphere' : 'Next Step'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
