import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Users,
  Check,
  CheckCheck,
  Pin,
  Mic,
  Image as ImageIcon,
  Code,
  FileText,
  Clock,
  Sparkles,
  VolumeX,
  Archive,
  Star,
  Radio,
  Flame,
  X,
  Shield,
  Eye,
} from 'lucide-react';
import { Chat, Story, ThemeMode, UserProfile } from '../types';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  stories: Story[];
  onOpenStory: (storyId: string) => void;
  onCreateStory: () => void;
  onOpenNewChatModal: () => void;
  onOpenNewGroupModal: () => void;
  theme: ThemeMode;
  currentUser: UserProfile;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: 'all' | 'unread' | 'groups' | 'direct' | 'starred' | 'archived';
  setFilterCategory: (cat: 'all' | 'unread' | 'groups' | 'direct' | 'starred' | 'archived') => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  stories,
  onOpenStory,
  onCreateStory,
  onOpenNewChatModal,
  onOpenNewGroupModal,
  theme,
  currentUser,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  // Group stories by user to avoid duplicate avatar rings
  const userStories = useMemo(() => {
    const map = new Map<string, Story>();
    stories.forEach((s) => {
      if (!map.has(s.userId)) {
        map.set(s.userId, s);
      }
    });
    return Array.from(map.values());
  }, [stories]);

  // Filtered chat list
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesSearch =
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.lastMessage?.text &&
          chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (chat.handle && chat.handle.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterCategory === 'unread') return (chat.unreadCount || 0) > 0;
      if (filterCategory === 'groups') return chat.type === 'group';
      if (filterCategory === 'direct') return chat.type === 'direct';
      if (filterCategory === 'archived') return chat.isArchived;
      if (filterCategory === 'starred') return chat.lastMessage?.isStarred;

      return !chat.isArchived;
    });
  }, [chats, searchQuery, filterCategory]);

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      id="glasschat-chat-list-panel"
      className={`flex flex-col h-full w-full md:w-96 lg:w-104 border-r transition-all duration-300 select-none ${
        isSophisticatedDark
          ? 'bg-[#121417]/95 border-[#D4AF37]/20 backdrop-blur-2xl text-slate-100'
          : isGold
          ? 'bg-white/80 border-[#D4AF37]/25 backdrop-blur-xl text-slate-900'
          : 'bg-[#0B0D0E]/85 border-emerald-500/20 backdrop-blur-xl text-slate-100'
      }`}
    >
      {/* Header with Title & Action Icons */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h1
              className={`text-2xl font-extrabold tracking-tight font-display ${
                isSophisticatedDark || isGold ? 'gold-text-gradient' : 'emerald-text-gradient'
              }`}
            >
              GlassChat
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isSophisticatedDark
                  ? 'bg-[#1A1D23] text-[#D4AF37] border-[#D4AF37]/40 shadow-sm'
                  : isGold
                  ? 'bg-amber-50 text-[#AA820A] border-[#D4AF37]/40'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              }`}
            >
              PRO
            </span>
          </div>

          {/* Action Buttons: New Chat / Group Dropdown */}
          <div className="relative">
            <button
              id="new-chat-dropdown-toggle"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className={`p-2 rounded-2xl transition-all shadow-md ${
                isSophisticatedDark
                  ? 'bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-white hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)]'
                  : isGold
                  ? 'bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] text-slate-950 hover:shadow-[0_4px_16px_rgba(212,175,55,0.4)]'
                  : 'bg-gradient-to-tr from-emerald-500 to-lime-400 text-slate-950 hover:shadow-[0_4px_16px_rgba(16,185,129,0.4)]'
              }`}
              title="New Conversation"
            >
              <Plus className="w-4 h-4 font-bold" />
            </button>

            {/* Quick Menu Popover */}
            {showQuickMenu && (
              <div
                className={`absolute right-0 top-11 w-48 rounded-2xl p-2 z-50 shadow-2xl border ${
                  isSophisticatedDark
                    ? 'bg-[#1A1D23]/98 border-[#D4AF37]/40 text-slate-100'
                    : isGold
                    ? 'bg-white/95 border-[#D4AF37]/40 text-slate-800'
                    : 'bg-[#14181B]/95 border-emerald-500/30 text-slate-100'
                } backdrop-blur-2xl animate-in fade-in duration-150`}
              >
                <button
                  id="action-new-direct-chat"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewChatModal();
                  }}
                  className={`flex items-center space-x-2.5 w-full p-2.5 text-sm rounded-xl text-left transition-colors ${
                    isSophisticatedDark
                      ? 'hover:bg-white/10 text-slate-200'
                      : isGold
                      ? 'hover:bg-amber-50'
                      : 'hover:bg-emerald-950/60'
                  }`}
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  <span>New Message</span>
                </button>

                <button
                  id="action-new-group"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewGroupModal();
                  }}
                  className={`flex items-center space-x-2.5 w-full p-2.5 text-sm rounded-xl text-left transition-colors ${
                    isSophisticatedDark
                      ? 'hover:bg-white/10 text-slate-200'
                      : isGold
                      ? 'hover:bg-amber-50'
                      : 'hover:bg-emerald-950/60'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <span>New Group</span>
                </button>

                <button
                  id="action-create-story-menu"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onCreateStory();
                  }}
                  className={`flex items-center space-x-2.5 w-full p-2.5 text-sm rounded-xl text-left transition-colors ${
                    isSophisticatedDark
                      ? 'hover:bg-white/10 text-slate-200'
                      : isGold
                      ? 'hover:bg-amber-50'
                      : 'hover:bg-emerald-950/60'
                  }`}
                >
                  <Radio className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add 24h Status</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar with clear button */}
        <div className="relative mb-3">
          <Search
            className={`absolute left-3.5 top-3 w-4 h-4 ${
              isSophisticatedDark || isGold ? 'text-[#D4AF37]' : 'text-emerald-400/70'
            }`}
          />
          <input
            id="chat-search-input"
            type="text"
            placeholder="Search chats, messages, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-9 py-2.5 text-sm rounded-2xl outline-none transition-all border ${
              isSophisticatedDark
                ? 'bg-[#1A1D23] border-[#D4AF37]/25 text-slate-100 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30'
                : isGold
                ? 'bg-white/80 border-[#D4AF37]/30 text-slate-800 placeholder-slate-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                : 'bg-[#14181B]/80 border-emerald-500/25 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 24-Hour Stories / Status Carousel */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-semibold mb-2 px-1">
            <span className={isSophisticatedDark ? 'text-slate-400 font-medium' : isGold ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>
              24h Stories & Status
            </span>
            <button
              onClick={onCreateStory}
              className={`text-[11px] font-bold ${
                isSophisticatedDark || isGold ? 'text-[#D4AF37] hover:underline' : 'text-emerald-400 hover:underline'
              }`}
            >
              + Add Update
            </button>
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-1.5 scrollbar-none">
            {/* Current User Add Story Ring */}
            <div
              onClick={onCreateStory}
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-13 h-13 rounded-2xl border-2 border-dashed border-[#D4AF37] p-0.5 group-hover:scale-105 transition-transform">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-white rounded-full p-0.5 border border-slate-900 shadow-sm">
                  <Plus className="w-3 h-3 font-bold" />
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 max-w-[56px] truncate">
                Your Status
              </span>
            </div>

            {/* Contact Stories Rings */}
            {userStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onOpenStory(story.id)}
                className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  <div
                    className={`p-0.5 rounded-2xl bg-gradient-to-tr ${
                      isSophisticatedDark
                        ? 'from-[#B8860B] via-[#D4AF37] to-[#FFDF73] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                        : isGold
                        ? 'from-[#B8860B] via-[#D4AF37] to-[#FFD700] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                        : 'from-emerald-600 via-emerald-400 to-lime-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    } group-hover:scale-105 transition-transform`}
                  >
                    <img
                      src={story.userAvatar}
                      alt={story.userName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-[14px] object-cover border border-white/20"
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFDF73]" />
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-300 max-w-[56px] truncate">
                  {story.userName.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Categories Horizontal Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { id: 'all', label: 'All Chats' },
              { id: 'unread', label: 'Unread' },
              { id: 'groups', label: 'Groups' },
              { id: 'direct', label: 'Direct' },
              { id: 'starred', label: 'Starred' },
              { id: 'archived', label: 'Archived' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? isSophisticatedDark
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-bold shadow-[0_2px_12px_rgba(212,175,55,0.35)]'
                    : isGold
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#E6C665] text-slate-950 font-bold shadow-[0_2px_10px_rgba(212,175,55,0.3)]'
                    : 'bg-emerald-500 text-slate-950 font-bold shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
                  : isSophisticatedDark
                  ? 'bg-[#1A1D23] text-slate-400 hover:text-slate-200 border border-white/5'
                  : isGold
                  ? 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List Items Scroll Container */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5 py-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <Sparkles className="w-8 h-8 text-[#D4AF37]/60 mb-2 animate-pulse" />
            <p className="text-sm font-semibold text-slate-300">
              No conversations found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tap the <span className="font-bold text-[#D4AF37]">+ button</span> to start a new
              chat or create a group!
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const lastMsg = chat.lastMessage;
            const isOnline = chat.participants.some(
              (p) => p.id !== currentUser.id && p.status === 'online'
            );

            return (
              <div
                key={chat.id}
                id={`chat-item-${chat.id}`}
                onClick={() => onSelectChat(chat.id)}
                className={`relative flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 group border ${
                  isActive
                    ? isSophisticatedDark
                      ? 'bg-gradient-to-r from-[#1C2027] to-[#252B34] border-[#D4AF37]/45 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                      : isGold
                      ? 'bg-gradient-to-r from-amber-100/90 via-amber-50/95 to-white border-[#D4AF37]/60 shadow-[0_4px_20px_rgba(212,175,55,0.18)]'
                      : 'bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-slate-900 border-emerald-500/50 shadow-[0_4px_20px_rgba(16,185,129,0.18)]'
                    : isSophisticatedDark
                    ? 'bg-[#16191E]/60 hover:bg-[#1C2027] border-transparent hover:border-[#D4AF37]/20 shadow-xs'
                    : isGold
                    ? 'bg-white/40 hover:bg-white/90 border-transparent hover:border-[#D4AF37]/30 hover:shadow-md'
                    : 'bg-[#121619]/40 hover:bg-[#14181B] border-transparent hover:border-emerald-500/25 hover:shadow-md'
                }`}
              >
                {/* Avatar with Online Badge or Group Ring */}
                <div className="relative flex-shrink-0 mr-3">
                  <div className={`rounded-2xl ${isActive || isSophisticatedDark ? 'p-0.5 border border-[#D4AF37]/40' : ''}`}>
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-[14px] object-cover ring-1 ring-black/10"
                    />
                  </div>
                  {chat.type === 'direct' && isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#121417]" />
                  )}
                  {chat.type === 'group' && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 text-[#FFDF73] ring-1 ring-[#D4AF37]/40">
                      <Users className="w-3 h-3" />
                    </span>
                  )}
                  {chat.id === 'chat-ai' && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-white ring-1 ring-white/20">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Content: Name, Last Message, Ticks, Timestamps */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <h3
                        className={`text-sm font-bold truncate ${
                          isActive
                            ? isSophisticatedDark
                              ? 'text-[#FFDF73]'
                              : isGold
                              ? 'text-[#8B5E05]'
                              : 'text-emerald-300'
                            : isSophisticatedDark
                            ? 'text-slate-100'
                            : isGold
                            ? 'text-slate-900'
                            : 'text-slate-100'
                        }`}
                      >
                        {chat.name}
                      </h3>
                      {chat.isIncognito && (
                        <Shield className="w-3 h-3 text-rose-500 flex-shrink-0" title="Incognito Chat" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
                      {formatMessageTime(lastMsg?.timestamp || chat.createdAt)}
                    </span>
                  </div>

                  {/* Last message row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 truncate text-slate-400">
                      {/* Checkmarks if sent by current user */}
                      {lastMsg?.senderId === currentUser.id && (
                        <span className="flex-shrink-0 mr-0.5">
                          {lastMsg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          ) : lastMsg.status === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </span>
                      )}

                      {/* Icon for media type */}
                      {lastMsg?.type === 'voice' && (
                        <Mic className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      )}
                      {lastMsg?.type === 'image' && (
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      )}
                      {lastMsg?.type === 'code' && (
                        <Code className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      )}
                      {lastMsg?.type === 'document' && (
                        <FileText className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      )}

                      {/* Ghost Timer Pill */}
                      {lastMsg?.ghostTimer && (
                        <span className="flex items-center text-[10px] text-amber-400 bg-amber-950/60 px-1 rounded flex-shrink-0 border border-amber-500/30">
                          <Clock className="w-2.5 h-2.5 mr-0.5" />
                          {lastMsg.ghostTimer >= 3600
                            ? `${lastMsg.ghostTimer / 3600}h`
                            : `${lastMsg.ghostTimer}s`}
                        </span>
                      )}

                      {/* Message preview text or typing indicator */}
                      {chat.typingUsers && chat.typingUsers.length > 0 ? (
                        <span className="text-[#D4AF37] font-semibold italic animate-pulse">
                          {chat.typingUsers[0]} is typing...
                        </span>
                      ) : chat.recordingUsers && chat.recordingUsers.length > 0 ? (
                        <span className="text-rose-400 font-semibold italic flex items-center">
                          <Mic className="w-3 h-3 mr-1 animate-pulse" /> recording audio...
                        </span>
                      ) : (
                        <span className="truncate">
                          {lastMsg?.type === 'voice'
                            ? `Voice note (${lastMsg.voiceData?.duration || 10}s)`
                            : lastMsg?.text || (lastMsg?.type ? `[${lastMsg.type}]` : 'Tap to start conversation')}
                        </span>
                      )}
                    </div>

                    {/* Unread badge & Pin icon */}
                    <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                      {chat.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-[#D4AF37] transform rotate-45" />
                      )}
                      {chat.isMuted && <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                      {(chat.unreadCount || 0) > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-1.5 text-[11px] font-extrabold text-white shadow-sm">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
