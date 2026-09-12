import React, { useState } from 'react';
import {
  Plus,
  Camera,
  PenLine,
  Eye,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Bell,
  Search,
} from 'lucide-react';
import { Story, UserProfile, Contact, ThemeMode } from '../types';

interface Channel {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  followers: string;
  recentPost: string;
  time: string;
  isFollowing: boolean;
  category: string;
}

interface UpdatesViewProps {
  stories: Story[];
  currentUser?: UserProfile | null;
  contacts: Contact[];
  theme: ThemeMode;
  onOpenStory: (storyId: string) => void;
  onCreateStory: () => void;
}

export const UpdatesView: React.FC<UpdatesViewProps> = ({
  stories,
  currentUser,
  contacts,
  theme,
  onOpenStory,
  onCreateStory,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';

  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'ch-1',
      name: 'GlasserChat Official',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      followers: '2.4M',
      recentPost: '🎉 Welcome to GlasserChat 2.0! Enjoy IMO-style messaging bubbles & WhatsApp navigation dashboard.',
      time: '10:30 AM',
      isFollowing: true,
      category: 'Official',
    },
    {
      id: 'ch-2',
      name: 'TechRadar Daily',
      avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
      verified: true,
      followers: '890K',
      recentPost: '⚡ The evolution of WebRTC audio engines: 48kHz spatial audio is now standard in mobile PWAs.',
      time: '08:15 AM',
      isFollowing: false,
      category: 'Technology',
    },
    {
      id: 'ch-3',
      name: 'Global Insights 24/7',
      avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
      verified: true,
      followers: '1.5M',
      recentPost: '🌍 Space exploration milestones: New deep space optical communication sets data transmission records.',
      time: 'Yesterday',
      isFollowing: false,
      category: 'News',
    },
    {
      id: 'ch-4',
      name: 'Daily Motivation & Quotes',
      avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=80',
      verified: false,
      followers: '640K',
      recentPost: '✨ "Craftsmanship is not an accident. It is always the result of high intention and sincere effort."',
      time: 'Yesterday',
      isFollowing: true,
      category: 'Lifestyle',
    },
  ]);

  const [showViewedUpdates, setShowViewedUpdates] = useState(false);

  // Group stories
  const myStories = currentUser ? stories.filter((s) => s.userId === currentUser.id) : [];
  const contactStories = currentUser ? stories.filter((s) => s.userId !== currentUser.id) : stories;

  const recentStories = currentUser
    ? contactStories.filter((s) => !s.viewedBy?.includes(currentUser.id))
    : contactStories;
  const viewedStories = currentUser
    ? contactStories.filter((s) => s.viewedBy?.includes(currentUser.id))
    : [];

  const toggleFollowChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === id ? { ...ch, isFollowing: !ch.isFollowing } : ch
      )
    );
  };

  return (
    <div
      id="updates-view-container"
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
        <h1 className="text-xl font-bold tracking-tight">Updates</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={onCreateStory}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            title="Create Status"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* SECTION 1: STATUS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Status
            </h2>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>End-to-end encrypted</span>
            </div>
          </div>

          {/* My Status Card */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isSophisticatedDark
                ? 'bg-[#15181E] border-white/10'
                : isGold
                ? 'bg-white border-[#D4AF37]/30 shadow-sm'
                : 'bg-[#13161A] border-emerald-500/20'
            }`}
          >
            <div
              className="flex items-center space-x-3.5 cursor-pointer flex-1 min-w-0"
              onClick={() => {
                if (myStories.length > 0) {
                  onOpenStory(myStories[0].id);
                } else {
                  onCreateStory();
                }
              }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'}
                  alt={currentUser?.name || 'My Status'}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateStory();
                  }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md ring-2 ring-[#0E1013]"
                  title="Add update"
                >
                  <Plus className="w-3.5 h-3.5 font-bold" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-100 truncate">My status</h3>
                <p className="text-xs text-slate-400 truncate">
                  {myStories.length > 0
                    ? `${myStories.length} active updates • Tap to view`
                    : 'Tap to add status update'}
                </p>
              </div>
            </div>

            {/* Quick Action buttons for My Status */}
            <div className="flex items-center space-x-1.5 pl-2">
              <button
                onClick={onCreateStory}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                title="Add status update"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Recent Updates */}
          {recentStories.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-400 mb-2.5">Recent updates</h3>
              <div className="space-y-2">
                {recentStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => onOpenStory(story.id)}
                    className="flex items-center space-x-3.5 p-2.5 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-400 to-lime-400 ring-2 ring-emerald-400/40">
                      <img
                        src={story.userAvatar}
                        alt={story.userName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-[14px] object-cover border border-white/20"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate text-slate-100">
                        {story.userName}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Today, {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Viewed Updates (Collapsible) */}
          {viewedStories.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowViewedUpdates(!showViewedUpdates)}
                className="flex items-center justify-between w-full py-1 text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                <span>Viewed updates ({viewedStories.length})</span>
                {showViewedUpdates ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showViewedUpdates && (
                <div className="space-y-2 mt-2">
                  {viewedStories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => onOpenStory(story.id)}
                      className="flex items-center space-x-3.5 p-2.5 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors opacity-75"
                    >
                      <div className="p-0.5 rounded-2xl border-2 border-slate-600">
                        <img
                          src={story.userAvatar}
                          alt={story.userName}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-[14px] object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate text-slate-300">
                          {story.userName}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Viewed • {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: CHANNELS */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Channels
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Stay updated on topics you care about
              </p>
            </div>
            <button className="text-xs font-bold text-emerald-400 hover:underline">
              Explore
            </button>
          </div>

          <div className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSophisticatedDark
                    ? 'bg-[#15181E] border-white/10'
                    : isGold
                    ? 'bg-white border-[#D4AF37]/30 shadow-sm'
                    : 'bg-[#13161A] border-emerald-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={channel.avatar}
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-sm font-bold text-slate-100 truncate">
                          {channel.name}
                        </h4>
                        {channel.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {channel.followers} followers • {channel.category}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollowChannel(channel.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      channel.isFollowing
                        ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {channel.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed pl-13">
                  {channel.recentPost}
                </p>
                <span className="text-[10px] text-slate-500 block text-right mt-1">
                  {channel.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
