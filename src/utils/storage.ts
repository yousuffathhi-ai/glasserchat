import { UserProfile, Chat, Message, Story, Contact, CallRecord } from '../types';

const STORAGE_KEYS = {
  REGISTERED_USERS: 'glasschat_registered_users',
  CURRENT_USER_ID: 'glasschat_current_user_id',
  CHATS_PREFIX: 'glasschat_chats_',
  MESSAGES_PREFIX: 'glasschat_messages_',
  CONTACTS_PREFIX: 'glasschat_contacts_',
  STORIES: 'glasschat_stories',
  CALLS_PREFIX: 'glasschat_calls_',
};

// Safe localStorage getter
function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading from localStorage key "${key}":`, e);
    return fallback;
  }
}

// Safe localStorage setter
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing to localStorage key "${key}":`, e);
  }
}

// ==================== USER & AUTH STORAGE ====================

export function getRegisteredUsers(): UserProfile[] {
  return getItem<UserProfile[]>(STORAGE_KEYS.REGISTERED_USERS, []);
}

export function saveRegisteredUsers(users: UserProfile[]): void {
  setItem(STORAGE_KEYS.REGISTERED_USERS, users);
}

export function getCurrentUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  } catch {
    return null;
  }
}

export function setCurrentUserId(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  } catch (e) {
    console.warn('Error setting current user id:', e);
  }
}

export function getCurrentUser(): UserProfile | null {
  const currentId = getCurrentUserId();
  if (!currentId) return null;
  const users = getRegisteredUsers();
  return users.find((u) => u.id === currentId) || null;
}

export function registerUser(userData: {
  name: string;
  handle: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  pinLock?: string;
}): UserProfile {
  const users = getRegisteredUsers();

  // Normalize handle
  let formattedHandle = userData.handle.trim();
  if (!formattedHandle.startsWith('@')) {
    formattedHandle = `@${formattedHandle}`;
  }

  // Generate unique ID
  const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Default avatar if none provided
  const avatar =
    userData.avatar ||
    `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80`;

  const newUser: UserProfile = {
    id: newUserId,
    name: userData.name.trim(),
    handle: formattedHandle,
    email: userData.email?.trim() || '',
    phone: userData.phone?.trim() || '',
    bio: userData.bio?.trim() || 'Available on GlassChat Pro ✨',
    avatar,
    status: 'online',
    customStatusText: 'Available ✨',
    wallpaper: 'liquid-gold',
    theme: 'sophisticated-dark',
    bubbleStyle: 'liquid-glass',
    fontSize: 'base',
    disappearingTimerDefault: 0,
    incognitoMode: false,
    readReceipts: true,
    lastSeenPrivacy: 'everyone',
    profilePhotoPrivacy: 'everyone',
    biometricLockEnabled: false,
    pinLock: userData.pinLock || '1234',
    fakePin: '0000',
    blockedUserIds: [],
    autoResponderEnabled: false,
    autoResponderMessage: 'Thanks for reaching out! I will get back to you shortly.',
    autoResponderHours: { start: '18:00', end: '09:00' },
    notificationsEnabled: true,
    soundEnabled: true,
  };

  const updatedUsers = [...users, newUser];
  saveRegisteredUsers(updatedUsers);
  setCurrentUserId(newUser.id);

  return newUser;
}

export function updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  saveRegisteredUsers(users);
  return updatedUser;
}

// ==================== CONTACTS STORAGE ====================

export function getUserContacts(userId: string): Contact[] {
  // Returns contacts specifically stored for this user, or dynamically returns all other registered users!
  const userSpecificContacts = getItem<Contact[]>(`${STORAGE_KEYS.CONTACTS_PREFIX}${userId}`, []);
  const allUsers = getRegisteredUsers();

  // Combine user-specific contacts with other registered users (excluding self)
  const otherUsersAsContacts: Contact[] = allUsers
    .filter((u) => u.id !== userId)
    .map((u) => ({
      id: u.id,
      name: u.name,
      handle: u.handle,
      avatar: u.avatar,
      bio: u.bio,
      status: u.status,
      phone: u.phone,
    }));

  // Merge uniquely by ID
  const map = new Map<string, Contact>();
  otherUsersAsContacts.forEach((c) => map.set(c.id, c));
  userSpecificContacts.forEach((c) => map.set(c.id, c));

  return Array.from(map.values());
}

export function saveUserContacts(userId: string, contacts: Contact[]): void {
  setItem(`${STORAGE_KEYS.CONTACTS_PREFIX}${userId}`, contacts);
}

export function addContactToUser(userId: string, contact: Contact): void {
  const current = getUserContacts(userId);
  if (!current.some((c) => c.id === contact.id)) {
    const updated = [contact, ...current];
    saveUserContacts(userId, updated);
  }
}

// ==================== CHATS & MESSAGES STORAGE ====================

export function getUserChats(userId: string): Chat[] {
  return getItem<Chat[]>(`${STORAGE_KEYS.CHATS_PREFIX}${userId}`, []);
}

export function saveUserChats(userId: string, chats: Chat[]): void {
  setItem(`${STORAGE_KEYS.CHATS_PREFIX}${userId}`, chats);
}

