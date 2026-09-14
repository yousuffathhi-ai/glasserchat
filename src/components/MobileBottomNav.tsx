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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pt-2 pb-safe border-t border-[#00F0FF]/30 bg-[rgba(15,20,32,0.85)] backdrop-blur-2xl shadow-[0_-10px_35px_rgba(0,122,255,0.2),0_-1px_15px_rgba(138,43,226,0.15)] transition-all duration-300 text-white"
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
                  ? 'text-[#FFD700] font-bold'
                  : 'text-white/60 hover:text-[#00F0FF]'
              }`}
            >
              {/* Icon Container with active pill highlight */}
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FFD700]/20 via-[#FF007F]/20 to-[#8A2BE2]/20 border border-[#FFD700]/60 shadow-[0_0_16px_rgba(255,215,0,0.45)] text-[#FFD700] scale-105'
                    : 'group-hover:bg-white/5 group-hover:text-[#00F0FF] group-active:scale-95'
                }`}
              >
                {tab.icon}

                {/* Number Badge */}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FFD700] text-slate-950 px-1 text-[9px] font-extrabold shadow-md">
                    {tab.badge}
                  </span>
                ) : null}

                {/* Dot Badge */}
                {tab.hasDot ? (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F0FF]"></span>
                  </span>
                ) : null}
              </div>

              {/* Label */}
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                isActive ? 'text-[#FFD700] font-bold drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]' : 'text-white/60 group-hover:text-[#00F0FF]'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
