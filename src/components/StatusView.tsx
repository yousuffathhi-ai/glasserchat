import React, { useState } from 'react';
import {
  Plus,
  Camera,
  Edit3,
  Lock,
  Eye,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  CheckCheck,
} from 'lucide-react';
import { Story, ThemeMode, UserProfile, Contact } from '../types';

interface StatusViewProps {
  stories: Story[];
  currentUser: UserProfile;
  contacts: Contact[];
  theme: ThemeMode;
  onOpenStory: (storyId: string) => void;
  onCreateStory: () => void;
}

export const StatusView: React.FC<StatusViewProps> = ({
  stories,
  currentUser,
  contacts,
  theme,
  onOpenStory,
  onCreateStory,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  const [showViewedUpdates, setShowViewedUpdates] = useState(true);

  // Separate current user's stories from contacts' stories
  const myStories = stories.filter((s) => s.userId === currentUser.id);
  const latestMyStory = myStories[myStories.length - 1];

  // Group other stories by user
  const otherStoriesByUser = React.useMemo(() => {
    const map = new Map<
      string,
      {
        userId: string;
        userName: string;
        userAvatar: string;
        stories: Story[];
        latestStory: Story;
        hasUnviewed: boolean;
      }
    >();

    stories
      .filter((s) => s.userId !== currentUser.id)
      .forEach((s) => {
        const existing = map.get(s.userId);
        const isViewed = s.viewedBy?.includes(currentUser.id);

        if (!existing) {
          map.set(s.userId, {
            userId: s.userId,
            userName: s.userName,
            userAvatar: s.userAvatar,
            stories: [s],
            latestStory: s,
            hasUnviewed: !isViewed,
          });
        } else {
          existing.stories.push(s);
          if (new Date(s.createdAt) > new Date(existing.latestStory.createdAt)) {
            existing.latestStory = s;
          }
          if (!isViewed) {
            existing.hasUnviewed = true;
          }
        }
      });

    return Array.from(map.values());
  }, [stories, currentUser.id]);

  const recentUpdates = otherStoriesByUser.filter((u) => u.hasUnviewed);
  const viewedUpdates = otherStoriesByUser.filter((u) => !u.hasUnviewed);

  const formatStoryTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return 'Yesterday';
  };

  return (
    <div
      id="status-view-panel"
      className={`flex flex-col h-full w-full relative overflow-hidden select-none ${
        isSophisticatedDark
          ? 'bg-[#0B0D0E] text-slate-100'
          : isGold
          ? 'bg-[#FAF8F5] text-slate-900'
          : 'bg-[#080E0D] text-slate-100'
      }`}
    >
      {/* Header */}
      <header
        className={`px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl shrink-0 ${
          isSophisticatedDark
            ? 'bg-[#0E1013]/90 border-white/5'
            : isGold
            ? 'bg-white/80 border-[#D4AF37]/20'
            : 'bg-[#0B1110]/90 border-emerald-500/10'
        }`}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Status</h1>
          <p className="text-xs text-slate-400 mt-0.5">Disappears after 24 hours</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateStory}
            className={`p-2.5 rounded-full transition-all duration-200 border ${
              isSophisticatedDark
                ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                : isGold
                ? 'bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border-[#D4AF37]/30'
                : 'bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border-emerald-500/20'
            }`}
            title="Create Status"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* My Status Section */}
        <div
          id="my-status-card"
          className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between backdrop-blur-md cursor-pointer group ${
            isSophisticatedDark
              ? 'bg-[#14171C]/70 border-white/5 hover:border-[#D4AF37]/30 hover:bg-[#181C22]'
              : isGold
              ? 'bg-white/90 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 shadow-sm'
              : 'bg-[#0E1514]/70 border-emerald-500/15 hover:border-emerald-500/40'
          }`}
          onClick={() => {
            if (latestMyStory) {
              onOpenStory(latestMyStory.id);
            } else {
              onCreateStory();
            }
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={`w-14 h-14 rounded-full p-0.5 transition-transform duration-200 group-hover:scale-105 ${
                  latestMyStory
                    ? 'bg-gradient-to-tr from-[#B8860B] via-[#D4AF37] to-[#FFDF73]'
                    : 'bg-slate-700/50'
                }`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover border-2 border-[#0B0D0E]"
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateStory();
                }}
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-slate-950 shadow-md ${
                  isGold
                    ? 'bg-[#D4AF37] text-white ring-2 ring-white'
                    : 'bg-emerald-400 text-slate-950 ring-2 ring-[#0B0D0E]'
                }`}
                title="Add status update"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-semibold">My Status</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {latestMyStory
                  ? `Updated ${formatStoryTime(latestMyStory.createdAt)}`
                  : 'Tap to add status update'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateStory();
              }}
              className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                isGold
                  ? 'bg-amber-100/70 text-[#7A5B15] hover:bg-amber-200'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Recent Updates Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Updates
            </span>
            <span className="text-[11px] text-slate-500">{recentUpdates.length} available</span>
          </div>

          {recentUpdates.length === 0 ? (
            <div
              className={`p-6 rounded-2xl border text-center ${
                isSophisticatedDark
                  ? 'bg-[#111317]/50 border-white/5 text-slate-400'
                  : isGold
                  ? 'bg-white/60 border-[#D4AF37]/15 text-slate-500'
                  : 'bg-[#0A100F]/50 border-emerald-500/10 text-slate-400'
              }`}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#D4AF37]" />
              <p className="text-sm font-medium">No recent updates from contacts</p>
              <p className="text-xs text-slate-500 mt-1">
                Updates from your contacts will show here for 24 hours.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentUpdates.map((group) => (
                <div
                  key={group.userId}
                  id={`status-item-${group.userId}`}
                  onClick={() => onOpenStory(group.latestStory.id)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between backdrop-blur-md cursor-pointer group ${
                    isSophisticatedDark
                      ? 'bg-[#14171C]/60 border-white/5 hover:border-[#D4AF37]/40 hover:bg-[#181C22]'
                      : isGold
                      ? 'bg-white/80 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 shadow-sm'
                      : 'bg-[#0E1514]/60 border-emerald-500/15 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Ring Avatar */}
                    <div className="relative">
                      <div className="w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-[#10B981] via-[#06B6D4] to-[#22D3EE] shadow-[0_0_12px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-200">
                        <img
                          src={group.userAvatar}
                          alt={group.userName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover border-2 border-[#0B0D0E]"
                        />
                      </div>
                      {group.stories.length > 1 && (
                        <span className="absolute -top-1 -right-1 text-[9px] font-extrabold px-1 rounded-full bg-cyan-400 text-slate-950 ring-1 ring-white shadow-sm">
                          {group.stories.length}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">{group.userName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatStoryTime(group.latestStory.createdAt)}
                      </p>
                    </div>
                  </div>

                  {group.latestStory.type === 'image' && group.latestStory.mediaUrl && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                      <img
                        src={group.latestStory.mediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Viewed Updates Section */}
        {viewedUpdates.length > 0 && (
          <div>
            <button
              onClick={() => setShowViewedUpdates(!showViewedUpdates)}
              className="flex items-center justify-between w-full px-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-400 transition"
            >
              <span>Viewed Updates ({viewedUpdates.length})</span>
              {showViewedUpdates ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showViewedUpdates && (
              <div className="space-y-2">
                {viewedUpdates.map((group) => (
                  <div
                    key={group.userId}
                    onClick={() => onOpenStory(group.latestStory.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between opacity-75 hover:opacity-100 backdrop-blur-md cursor-pointer group ${
                      isSophisticatedDark
                        ? 'bg-[#111317]/40 border-white/5 hover:bg-[#15191F]'
                        : isGold
                        ? 'bg-white/60 border-slate-200 hover:bg-white shadow-xs'
                        : 'bg-[#0A100F]/40 border-emerald-500/10 hover:bg-[#0D1614]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-full p-0.5 bg-slate-600/50 group-hover:bg-slate-500 transition">
                        <img
                          src={group.userAvatar}
                          alt={group.userName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover border-2 border-[#0B0D0E]"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{group.userName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatStoryTime(group.latestStory.createdAt)}
                        </p>
                      </div>
                    </div>

                    <CheckCheck className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* End-to-End Encryption Notice */}
        <div className="pt-4 pb-12 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Your status updates are end-to-end encrypted</span>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col items-center gap-3 z-20">
        <button
          id="btn-create-text-status"
          onClick={onCreateStory}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border ${
            isSophisticatedDark
              ? 'bg-[#1E222A] text-slate-200 border-white/10 hover:bg-[#282D37]'
              : isGold
              ? 'bg-white text-slate-800 border-[#D4AF37]/30 shadow-md'
              : 'bg-[#131F1C] text-emerald-300 border-emerald-500/30'
          }`}
          title="Create Text Status"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          id="btn-create-camera-status"
          onClick={onCreateStory}
          className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 text-slate-950 font-bold ${
            isGold
              ? 'bg-gradient-to-tr from-[#B8860B] via-[#D4AF37] to-[#FFDF73] ring-4 ring-[#D4AF37]/20 shadow-[0_4px_20px_rgba(212,175,55,0.4)]'
              : 'bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-400 ring-4 ring-emerald-400/20 shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
          }`}
          title="Share Photo/Video Status"
        >
          <Camera className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};