export function getAllMessagesMap(): { [chatId: string]: Message[] } {
  const keys = Object.keys(localStorage);
  const result: { [chatId: string]: Message[] } = {};
  keys.forEach((key) => {
    if (key.startsWith(STORAGE_KEYS.MESSAGES_PREFIX)) {
      const chatId = key.replace(STORAGE_KEYS.MESSAGES_PREFIX, '');
      result[chatId] = getItem<Message[]>(key, []);
    }
  });
  return result;
}

export function getChatMessages(chatId: string): Message[] {
  return getItem<Message[]>(`${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`, []);
}

export function saveChatMessages(chatId: string, messages: Message[]): void {
  setItem(`${STORAGE_KEYS.MESSAGES_PREFIX}${chatId}`, messages);
}

export function appendChatMessage(chatId: string, message: Message): void {
  const current = getChatMessages(chatId);
  const updated = [...current, message];
  saveChatMessages(chatId, updated);
}

// Create or retrieve existing direct chat between two users
export function getOrCreateDirectChat(currentUser: UserProfile, targetContact: Contact): Chat {
  const userChats = getUserChats(currentUser.id);
  
  // Look for existing 1:1 chat with this contact
  const existing = userChats.find(
    (c) => c.type === 'direct' && c.participants.some((p) => p.id === targetContact.id)
  );

  if (existing) {
    return existing;
  }

  const chatId = `chat-direct-${[currentUser.id, targetContact.id].sort().join('_')}`;

  const newChat: Chat = {
    id: chatId,
    type: 'direct',
    name: targetContact.name,
    avatar: targetContact.avatar,
    handle: targetContact.handle,
    description: targetContact.bio,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    participants: [
      {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        status: currentUser.status,
      },
      {
        id: targetContact.id,
        name: targetContact.name,
        handle: targetContact.handle,
        avatar: targetContact.avatar,
        bio: targetContact.bio,
        status: targetContact.status,
        phone: targetContact.phone,
      },
    ],
  };

  // Add to current user's chats
  saveUserChats(currentUser.id, [newChat, ...userChats]);

  // Also add to recipient's chats if they are a registered user
  const recipientChats = getUserChats(targetContact.id);
  const recipientViewChat: Chat = {
    ...newChat,
    name: currentUser.name,
    avatar: currentUser.avatar,
    handle: currentUser.handle,
    description: currentUser.bio,
  };
  saveUserChats(targetContact.id, [recipientViewChat, ...recipientChats]);

  return newChat;
}

// Create new group chat
export function createGroupChat(
  currentUser: UserProfile,
  groupName: string,
  groupDescription: string,
  participants: Contact[]
): Chat {
  const chatId = `chat-group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const allParticipants = [
    {
      id: currentUser.id,
      name: currentUser.name,
      handle: currentUser.handle,
      avatar: currentUser.avatar,
      status: currentUser.status,
      role: 'admin' as const,
    },
    ...participants.map((p) => ({
      ...p,
      role: 'member' as const,
    })),
  ];

  const groupChat: Chat = {
    id: chatId,
    type: 'group',
    name: groupName,
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    description: groupDescription,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    participants: allParticipants,
  };

  // Save for all participating users
  allParticipants.forEach((p) => {
    const pChats = getUserChats(p.id);
    saveUserChats(p.id, [groupChat, ...pChats]);
  });

  return groupChat;
}

// ==================== STORIES / STATUS STORAGE ====================

export function getStories(): Story[] {
  const stories = getItem<Story[]>(STORAGE_KEYS.STORIES, []);
  const now = Date.now();
  // Filter out expired stories (older than 24 hours)
  const activeStories = stories.filter((s) => {
    const expires = typeof s.expiresAt === 'number' ? s.expiresAt : new Date(s.expiresAt).getTime();
    return expires > now;
  });

  if (activeStories.length !== stories.length) {
    setItem(STORAGE_KEYS.STORIES, activeStories);
  }

  return activeStories;
}

export function saveStories(stories: Story[]): void {
  setItem(STORAGE_KEYS.STORIES, stories);
}

export function addStory(newStory: Story): Story[] {
  const stories = getStories();
  const updated = [newStory, ...stories];
  saveStories(updated);
  return updated;
}

// ==================== CALL RECORDS STORAGE ====================

export function getUserCallRecords(userId: string): CallRecord[] {
  return getItem<CallRecord[]>(`${STORAGE_KEYS.CALLS_PREFIX}${userId}`, []);
}

export function saveUserCallRecords(userId: string, records: CallRecord[]): void {
  setItem(`${STORAGE_KEYS.CALLS_PREFIX}${userId}`, records);
}

export function setCurrentUserSession(userId: string): UserProfile | null {
  setCurrentUserId(userId);
  const users = getRegisteredUsers();
  return users.find((u) => u.id === userId) || null;
}

export function clearAllLocalStorage(): void {
  try {
    localStorage.clear();
  } catch (e) {
    console.warn('Error clearing localStorage:', e);
  }
}

// Alias helpers for user stories
export function getUserStories(_userId?: string): Story[] {
  return getStories();
}

export function saveUserStories(_userId: string, stories: Story[]): void {
  saveStories(stories);
}
