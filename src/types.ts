export type OnlineStatus = 'online' | 'away' | 'busy' | 'offline';

export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type ThemeMode = 'sophisticated-dark' | 'gold-light' | 'dark-emerald';

export type NavigationTab = 'chats' | 'status' | 'calls' | 'contacts' | 'settings';

export type MessageType =
  | 'text'
  | 'voice'
  | 'image'
  | 'video'
  | 'document'
  | 'contact'
  | 'location'
  | 'code'
  | 'sticker';

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs
}

export interface CodeSnippet {
  language: 'html' | 'javascript' | 'typescript' | 'python' | 'cpp' | 'pascal' | 'css';
  code: string;
  title?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

export interface ContactCard {
  name: string;
  phone: string;
  handle: string;
  avatar?: string;
}

export interface VoiceData {
  audioUrl: string;
  duration: number; // in seconds
  waveform: number[];
  transcript?: string;
  aiSummary?: string;
  sentiment?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  text?: string;
  translatedText?: string;
  targetLang?: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  voiceData?: VoiceData;
  codeSnippet?: CodeSnippet;
  location?: LocationData;
  contactCard?: ContactCard;
  status: DeliveryStatus;
  timestamp: string; // ISO string
  createdAt?: number | string; // unix ms or ISO string
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
    type: MessageType;
  };
  reactions?: { [emoji: string]: string[] }; // emoji -> array of userIds
  isStarred?: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
  isDeletedForEveryone?: boolean;
  deletedForUserIds?: string[];
  ghostTimer?: number; // expiry in seconds (e.g. 10, 60, 3600, 86400)
  expiresAt?: number; // unix timestamp
  isIncognito?: boolean;
  scheduledFor?: string; // ISO timestamp
}

export interface Participant {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  status: OnlineStatus;
  lastSeen?: string;
  role?: 'admin' | 'member';
  customWallpaper?: string;
  phone?: string;
}

export type Contact = Participant;

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  avatar: string;
  handle?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  isIncognito?: boolean;
  customWallpaper?: string;
  ghostTimerDefault?: number; // default timer for new messages
  description?: string;
  createdAt: string;
  typingUsers?: string[]; // user names currently typing
  recordingUsers?: string[]; // user names currently recording
}

export interface StoryViewer {
  userId: string;
  userName: string;
  userAvatar: string;
  viewedAt: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'image' | 'video' | 'text';
  contentUrl?: string;
  textContent?: string;
  backgroundColor?: string;
  caption?: string;
  createdAt: number | string;
  expiresAt: number | string;
  viewers: StoryViewer[];
}

export interface CallRecord {
  id: string;
  contactName: string;
  contactAvatar: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed' | 'rejected';
  timestamp: string;
  duration?: string;
}

export interface CallSession {
  id: string;
  chatId: string;
  type: 'audio' | 'video';
  status: 'calling' | 'incoming' | 'connected' | 'ended';
  caller: Participant;
  participants?: Participant[];
  startTime?: number | string;
  durationSeconds?: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isWhiteboardOpen: boolean;
  isNoiseCancellationActive?: boolean;
  isRecording?: boolean;
  aiMinutes?: {
    summary: string;
    keyDecisions: string[];
    actionItems: string[];
  };
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  status: OnlineStatus;
  customStatusText?: string;
  wallpaper: string;
  wallpaperOpacity?: number;
  theme: ThemeMode;
  bubbleStyle: 'liquid-glass' | 'modern-soft' | 'sharp-contrast';
  fontSize: 'sm' | 'base' | 'lg';
  disappearingTimerDefault: number; // 0 for off, or seconds
  incognitoMode: boolean;
  readReceipts: boolean;
  lastSeenPrivacy: 'everyone' | 'contacts' | 'nobody';
  profilePhotoPrivacy: 'everyone' | 'contacts' | 'nobody';
  biometricLockEnabled: boolean;
  pinLock: string; // real pin (default 1234)
  fakePin: string; // fake pin (default 0000) for fake mode disguise
  blockedUserIds: string[];
  autoResponderEnabled: boolean;
  autoResponderMessage: string;
  autoResponderHours: { start: string; end: string };
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}
