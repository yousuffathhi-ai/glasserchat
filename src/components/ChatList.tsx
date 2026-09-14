import React, { useState, useMemo, useEffect } from 'react';
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
  Camera,
  MoreVertical,
  Download,
  MessageSquarePlus,
} from 'lucide-react';
import { Chat, Story, ThemeMode, UserProfile } from '../types';
import { isPWAInstalled, triggerPWAInstall, hasDeferredPrompt, subscribeInstallState } from '../utils/pwa';
import { ConvoSphereLogo } from './common/ConvoSphereLogo';

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
  currentUser?: UserProfile | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: 'all' | 'unread' | 'groups' | 'direct' | 'starred' | 'archived';
  setFilterCategory: (cat: 'all' | 'unread' | 'groups' | 'direct' | 'starred' | 'archived') => void;
  onOpenPWAInstallModal?: () => void;
  onSelectTab?: (tab: any) => void;
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
  onOpenPWAInstallModal,
  onSelectTab,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [canInstall, setCanInstall] = useState<boolean>(!isPWAInstalled());

  useEffect(() => {
    const unsubscribe = subscribeInstallState((available) => {
      setCanInstall(!isPWAInstalled() && (available || hasDeferredPrompt()));
    });
    return () => unsubscribe();
  }, []);

  const handleInstallClick = async () => {
    if (hasDeferredPrompt()) {
      const outcome = await triggerPWAInstall();
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
    } else if (onOpenPWAInstallModal) {
      onOpenPWAInstallModal();
    }
  };

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
      className={`${
        activeChatId ? 'hidden md:flex' : 'flex'
      } flex-col h-full w-full md:w-96 lg:w-104 border-r border-[#00F0FF]/25 bg-[rgba(15,20,32,0.85)] backdrop-blur-2xl text-white transition-all duration-300 select-none relative`}
    >
      {/* Top Header Bar: ConvoSphere Branding, Install App, Camera, Search, Menu Dots */}
      <div className="px-4 py-3 border-b border-[#00F0FF]/20 bg-[rgba(15,20,32,0.95)] flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2.5">
          <ConvoSphereLogo size="sm" withGlow={true} withRings={true} />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-1.5">
              ConvoSphere
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40">
                PRO
              </span>
            </h1>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Prominent Install App Button (auto-hides if standalone / installed) */}
          {canInstall && (
            <button
              id="header-pwa-install-btn"
              onClick={handleInstallClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#007AFF] to-[#00F0FF] text-slate-950 text-xs font-bold transition-all shadow-md hover:opacity-90 active:scale-95"
              title="Install ConvoSphere App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          {/* Camera Icon */}
          <button
            id="header-camera-btn"
            onClick={onCreateStory}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Camera & Stories"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Menu Dots */}
          <div className="relative">
            <button
              id="header-menu-dots-btn"
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Menu Popover */}
            {showQuickMenu && (
              <div
                className="absolute right-0 top-10 w-52 rounded-2xl p-1.5 z-50 shadow-2xl border border-[#00F0FF]/30 bg-[rgba(15,20,32,0.95)] backdrop-blur-2xl text-white animate-in fade-in duration-150"
              >
                <button
                  id="menu-action-new-group"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onOpenNewGroupModal();
                  }}
                  className="flex items-center space-x-2.5 w-full p-2.5 text-xs font-medium rounded-xl text-left hover:bg-white/10 transition-colors text-white"
                >
                  <Users className="w-4 h-4 text-[#00F0FF]" />
                  <span>New group</span>
                </button>

                <button
                  id="menu-action-new-community"
                  onClick={() => {
                    setShowQuickMenu(false);
                    if (onSelectTab) onSelectTab('communities');
                  }}
                  className="flex items-center space-x-2.5 w-full p-2.5 text-xs font-medium rounded-xl text-left hover:bg-white/10 transition-colors text-white"
                >
                  <Users className="w-4 h-4 text-[#FF007F]" />
                  <span>New community</span>
                </button>

                <button
                  id="menu-action-starred"
                  onClick={() => {
                    setShowQuickMenu(false);
                    setFilterCategory('starred');
                  }}
                  className="flex items-center space-x-2.5 w-full p-2.5 text-xs font-medium rounded-xl text-left hover:bg-white/10 transition-colors text-white"
                >
                  <Star className="w-4 h-4 text-[#FFD700]" />
                  <span>Starred messages</span>
                </button>

                {canInstall && (
                  <button
                    id="menu-action-install-pwa"
                    onClick={() => {
                      setShowQuickMenu(false);
                      handleInstallClick();
                    }}
                    className="flex items-center space-x-2.5 w-full p-2.5 text-xs font-medium rounded-xl text-left hover:bg-white/10 transition-colors text-[#00F0FF]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install ConvoSphere</span>
                  </button>
                )}

                <button
                  id="menu-action-settings"
                  onClick={() => {
                    setShowQuickMenu(false);
                    if (onSelectTab) onSelectTab('settings');
                  }}
                  className="flex items-center space-x-2.5 w-full p-2.5 text-xs font-medium rounded-xl text-left hover:bg-white/10 transition-colors border-t border-white/10 mt-1 pt-2 text-white"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar with Glassmorphic Pill Filters */}
      <div className="p-3 pb-2">
        {/* Search Input */}
        <div className="relative mb-2.5">
          <Search
            className="absolute left-3.5 top-2.5 w-4 h-4 text-white/50"
          />
          <input
            id="chat-search-input"
            type="text"
            placeholder="Search conversations & messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs rounded-xl outline-none transition-all border border-[#00F0FF]/25 bg-[rgba(15,20,32,0.7)] text-white placeholder-white/50 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-white/50 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Pill Filters: All, Unread, Favourites, Groups */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'starred', label: 'Favourites' },
            { id: 'groups', label: 'Groups' },
          ].map((pill) => {
            const isSelected = filterCategory === pill.id;
            return (
              <button
                key={pill.id}
                id={`pill-filter-${pill.id}`}
                onClick={() => setFilterCategory(pill.id as any)}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF007F] to-[#8A2BE2] text-white shadow-md shadow-[#FF007F]/30 border border-white/20'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat List Items Scroll Container */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5 py-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <Sparkles className="w-8 h-8 text-[#FFD700]/60 mb-2 animate-pulse" />
            <p className="text-sm font-semibold text-white/80">
              No conversations found
            </p>
            <p className="text-xs text-white/50 mt-1">
              Tap the <span className="font-bold text-[#FFD700]">+ button</span> to start a new
              chat or create a group!
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const lastMsg = chat.lastMessage;
            const isOnline = chat.participants.some(
              (p) => p.id !== currentUser?.id && p.status === 'online'
            );

            return (
              <div
                key={chat.id}
                id={`chat-item-${chat.id}`}
                onClick={() => onSelectChat(chat.id)}
                className={`relative flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 group border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF007F]/20 via-[#8A2BE2]/20 to-[#007AFF]/20 border-[#00F0FF]/60 shadow-[0_4px_20px_rgba(0,122,255,0.25)]'
                    : 'bg-[rgba(15,20,32,0.6)] hover:bg-[rgba(25,32,50,0.7)] border-white/5 hover:border-[#00F0FF]/30 shadow-xs'
                }`}
              >
                {/* Avatar with Online Badge or Group Ring */}
                <div className="relative flex-shrink-0 mr-3">
                  <div className={`rounded-2xl ${isActive ? 'p-0.5 border-2 border-[#00F0FF]' : 'p-0.5 border border-white/10'}`}>
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-[14px] object-cover ring-1 ring-black/10"
                    />
                  </div>
                  {chat.type === 'direct' && isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00F0FF] ring-2 ring-[#0F1420]" />
                  )}
                  {chat.type === 'group' && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 text-[#FFD700] ring-1 ring-[#FFD700]/40">
                      <Users className="w-3 h-3" />
                    </span>
                  )}
                  {chat.id === 'chat-ai' && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-gradient-to-tr from-[#FF007F] to-[#007AFF] text-white ring-1 ring-white/20">
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
                          isActive ? 'text-[#00F0FF]' : 'text-white'
                        }`}
                      >
                        {chat.name}
                      </h3>
                      {chat.isIncognito && (
                        <Shield className="w-3 h-3 text-[#FF007F] flex-shrink-0" title="Incognito Chat" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-white/50 flex-shrink-0">
                      {formatMessageTime(lastMsg?.timestamp || chat.createdAt)}
                    </span>
                  </div>

                  {/* Last message row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 truncate text-white/60">
                      {/* Checkmarks if sent by current user */}
                      {Boolean(currentUser && lastMsg?.senderId === currentUser.id) && (
                        <span className="flex-shrink-0 mr-0.5">
                          {lastMsg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#FFD700]" />
                          ) : lastMsg.status === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-white/60" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-white/60" />
                          )}
                        </span>
                      )}

                      {/* Icon for media type */}
                      {lastMsg?.type === 'voice' && (
                        <Mic className="w-3.5 h-3.5 text-[#FFD700] flex-shrink-0" />
                      )}
                      {lastMsg?.type === 'image' && (
                        <ImageIcon className="w-3.5 h-3.5 text-[#00F0FF] flex-shrink-0" />
                      )}
                      {lastMsg?.type === 'code' && (
                        <Code className="w-3.5 h-3.5 text-[#8A2BE2] flex-shrink-0" />
                      )}
                      {lastMsg?.type === 'document' && (
                        <FileText className="w-3.5 h-3.5 text-[#FF007F] flex-shrink-0" />
                      )}

                      {/* Ghost Timer Pill */}
                      {lastMsg?.ghostTimer && (
                        <span className="flex items-center text-[10px] text-[#FFD700] bg-[#FFD700]/10 px-1 rounded flex-shrink-0 border border-[#FFD700]/30">
                          <Clock className="w-2.5 h-2.5 mr-0.5" />
                          {lastMsg.ghostTimer >= 3600
                            ? `${lastMsg.ghostTimer / 3600}h`
                            : `${lastMsg.ghostTimer}s`}
                        </span>
                      )}

                      {/* Message preview text or typing indicator */}
                      {chat.typingUsers && chat.typingUsers.length > 0 ? (
                        <span className="text-[#00F0FF] font-semibold italic animate-pulse">
                          {chat.typingUsers[0]} is typing...
                        </span>
                      ) : chat.recordingUsers && chat.recordingUsers.length > 0 ? (
                        <span className="text-[#FF007F] font-semibold italic flex items-center">
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
                        <Pin className="w-3.5 h-3.5 text-[#FFD700] transform rotate-45" />
                      )}
                      {chat.isMuted && <VolumeX className="w-3.5 h-3.5 text-white/40" />}
                      {(chat.unreadCount || 0) > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-[#FF007F] to-[#FFD700] px-1.5 text-[11px] font-black text-slate-950 shadow-sm">
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

      {/* Floating Action Button (FAB) */}
      <button
        id="chat-list-fab-new-chat"
        onClick={onOpenNewChatModal}
        className="absolute bottom-5 right-5 z-20 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF007F] via-[#8A2BE2] to-[#007AFF] text-white shadow-[0_4px_24px_rgba(255,0,127,0.45)] ring-2 ring-[#00F0FF]/40 flex items-center justify-center active:scale-95 transition-all hover:scale-105"
        title="New Chat"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>
    </div>
  );
};
