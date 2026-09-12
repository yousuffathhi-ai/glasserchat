import React, { useState } from 'react';
import {
  Users,
  Plus,
  ChevronRight,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';
import { ThemeMode, UserProfile } from '../types';

interface Community {
  id: string;
  name: string;
  avatar: string;
  description: string;
  membersCount: number;
  groups: {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unreadCount?: number;
    isAnnouncement?: boolean;
  }[];
}

interface CommunitiesViewProps {
  currentUser?: UserProfile | null;
  theme: ThemeMode;
  onOpenNewChatModal?: () => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  currentUser,
  theme,
  onOpenNewChatModal,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';

  const [communities, setCommunities] = useState<Community[]>([
    {
      id: 'comm-1',
      name: 'Glasser Tech & AI Circle',
      avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
      description: 'Official developer community for GlasserChat, WebRTC, and AI agents.',
      membersCount: 1420,
      groups: [
        {
          id: 'grp-1',
          name: '📢 Announcements',
          lastMessage: 'GlasserChat v2.0 released with IMO messaging & WhatsApp layout!',
          time: '10:45 AM',
          unreadCount: 3,
          isAnnouncement: true,
        },
        {
          id: 'grp-2',
          name: '💬 General Tech Discussion',
          lastMessage: 'Alex: PeerJS WebRTC ICE connection speeds are incredibly low latency.',
          time: '09:30 AM',
          unreadCount: 5,
        },
        {
          id: 'grp-3',
          name: '⚡ WebRTC & Live Audio Devs',
          lastMessage: 'Sarah: Noise cancellation filter sample rate updated to 48kHz.',
          time: 'Yesterday',
        },
      ],
    },
    {
      id: 'comm-2',
      name: 'Designers & UI Craftsmen',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
      description: 'Creative hub for modern glassmorphism, typography, and mobile UX.',
      membersCount: 890,
      groups: [
        {
          id: 'grp-4',
          name: '📢 Community Showcase',
          lastMessage: 'New IMO rounded bubble and fluid layout guidelines posted.',
          time: '11:15 AM',
          isAnnouncement: true,
        },
        {
          id: 'grp-5',
          name: '🎨 Glassmorphic Assets & CSS',
          lastMessage: 'Elena: Shared the backdrop-blur and border token palette.',
          time: 'Yesterday',
          unreadCount: 2,
        },
      ],
    },
    {
      id: 'comm-3',
      name: 'Family & Friends Network',
      avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&auto=format&fit=crop&q=80',
      description: 'Private encrypted circle for family gatherings and weekend events.',
      membersCount: 24,
      groups: [
        {
          id: 'grp-6',
          name: '📢 Family Announcements',
          lastMessage: 'Dad 🔨: Weekend BBQ at our place this Saturday at 5 PM!',
          time: 'Yesterday',
          isAnnouncement: true,
        },
        {
          id: 'grp-7',
          name: '📸 Memories & Photo Sharing',
          lastMessage: 'Mom ❤️: Uploaded photos from our beach trip.',
          time: '2 days ago',
        },
      ],
    },
  ]);

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const newCommunity: Community = {
      id: `comm-${Date.now()}`,
      name: newCommName.trim(),
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      description: newCommDesc.trim() || 'Active GlasserChat community.',
      membersCount: 1,
      groups: [
        {
          id: `grp-${Date.now()}-1`,
          name: '📢 Announcements',
          lastMessage: 'Community created by ' + (currentUser?.name || 'You'),
          time: 'Just now',
          isAnnouncement: true,
        },
        {
          id: `grp-${Date.now()}-2`,
          name: '💬 General Chat',
          lastMessage: 'Welcome to the community! Say hello 👋',
          time: 'Just now',
        },
      ],
    };

    setCommunities([newCommunity, ...communities]);
    setNewCommName('');
    setNewCommDesc('');
    setShowCreateModal(false);
  };

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      id="communities-view-container"
      className={`flex flex-col h-full w-full overflow-y-auto ${
        isSophisticatedDark
          ? 'bg-[#0E1013] text-slate-100'
          : isGold
          ? 'bg-amber-50/40 text-slate-900'
          : 'bg-[#0B0D0E] text-slate-100'
      }`}
    >
      {/* Top Header */}
      <div
        className={`sticky top-0 z-20 px-4 py-3.5 flex items-center justify-between border-b backdrop-blur-xl ${
          isSophisticatedDark
            ? 'bg-[#0E1013]/90 border-white/10'
            : isGold
            ? 'bg-white/90 border-[#D4AF37]/30'
            : 'bg-[#0E1013]/90 border-emerald-500/20'
        }`}
      >
        <h1 className="text-xl font-bold tracking-tight">Communities</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Community</span>
        </button>
      </div>

      {/* Intro Banner */}
      <div className="p-4">
        <div
          className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
            isSophisticatedDark
              ? 'bg-[#15181E] border-white/10 text-slate-200'
              : isGold
              ? 'bg-white border-[#D4AF37]/30 text-slate-800 shadow-sm'
              : 'bg-[#13161A] border-emerald-500/20 text-slate-200'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Stay connected with a community</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Communities bring members together in topic-based groups, and make it easy to get admin
              announcements across multiple chat rooms.
            </p>
          </div>
        </div>
      </div>

      {/* New Community Quick Action Card */}
      <div className="px-4 pb-3">
        <button
          id="btn-create-community-card"
          onClick={() => setShowCreateModal(true)}
          className={`w-full flex items-center space-x-3.5 p-3 rounded-2xl transition-all border ${
            isSophisticatedDark
              ? 'bg-[#15181E] hover:bg-[#1C2028] border-white/5'
              : isGold
              ? 'bg-white hover:bg-amber-50/80 border-[#D4AF37]/20 shadow-sm'
              : 'bg-[#13161A] hover:bg-[#181D22] border-white/5'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <span className="text-sm font-bold block">New community</span>
            <span className="text-xs text-slate-400">Create a place for your organization or circle</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Communities List */}
      <div className="px-4 pb-20 space-y-4">
        {filteredCommunities.map((community) => (
          <div
            key={community.id}
            className={`rounded-2xl border overflow-hidden ${
              isSophisticatedDark
                ? 'bg-[#15181E] border-white/10'
                : isGold
                ? 'bg-white border-[#D4AF37]/30 shadow-sm'
                : 'bg-[#13161A] border-white/10'
            }`}
          >
            {/* Community Header */}
            <div className="p-3.5 flex items-center space-x-3 border-b border-black/10 dark:border-white/5">
              <img
                src={community.avatar}
                alt={community.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate">{community.name}</h3>
                <p className="text-[11px] text-slate-400 truncate">
                  {community.membersCount} members • {community.description}
                </p>
              </div>
            </div>

            {/* Sub-groups inside community */}
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {community.groups.map((group) => (
                <div
                  key={group.id}
                  className="p-3.5 flex items-center space-x-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    {group.isAnnouncement ? (
                      <Megaphone className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold truncate text-slate-200">
                        {group.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{group.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{group.lastMessage}</p>
                  </div>
                  {group.unreadCount && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      {group.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-3xl p-5 border shadow-2xl ${
              isSophisticatedDark
                ? 'bg-[#1A1D23] border-white/10 text-slate-100'
                : isGold
                ? 'bg-white border-[#D4AF37]/40 text-slate-900'
                : 'bg-[#14181B] border-emerald-500/30 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Create New Community</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCommunity} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Enthusiasts, Neighborhood Club"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/20 border border-white/10 focus:border-emerald-500 outline-none"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  placeholder="What is this community for?"
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-black/20 border border-white/10 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                >
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
