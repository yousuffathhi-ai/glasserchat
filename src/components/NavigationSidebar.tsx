import React from 'react';
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
} from 'lucide-react';
import { ThemeMode, UserProfile, OnlineStatus, NavigationTab } from '../types';

interface NavigationSidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser: UserProfile;
  unreadTotalCount?: number;
  missedCallsCount?: number;
  unviewedStoriesCount?: number;
  onLockApp?: () => void;
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
      className={`flex flex-col items-center justify-between py-5 px-3 z-30 transition-all duration-300 ${
        isSophisticatedDark
          ? 'bg-[#0E1013]/95 border-r border-[#D4AF37]/20 shadow-[4px_0_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-slate-200'
          : isGold
          ? 'bg-white/85 border-r border-[#D4AF37]/30 shadow-[4px_0_24px_rgba(212,175,55,0.08)] backdrop-blur-xl text-slate-800'
          : 'bg-[#0F1214]/90 border-r border-emerald-500/20 shadow-[4px_0_24px_rgba(0,0,0,0.5)] backdrop-blur-xl text-slate-200'
      } w-20 md:w-22 min-h-screen select-none`}
    >
      {/* Top Section: Logo & Branding */}
      <div className="flex flex-col items-center space-y-6">
        <div
          id="brand-logo-container"
          className="relative group cursor-pointer"
          title="GlassChat Pro — Sophisticated Dark Edition"
          onClick={() => onSelectTab('chats')}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
              isSophisticatedDark
                ? 'bg-gradient-to-tr from-[#B8860B] via-[#D4AF37] to-[#FFDF73] text-slate-950 ring-2 ring-[#D4AF37]/50 shadow-[0_4px_24px_rgba(212,175,55,0.4)]'
                : isGold
                ? 'bg-gradient-to-tr from-[#B8860B] via-[#D4AF37] to-[#FFD700] text-slate-900 ring-2 ring-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.35)]'
                : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-lime-400 text-slate-950 ring-2 ring-emerald-400/50 shadow-[0_4px_20px_rgba(16,185,129,0.35)]'
            } group-hover:scale-105`}
          >
            <Sparkles className="w-6 h-6 animate-pulse text-slate-950" />
          </div>
          <span className="absolute -bottom-2 -right-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-950 text-[#FFDF73] border border-[#D4AF37]/60 shadow-sm">
            PRO
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
                ? isSophisticatedDark
                  ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white shadow-[0_4px_20px_rgba(212,175,55,0.35)] border border-[#FFDF73]/40'
                  : isGold
                  ? 'bg-gradient-to-br from-[#FFF9E6] to-[#FEF3C7] text-[#996515] border border-[#D4AF37]/60 shadow-[0_4px_16px_rgba(212,175,55,0.2)]'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-[0_4px_16px_rgba(16,185,129,0.25)]'
                : isSophisticatedDark
                ? 'text-slate-400 hover:text-[#D4AF37] hover:bg-white/5'
                : isGold
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Chats & Messages"
          >
            <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
            {unreadTotalCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D4AF37] text-slate-950 px-1 text-[10px] font-extrabold shadow-md">
                {unreadTotalCount}
              </span>
            )}
          </button>

          {/* Contacts Tab */}
          <button
            id="nav-tab-contacts"
            onClick={() => onSelectTab('contacts')}
            className={`relative p-3 rounded-2xl transition-all duration-200 group ${
              activeTab === 'contacts'
                ? isSophisticatedDark
                  ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white shadow-[0_4px_20px_rgba(212,175,55,0.35)] border border-[#FFDF73]/40'
                  : isGold
                  ? 'bg-gradient-to-br from-[#FFF9E6] to-[#FEF3C7] text-[#996515] border border-[#D4AF37]/60 shadow-[0_4px_16px_rgba(212,175,55,0.2)]'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-[0_4px_16px_rgba(16,185,129,0.25)]'
                : isSophisticatedDark
                ? 'text-slate-400 hover:text-[#D4AF37] hover:bg-white/5'
                : isGold
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Encrypted Address Book"
          >
            <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>

          {/* Calls Tab */}
          <button
            id="nav-tab-calls"
            onClick={() => onSelectTab('calls')}
            className={`relative p-3 rounded-2xl transition-all duration-200 group ${
              activeTab === 'calls'
                ? isSophisticatedDark
                  ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white shadow-[0_4px_20px_rgba(212,175,55,0.35)] border border-[#FFDF73]/40'
                  : isGold
                  ? 'bg-gradient-to-br from-[#FFF9E6] to-[#FEF3C7] text-[#996515] border border-[#D4AF37]/60 shadow-[0_4px_16px_rgba(212,175,55,0.2)]'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-[0_4px_16px_rgba(16,185,129,0.25)]'
                : isSophisticatedDark
                ? 'text-slate-400 hover:text-[#D4AF37] hover:bg-white/5'
                : isGold
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="HD Voice & Video Calls"
          >
            <PhoneCall className="w-5 h-5 transition-transform group-hover:scale-110" />
            {missedCallsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-sm">
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
                ? isSophisticatedDark
                  ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white shadow-[0_4px_20px_rgba(212,175,55,0.35)] border border-[#FFDF73]/40'
                  : isGold
                  ? 'bg-gradient-to-br from-[#FFF9E6] to-[#FEF3C7] text-[#996515] border border-[#D4AF37]/60 shadow-[0_4px_16px_rgba(212,175,55,0.2)]'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-[0_4px_16px_rgba(16,185,129,0.25)]'
                : isSophisticatedDark
                ? 'text-slate-400 hover:text-[#D4AF37] hover:bg-white/5'
                : isGold
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
            title="Settings & Privacy"
          >
            <Settings className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
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
          title={`${currentUser.name} (${currentUser.handle})`}
        >
          <div className="w-11 h-11 rounded-full border-2 border-[#D4AF37] p-0.5 transition-transform group-hover:scale-105">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${
              statusColors[currentUser.status]
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
