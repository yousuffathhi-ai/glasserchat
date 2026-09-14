import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Radio,
  PhoneCall,
  Sparkles,
  Settings,
  Lock,
  Sun,
  Moon,
  Users,
  ShieldCheck,
  Zap,
  Download,
  HelpCircle,
} from 'lucide-react';
import { ThemeMode, UserProfile, OnlineStatus, NavigationTab } from '../types';
import { isPWAInstalled } from '../utils/pwa';
import { ConvoSphereLogo } from './common/ConvoSphereLogo';

interface NavigationSidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser?: UserProfile | null;
  unreadTotalCount?: number;
  missedCallsCount?: number;
  unviewedStoriesCount?: number;
  onLockApp?: () => void;
  onOpenPWAInstallModal?: () => void;
  onOpenGuide?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  currentUser,
  unreadTotalCount = 0,
  missedCallsCount = 0,
  unviewedStoriesCount = 0,
  onLockApp,
  onOpenPWAInstallModal,
  onOpenGuide,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';

  const statusColors: Record<OnlineStatus, string> = {
    online: 'bg-emerald-500 ring-2 ring-emerald-300',
    away: 'bg-amber-500 ring-2 ring-amber-300',
    busy: 'bg-rose-500 ring-2 ring-rose-300',
    offline: 'bg-slate-400 ring-2 ring-slate-300',
  };

  return (
    <aside
      id="main-navigation-sidebar"
      className="hidden md:flex flex-col items-center justify-between py-5 px-3 z-30 transition-all duration-300 bg-[rgba(15,20,32,0.85)] border-r border-[#00F0FF]/25 shadow-[4px_0_30px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-slate-200 w-20 md:w-22 min-h-screen select-none"
    >
      {/* Top Section: Logo & Branding */}
      <div className="flex flex-col items-center space-y-6">
        <div
          id="brand-logo-container"
          className="relative group cursor-pointer text-center flex flex-col items-center"
          title="ConvoSphere — Connect. Express. Sphere of Seamless Conversations."
          onClick={() => onSelectTab('chats')}
        >
          <div className="transition-transform duration-300 group-hover:scale-110">
            <ConvoSphereLogo size="md" withGlow={true} withRings={true} />
          </div>
          <span className="mt-1 text-[9px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#FFD700] to-[#FF007F] uppercase drop-shadow-sm">
            SPHERE
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col items-center space-y-3 w-full">
          {/* Chats Tab */}
          <button
            id="nav-tab-chats"
            onClick={() => onSelectTab('chats')}
            className={`relative p-3 rounded-2xl transition-all duration-200 group ${
              activeTab === 'chats'
                ? 'bg-gradient-to-r from-[#FFD700]/20 via-[#FF007F]/20 to-[#8A2BE2]/20 text-[#FFD700] border border-[#FFD700]/60 shadow-[0_0_18px_rgba(255,215,0,0.45)]'
                : 'text-white/60 hover:text-[#00F0FF] hover:bg-white/5'
            }`}
            title="Chats & Messages"
          >
            <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
            {unreadTotalCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FFD700] text-slate-950 px-1 text-[10px] font-extrabold shadow-md">
                {unreadTotalCount}
              </span>
            )}
          </button>

          {/* Updates Tab (Status + Channels) */}
          <button
            id="nav-tab-updates"
            onClick={() => onSelectTab('updates')}
            className={`relative p-3 rounded-2xl transition-all duration-200 group ${
              activeTab === 'updates' || activeTab === 'status'
                ? 'bg-gradient-to-r from-[#FFD700]/20 via-[#FF007F]/20 to-[#8A2BE2]/20 text-[#FFD700] border border-[#FFD700]/60 shadow-[0_0_18px_rgba(255,215,0,0.45)]'
                : 'text-white/60 hover:text-[#00F0FF] hover:bg-white/5'
            }`}
            title="Updates & Channels"
          >
            <Radio className="w-5 h-5 transition-transform group-hover:scale-110" />
            {unviewedStoriesCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F0FF]"></span>
              </span>
            )}
          </button>

          {/* Communities Tab */}
          <button
            id="nav-tab-communities"
            onClick={() => onSelectTab('communities')}
            className={`relative p-3 rounded-2xl transition-all duration-200 group ${
              activeTab === 'communities'
                ? 'bg-gradient-to-r from-[#FFD700]/20 via-[#FF007F]/20 to-[#8A2BE2]/20 text-[#FFD700] border border-[#FFD700]/60 shadow-[0_0_18px_rgba(255,215,0,0.45)]'
                : 'text-white/60 hover:text-[#00F0FF] hover:bg-white/5'
            }`}
            title="Communities"
          >
            <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>

          {/* Calls Tab */}
          <button
            id="nav-tab-calls"
            onClick={() => onSelectTab('calls')}
            className={`relative p-3 rounded-2xl transition-all duration-200 group ${
              activeTab === 'calls'
                ? 'bg-gradient-to-r from-[#FFD700]/20 via-[#FF007F]/20 to-[#8A2BE2]/20 text-[#FFD700] border border-[#FFD700]/60 shadow-[0_0_18px_rgba(255,215,0,0.45)]'
                : 'text-white/60 hover:text-[#00F0FF] hover:bg-white/5'
            }`}
            title="HD Voice & Video Calls"
          >
            <PhoneCall className="w-5 h-5 transition-transform group-hover:scale-110" />
            {missedCallsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF007F] px-1 text-[10px] font-bold text-white shadow-sm">
                {missedCallsCount}
              </span>
            )}
          </button>

          {/* Settings Tab */}
          <button
            id="nav-tab-settings"
            onClick={() => onSelectTab('settings')}
            className={`relative p-3 rounded-2xl transition-all duration-200 group ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#FFD700]/20 via-[#FF007F]/20 to-[#8A2BE2]/20 text-[#FFD700] border border-[#FFD700]/60 shadow-[0_0_18px_rgba(255,215,0,0.45)]'
                : 'text-white/60 hover:text-[#00F0FF] hover:bg-white/5'
            }`}
            title="Settings & Privacy"
          >
            <Settings className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>

          {/* User Guide / Onboarding Tour Button */}
          {onOpenGuide && (
            <button
              id="nav-guide-tour-btn"
              onClick={onOpenGuide}
              className={`relative p-3 rounded-2xl transition-all duration-200 group border ${
                isSophisticatedDark
                  ? 'border-[#00F0FF]/30 bg-[#161922] text-[#00F0FF] hover:border-[#FF007F] hover:text-[#FF007F] hover:shadow-[0_0_15px_rgba(255,0,127,0.25)]'
                  : isGold
                  ? 'border-[#D4AF37]/40 bg-amber-50 text-[#996515] hover:bg-amber-100'
                  : 'border-cyan-500/30 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/40'
              }`}
              title="ConvoSphere User Guide & Interactive Tour"
            >
              <HelpCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          )}

          {/* PWA Install Button (Hidden if already standalone / installed) */}
          {onOpenPWAInstallModal && !isPWAInstalled() && (
            <button
              id="nav-pwa-install-btn"
              onClick={onOpenPWAInstallModal}
              className={`relative p-3 rounded-2xl transition-all duration-200 group border ${
                isSophisticatedDark
                  ? 'border-[#D4AF37]/40 bg-[#16191E] text-[#D4AF37] hover:bg-[#D4AF37]/20 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : isGold
                  ? 'border-[#D4AF37]/40 bg-amber-50 text-[#996515] hover:bg-amber-100 shadow-sm'
                  : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40'
              }`}
              title="Install ConvoSphere App"
            >
              <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Section: Theme Toggle, App Lock, User Avatar */}
      <div className="flex flex-col items-center space-y-4 pt-4 border-t border-[#D4AF37]/20 w-full">
        {/* Theme Toggle Button */}
        <button
          id="theme-switcher-btn"
          onClick={onToggleTheme}
          className={`p-2.5 rounded-2xl transition-all duration-200 border ${
            isSophisticatedDark
              ? 'bg-[#181B20] text-[#D4AF37] border-[#D4AF37]/40 hover:bg-[#22272E] shadow-sm'
              : isGold
              ? 'bg-amber-50 text-[#AA820A] border-[#D4AF37]/40 hover:bg-amber-100/80'
              : 'bg-slate-900 text-emerald-400 border-emerald-500/30 hover:bg-slate-800'
          }`}
          title={`Current: ${theme}. Click to switch theme`}
        >
          {isSophisticatedDark ? (
            <Moon className="w-4 h-4 text-[#D4AF37]" />
          ) : isGold ? (
            <Sun className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* User Profile Avatar with Online Status Toggle */}
        <div
          id="user-profile-nav-avatar"
          onClick={() => onSelectTab('settings')}
          className="relative cursor-pointer group"
          title={currentUser ? `${currentUser.name} (${currentUser.handle})` : 'User Profile'}
        >
          <div className="w-11 h-11 rounded-full border-2 border-[#D4AF37] p-0.5 transition-transform group-hover:scale-105">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'}
              alt={currentUser?.name || 'User'}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${
              currentUser?.status ? (statusColors[currentUser.status] || 'bg-emerald-500') : 'bg-emerald-500'
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
