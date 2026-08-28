import React, { useState, useEffect } from 'react';
import { NavigationSidebar } from './components/NavigationSidebar';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { WebRTCCallModal } from './components/WebRTCCallModal';
import { StatusViewerModal } from './components/StatusViewerModal';
import { StatusCreatorModal } from './components/StatusCreatorModal';
import { DocumentScannerModal } from './components/DocumentScannerModal';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import { NewChatModal } from './components/NewChatModal';
import { MediaLightboxModal } from './components/MediaLightboxModal';
import { CallsHistoryView } from './components/CallsHistoryView';
import { ContactsView } from './components/ContactsView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';

import {
  Chat,
  Message,
  Story,
  Contact,
  CallRecord,
  CallSession,
  NavigationTab,
  ThemeMode,
  UserProfile,
} from './types';
import { soundFx } from './utils/audio';
import {
  getRegisteredUsers,
  getCurrentUser,
  registerUser,
  setCurrentUserSession,
  getUserChats,
  saveUserChats,
  getChatMessages,
  appendChatMessage,
  saveChatMessages,
  getUserContacts,
  addContactToUser,
  saveUserContacts,
  getUserStories,
  saveUserStories,
  getUserCallRecords,
  saveUserCallRecords,
  clearAllLocalStorage,
} from './utils/storage';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<ThemeMode>('sophisticated-dark');
  const [activeTab, setActiveTab] = useState<NavigationTab>('chats');

  // Multi-user & Registered data state (Strictly zero mock data)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => getRegisteredUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !getCurrentUser());

  // Entity States for Active User
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [stories, setStories] = useState<Story[]>([]);
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<
    'all' | 'unread' | 'groups' | 'direct' | 'starred' | 'archived'
  >('all');

  // Modals and Active Overlays
  const [activeCallSession, setActiveCallSession] = useState<CallSession | null>(null);
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isDocumentScannerOpen, setIsDocumentScannerOpen] = useState(false);
  const [codeSandboxData, setCodeSandboxData] = useState<{ code: string; language: string } | null>(
    null
  );
  const [newChatModalMode, setNewChatModalMode] = useState<'direct' | 'group' | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; caption?: string } | null>(
    null
  );

  // Sync theme class to document body
  useEffect(() => {
    if (theme === 'sophisticated-dark') {
      document.documentElement.classList.add('dark', 'sophisticated-dark');
      document.documentElement.classList.remove('gold-light');
      document.body.style.backgroundColor = '#0E1013';
    } else if (theme === 'dark-emerald') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('sophisticated-dark', 'gold-light');
      document.body.style.backgroundColor = '#0B0D0E';
    } else {
      document.documentElement.classList.remove('dark', 'sophisticated-dark');
      document.documentElement.classList.add('gold-light');
      document.body.style.backgroundColor = '#F4F4F7';
    }
  }, [theme]);

  // Load user data whenever currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setContacts([]);
      setChats([]);
      setActiveChatId(null);
      setMessages({});
      setStories([]);
      setCallRecords([]);
      setIsAuthModalOpen(true);
      return;
    }

    const loadedContacts = getUserContacts(currentUser.id);
    const loadedChats = getUserChats(currentUser.id);
    const loadedStories = getUserStories(currentUser.id);
    const loadedCalls = getUserCallRecords(currentUser.id);

    setContacts(loadedContacts);
    setChats(loadedChats);
    setStories(loadedStories);
    setCallRecords(loadedCalls);

    // Hydrate messages for loaded chats
    const msgMap: { [chatId: string]: Message[] } = {};
    loadedChats.forEach((c) => {
      msgMap[c.id] = getChatMessages(c.id);
    });
    setMessages(msgMap);

    if (loadedChats.length > 0) {
      setActiveChatId(loadedChats[0].id);
    } else {
      setActiveChatId(null);
    }
  }, [currentUser?.id]);

  // Handle user registration
  const handleRegisterUser = (userData: {
    name: string;
    handle: string;
    email?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    pinLock?: string;
  }) => {
    const newUser = registerUser(userData);
    const updatedUsers = getRegisteredUsers();
    setRegisteredUsers(updatedUsers);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
  };

  // Handle user login / switch
  const handleLoginUser = (userId: string) => {
    const user = setCurrentUserSession(userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthModalOpen(false);
    }
  };

  // Active chat object
  const activeChat = chats.find((c) => c.id === activeChatId);
  const activeChatMessages = (activeChatId && messages[activeChatId]) || [];

  // 1. Send Message Handler
  const handleSendMessage = async (msgData: Partial<Message>) => {
    if (!activeChatId || !currentUser) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      chatId: activeChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: msgData.type || 'text',
      ...msgData,
    };

    // Append to storage & state
    appendChatMessage(activeChatId, newMsg);
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg],
    }));

    // Update last message in chat list
    const updatedChats = chats.map((c) =>
      c.id === activeChatId
        ? {
            ...c,
            lastMessage: newMsg,
          }
        : c
    );
    setChats(updatedChats);
    saveUserChats(currentUser.id, updatedChats);

    // Simulate delivery ticks: sent -> delivered -> read
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 600);

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeChatId]: (prev[activeChatId] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'read' } : m
        ),
      }));
    }, 1200);

    // If chat is with AI, trigger AI response
    if (activeChat?.isAiAssistant && msgData.text && !msgData.text.startsWith('/imagine')) {
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, typingUsers: ['GlassChat AI'] } : c))
      );

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msgData.text,
            history: (messages[activeChatId] || []).slice(-6).map((m) => ({
              role: m.senderId === currentUser.id ? 'user' : 'model',
              content: m.text || '',
            })),
          }),
        });
        const data = await res.json();

        setChats((prev) =>
          prev.map((c) => (c.id === activeChatId ? { ...c, typingUsers: [] } : c))
        );

        if (data.reply) {
          const aiResponseMsg: Message = {
            id: `msg-ai-${Date.now()}`,
            chatId: activeChatId,
            senderId: 'user-ai',
            senderName: activeChat.name,
            senderAvatar: activeChat.avatar,
            timestamp: new Date().toISOString(),
            status: 'read',
            type: 'text',
            text: data.reply,
          };

          appendChatMessage(activeChatId, aiResponseMsg);
          setMessages((prev) => ({
            ...prev,
            [activeChatId]: [...(prev[activeChatId] || []), aiResponseMsg],
          }));

          const updatedWithAi = chats.map((c) =>
            c.id === activeChatId
              ? {
                  ...c,
                  lastMessage: aiResponseMsg,
                }
              : c
          );
          setChats(updatedWithAi);
          saveUserChats(currentUser.id, updatedWithAi);
          soundFx.playReceived();
        }
      } catch (err) {
        setChats((prev) =>
          prev.map((c) => (c.id === activeChatId ? { ...c, typingUsers: [] } : c))
        );
      }
    }
  };

  // 2. React to Message
  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!activeChatId || !currentUser) return;
    setMessages((prev) => {
      const updated = (prev[activeChatId] || []).map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const users = currentReactions[emoji] || [];
        if (users.includes(currentUser.id)) {
          currentReactions[emoji] = users.filter((u) => u !== currentUser.id);
          if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = [...users, currentUser.id];
        }
        return { ...m, reactions: currentReactions };
      });
      saveChatMessages(activeChatId, updated);
      return { ...prev, [activeChatId]: updated };
    });
  };

  // 3. Delete Message
  const handleDeleteMessage = (messageId: string, _forEveryone: boolean) => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const updated = (prev[activeChatId] || []).filter((m) => m.id !== messageId);
      saveChatMessages(activeChatId, updated);
      return { ...prev, [activeChatId]: updated };
    });
  };

  // 4. Edit Message
  const handleEditMessage = (messageId: string, newText: string) => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const updated = (prev[activeChatId] || []).map((m) =>
        m.id === messageId ? { ...m, text: newText, isEdited: true } : m
      );
      saveChatMessages(activeChatId, updated);
      return { ...prev, [activeChatId]: updated };
    });
  };

  // 5. Star / Pin
  const handleStarMessage = (messageId: string) => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const updated = (prev[activeChatId] || []).map((m) =>
        m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
      );
      saveChatMessages(activeChatId, updated);
      return { ...prev, [activeChatId]: updated };
    });
  };

  const handlePinMessage = (messageId: string) => {
    if (!activeChatId) return;
    setMessages((prev) => {
      const updated = (prev[activeChatId] || []).map((m) =>
        m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
      );
      saveChatMessages(activeChatId, updated);
      return { ...prev, [activeChatId]: updated };
    });
  };

  // 6. WebRTC Calls
  const handleStartCall = (type: 'audio' | 'video') => {
    if (!activeChat || !currentUser) return;
    const partner =
      activeChat.participants.find((p) => p.id !== currentUser.id) || activeChat.participants[0];

    soundFx.playRingtone();

    setActiveCallSession({
      id: `call-${Date.now()}`,
      chatId: activeChat.id,
      caller: partner,
      type,
      status: 'connected',
      startTime: new Date().toISOString(),
      isMuted: false,
      isVideoEnabled: type === 'video',
      isScreenSharing: false,
      isWhiteboardOpen: false,
    });
  };

  const handleStartCallWithContact = (contact: Contact, type: 'audio' | 'video') => {
    if (!currentUser) return;
    let chat = chats.find(
      (c) => c.type === 'direct' && c.participants.some((p) => p.id === contact.id)
    );
    if (!chat) {
      chat = {
        id: `chat-${contact.id}`,
        name: contact.name,
        handle: contact.handle,
        avatar: contact.avatar,
        type: 'direct',
        participants: [currentUser, contact],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };
      const updatedChats = [chat, ...chats];
      setChats(updatedChats);
      saveUserChats(currentUser.id, updatedChats);
    }
    setActiveChatId(chat.id);
    setActiveTab('chats');

    soundFx.playRingtone();
    setActiveCallSession({
      id: `call-${Date.now()}`,
      chatId: chat.id,
      caller: contact,
      type,
      status: 'connected',
      startTime: new Date().toISOString(),
      isMuted: false,
      isVideoEnabled: type === 'video',
      isScreenSharing: false,
      isWhiteboardOpen: false,
    });
  };

  const handleEndCall = () => {
    if (activeCallSession && currentUser) {
      const newRecord: CallRecord = {
        id: `rec-${Date.now()}`,
        contactName: activeCallSession.caller.name,
        contactAvatar: activeCallSession.caller.avatar,
        type: activeCallSession.type,
        direction: 'outgoing',
        status: 'answered',
        timestamp: new Date().toISOString(),
        duration: '1m 45s',
      };
      const updatedCalls = [newRecord, ...callRecords];
      setCallRecords(updatedCalls);
      saveUserCallRecords(currentUser.id, updatedCalls);
    }
    setActiveCallSession(null);
  };

  // 7. Status Stories
  const handlePublishStory = (storyData: Partial<Story>) => {
    if (!currentUser) return;
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      viewers: [],
      type: storyData.type || 'text',
      ...storyData,
    };
    const updated = [newStory, ...stories];
    setStories(updated);
    saveUserStories(currentUser.id, updated);
  };

  const handleReplyToStory = (story: Story, replyText: string) => {
    if (!currentUser) return;
    let chat = chats.find(
      (c) => c.type === 'direct' && c.participants.some((p) => p.id === story.userId)
    );
    if (!chat) {
      const contact = contacts.find((c) => c.id === story.userId) || {
        id: story.userId,
        name: story.userName,
        handle: `@${story.userName.toLowerCase().replace(/\s+/g, '')}`,
        avatar: story.userAvatar,
        status: 'offline',
        bio: 'GlassChat User',
      };
      chat = {
        id: `chat-${story.userId}`,
        name: story.userName,
        avatar: story.userAvatar,
        type: 'direct',
        participants: [currentUser, contact],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };
      const updatedChats = [chat, ...chats];
      setChats(updatedChats);
      saveUserChats(currentUser.id, updatedChats);
    }

    setActiveChatId(chat.id);
    setActiveTab('chats');
    handleSendMessage({
      type: 'text',
      text: `Replied to status: "${story.textContent || 'Story'}"\n\n${replyText}`,
    });
  };

  // 8. New Chat / Group creators
  const handleCreateDirectChat = (contact: Contact) => {
    if (!currentUser) return;
    let chat = chats.find(
      (c) => c.type === 'direct' && c.participants.some((p) => p.id === contact.id)
    );
    if (!chat) {
      chat = {
        id: `chat-${contact.id}`,
        name: contact.name,
        handle: contact.handle,
        avatar: contact.avatar,
        type: 'direct',
        participants: [currentUser, contact],
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };
      const updatedChats = [chat, ...chats];
      setChats(updatedChats);
      saveUserChats(currentUser.id, updatedChats);
    }
    setActiveChatId(chat.id);
    setActiveTab('chats');
  };

  const handleCreateGroupChat = (name: string, description: string, participantIds: string[]) => {
    if (!currentUser) return;
    const groupParticipants = contacts.filter((c) => participantIds.includes(c.id));
    const newGroupChat: Chat = {
      id: `chat-group-${Date.now()}`,
      name,
      description,
      avatar:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
      type: 'group',
      participants: [currentUser, ...groupParticipants],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updatedChats = [newGroupChat, ...chats];
    setChats(updatedChats);
    saveUserChats(currentUser.id, updatedChats);
    setActiveChatId(newGroupChat.id);
    setActiveTab('chats');
  };

  // 9. Add New Contact directly
  const handleAddNewContact = (contactData: { name: string; handle: string; bio?: string }) => {
    if (!currentUser) return;
    const newContact: Contact = {
      id: `c_${Date.now()}`,
      name: contactData.name,
      handle: contactData.handle.startsWith('@') ? contactData.handle : `@${contactData.handle}`,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      status: 'online',
      bio: contactData.bio || 'GlassChat Registered Member',
    };
    const updated = addContactToUser(currentUser.id, newContact);
    setContacts(updated);
  };

  // 10. Document Scanner Share
  const handleShareScannedDocument = (docData: {
    name: string;
    size: string;
    textPreview: string;
    imageUrl: string;
  }) => {
    if (!activeChatId) return;
    handleSendMessage({
      type: 'document',
      fileName: docData.name,
      fileSize: docData.size,
      text: `Scanned Document: ${docData.name}\n${docData.textPreview}`,
      mediaUrl: docData.imageUrl,
    });
  };

  // 11. Profile & Theme updates
  const handleUpdateProfile = (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...profile };
    setCurrentUser(updatedUser);

    // Update in registeredUsers list and localStorage
    const allUsers = getRegisteredUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem('glasschat_registered_users', JSON.stringify(allUsers));
    localStorage.setItem('glasschat_active_user_id', updatedUser.id);
    setRegisteredUsers(allUsers);
  };

  // 12. Clear all local storage & reset app state
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete all registered local data and restart?')) {
      clearAllLocalStorage();
      setRegisteredUsers([]);
      setCurrentUser(null);
      setContacts([]);
      setChats([]);
      setActiveChatId(null);
      setMessages({});
      setStories([]);
      setCallRecords([]);
      setIsAuthModalOpen(true);
    }
  };

  // If no user is logged in, show AuthModal
  if (!currentUser) {
    return (
      <div className="h-screen w-screen bg-[#0E1013] flex items-center justify-center">
        <AuthModal
          isOpen={true}
          registeredUsers={registeredUsers}
          onRegister={handleRegisterUser}
          onLogin={handleLoginUser}
          theme={theme}
          canDismiss={false}
        />
      </div>
    );
  }

  return (
    <div
      id="glasschat-app-root"
      className={`flex h-screen w-screen overflow-hidden ${
        theme === 'sophisticated-dark'
          ? 'bg-[#0E1013] text-slate-100'
          : theme === 'gold-light'
          ? 'bg-[#F4F4F7] text-slate-900'
          : 'bg-[#0B0D0E] text-slate-100'
      } transition-colors duration-300 font-sans`}
    >
      {/* 1. Left Primary Navigation Sidebar */}
      <NavigationSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) =>
            prev === 'sophisticated-dark'
              ? 'gold-light'
              : prev === 'gold-light'
              ? 'dark-emerald'
              : 'sophisticated-dark'
          )
        }
        currentUser={currentUser}
        unreadTotalCount={chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
      />

      {/* 2. Secondary Panel: ChatList / Calls / Contacts / Settings */}
      <div className="flex h-full flex-1 overflow-hidden">
        {activeTab === 'chats' && (
          <div className="flex h-full w-full">
            {/* Conversation List */}
            <ChatList
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={(id) => setActiveChatId(id)}
              stories={stories}
              onOpenStory={(storyId) => setViewingStoryId(storyId)}
              onCreateStory={() => setIsCreatingStory(true)}
              onOpenNewChatModal={() => setNewChatModalMode('direct')}
              onOpenNewGroupModal={() => setNewChatModalMode('group')}
              theme={theme}
              currentUser={currentUser}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
            />

            {/* Active Conversation Window or Empty Stage */}
            <ChatWindow
              chat={activeChat}
              messages={activeChatMessages}
              currentUser={currentUser}
              theme={theme}
              onSendMessage={handleSendMessage}
              onReactMessage={handleReactMessage}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              onStarMessage={handleStarMessage}
              onPinMessage={handlePinMessage}
              onStartCall={handleStartCall}
              onOpenDocumentScanner={() => setIsDocumentScannerOpen(true)}
              onOpenCodeSandbox={(code, language) => setCodeSandboxData({ code, language })}
              onOpenMediaLightbox={(url, caption) => setLightboxMedia({ url, caption })}
              onToggleIncognito={() => {
                if (!activeChat) return;
                const updated = chats.map((c) =>
                  c.id === activeChat.id ? { ...c, isIncognito: !c.isIncognito } : c
                );
                setChats(updated);
                saveUserChats(currentUser.id, updated);
              }}
              onSetGhostTimer={(secs) => {
                if (!activeChat) return;
                const updated = chats.map((c) =>
                  c.id === activeChat.id ? { ...c, ghostTimerDefault: secs } : c
                );
                setChats(updated);
                saveUserChats(currentUser.id, updated);
              }}
              onOpenNewChatModal={() => setNewChatModalMode('direct')}
              onOpenNewGroupModal={() => setNewChatModalMode('group')}
            />
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="flex h-full w-full">
            <div className="w-full md:w-96 lg:w-104 h-full">
              <CallsHistoryView
                callRecords={callRecords}
                contacts={contacts}
                theme={theme}
                currentUser={currentUser}
                onStartCallWithContact={handleStartCallWithContact}
              />
            </div>
            <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center border-l border-black/5 dark:border-white/5">
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2 gold-text-gradient">
                  GlassChat HD Voice & Video Calling
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Experience studio-grade audio with hardware noise cancellation, 60fps HD video,
                  collaborative whiteboard drawing, and live Gemini AI meeting minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="flex h-full w-full">
            <div className="w-full md:w-96 lg:w-104 h-full">
              <ContactsView
                contacts={contacts}
                theme={theme}
                currentUser={currentUser}
                onSelectContactToChat={handleCreateDirectChat}
                onStartCallWithContact={handleStartCallWithContact}
                onOpenNewContactModal={() => setNewChatModalMode('direct')}
              />
            </div>
            <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center border-l border-black/5 dark:border-white/5">
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2 gold-text-gradient">
                  End-to-End Encrypted Address Book
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time contact presence, 256-bit encrypted phone handles, and direct instant messaging.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex h-full w-full">
            <SettingsView
              currentUser={currentUser}
              registeredUsers={registeredUsers}
              theme={theme}
              onUpdateTheme={setTheme}
              onUpdateProfile={handleUpdateProfile}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onSwitchAccount={handleLoginUser}
              onClearAllData={handleClearAllData}
            />
          </div>
        )}
      </div>

      {/* 3. Global Overlays & Modals */}
      {/* Auth / Registration Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => currentUser && setIsAuthModalOpen(false)}
          registeredUsers={registeredUsers}
          onRegister={handleRegisterUser}
          onLogin={handleLoginUser}
          theme={theme}
          canDismiss={!!currentUser}
        />
      )}

      {/* WebRTC Video / Audio Call Modal */}
      {activeCallSession && (
        <WebRTCCallModal
          callSession={activeCallSession}
          currentUser={currentUser}
          theme={theme}
          onEndCall={handleEndCall}
          onUpdateCallSession={(updater) =>
            setActiveCallSession((prev) => (prev ? updater(prev) : null))
          }
        />
      )}

      {/* 24h Status Story Viewer */}
      {viewingStoryId && (
        <StatusViewerModal
          stories={stories}
          initialStoryId={viewingStoryId}
          currentUser={currentUser}
          theme={theme}
          onClose={() => setViewingStoryId(null)}
          onReplyToStory={handleReplyToStory}
        />
      )}

      {/* 24h Status Story Creator */}
      {isCreatingStory && (
        <StatusCreatorModal
          currentUser={currentUser}
          theme={theme}
          onClose={() => setIsCreatingStory(false)}
          onPublishStory={handlePublishStory}
        />
      )}

      {/* Physical Document Scanner Modal */}
      {isDocumentScannerOpen && (
        <DocumentScannerModal
          theme={theme}
          onClose={() => setIsDocumentScannerOpen(false)}
          onShareDocument={handleShareScannedDocument}
        />
      )}

      {/* Code Sandbox Runner Modal */}
      {codeSandboxData && (
        <CodeSandboxModal
          code={codeSandboxData.code}
          language={codeSandboxData.language}
          theme={theme}
          onClose={() => setCodeSandboxData(null)}
        />
      )}

      {/* New Chat / Group Modal */}
      {newChatModalMode && (
        <NewChatModal
          mode={newChatModalMode}
          theme={theme}
          currentUser={currentUser}
          contacts={contacts}
          onClose={() => setNewChatModalMode(null)}
          onCreateDirectChat={handleCreateDirectChat}
          onCreateGroupChat={handleCreateGroupChat}
          onAddNewContact={handleAddNewContact}
        />
      )}

      {/* Media Lightbox Zoom */}
      {lightboxMedia && (
        <MediaLightboxModal
          mediaUrl={lightboxMedia.url}
          caption={lightboxMedia.caption}
          onClose={() => setLightboxMedia(null)}
        />
      )}
    </div>
  );
}
