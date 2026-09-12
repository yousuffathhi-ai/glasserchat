import React from 'react';
import { MessageSquare, Radio, PhoneCall, Users, Settings, Globe } from 'lucide-react';
import { NavigationTab, ThemeMode } from '../types';

interface MobileBottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  theme: ThemeMode;
  unreadTotalCount?: number;
  missedCallsCount?: number;
  unviewedStoriesCount?: number;
  hidden?: boolean; // When in an active chat on mobile, hide the bottom bar
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  theme,
  unreadTotalCount = 0,
  missedCallsCount = 0,
  unviewedStoriesCount = 0,
  hidden = false,
}) => {
  if (hidden) return null;

  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number; hasDot?: boolean }[] = [
    {
      id: 'chats',
      label: 'Chats',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadTotalCount,
    },
    {
      id: 'updates',
      label: 'Updates',
      icon: <Radio className="w-5 h-5" />,
      hasDot: unviewedStoriesCount > 0,
    },
    {
      id: 'communities',
      label: 'Communities',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'calls',
      label: 'Calls',
      icon: <PhoneCall className="w-5 h-5" />,
      badge: missedCallsCount,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pt-2 pb-safe border-t backdrop-blur-2xl transition-all duration-300 ${
        isSophisticatedDark
          ? 'bg-[#0E1013]/92 border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.7)] text-slate-400'
          : isGold
          ? 'bg-white/90 border-[#D4AF37]/30 shadow-[0_-4px_24px_rgba(212,175,55,0.12)] text-slate-500'
          : 'bg-[#09110F]/95 border-emerald-500/20 shadow-[0_-8px_32px_rgba(0,0,0,0.6)] text-slate-400'
      }`}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? isSophisticatedDark
                    ? 'text-[#D4AF37] font-semibold'
                    : isGold
                    ? 'text-[#996515] font-semibold'
                    : 'text-emerald-400 font-semibold'
                  : 'hover:text-slate-200 text-slate-400'
              }`}
            >
              {/* Icon Container with active pill highlight */}
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isSophisticatedDark
                      ? 'bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/40 shadow-[0_0_12px_rgba(212,175,55,0.25)] scale-105'
                      : isGold
                      ? 'bg-[#FEF3C7] ring-1 ring-[#D4AF37]/50 shadow-sm scale-105'
                      : 'bg-emerald-500/15 ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)] scale-105'
                    : 'group-active:scale-95'
                }`}
              >
                {tab.icon}

                {/* Number Badge */}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D4AF37] text-slate-950 px-1 text-[9px] font-extrabold shadow-md">
                    {tab.badge}
                  </span>
                ) : null}

                {/* Dot Badge */}
                {tab.hasDot ? (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                ) : null}
              </div>

              {/* Label */}
              <span className="text-[10px] tracking-tight mt-0.5 transition-colors">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
