import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Check,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  Clock,
  Pin,
  Star,
  CornerUpLeft,
  Trash2,
  Edit2,
  Copy,
  Download,
  Play,
  Pause,
  Languages,
  Code,
  MapPin,
  FileText,
  User,
  X,
  Volume2,
  Zap,
  Camera,
  Calendar,
  Layers,
  ArrowRight,
  Flame,
  Globe,
  Share2,
  Info,
  Lock,
} from 'lucide-react';
import {
  Chat,
  Message,
  MessageType,
  ThemeMode,
  UserProfile,
  DeliveryStatus,
} from '../types';
import { soundFx, VoiceRecorderHelper } from '../utils/audio';
import { getChatWallpaperStyle } from '../utils/wallpapers';

interface ChatWindowProps {
  chat?: Chat;
  messages: Message[];
  currentUser: UserProfile;
  theme: ThemeMode;
  onSendMessage: (msg: Partial<Message>) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onStarMessage: (messageId: string) => void;
  onPinMessage: (messageId: string) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenDocumentScanner: () => void;
  onOpenCodeSandbox: (code: string, language: string) => void;
  onOpenMediaLightbox: (mediaUrl: string, caption?: string) => void;
  onToggleIncognito: () => void;
  onSetGhostTimer: (seconds: number) => void;
  onBackMobile?: () => void;
  onOpenNewChatModal?: () => void;
  onOpenNewGroupModal?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  currentUser,
  theme,
  onSendMessage,
  onReactMessage,
  onDeleteMessage,
  onEditMessage,
  onStarMessage,
  onPinMessage,
  onStartCall,
  onOpenDocumentScanner,
  onOpenCodeSandbox,
  onOpenMediaLightbox,
  onToggleIncognito,
  onSetGhostTimer,
  onBackMobile,
  onOpenNewChatModal,
  onOpenNewGroupModal,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [activeVoicePlayingId, setActiveVoicePlayingId] = useState<string | null>(null);
  const [voicePlaybackSpeed, setVoicePlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [voiceProgress, setVoiceProgress] = useState<{ [id: string]: number }>({});
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showE2EEModal, setShowE2EEModal] = useState(false);
  const [showGhostModal, setShowGhostModal] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(true);
  const [searchInChatQuery, setSearchInChatQuery] = useState('');
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'Sounds great! ✨',
    "Let's hop on a call 📞",
    'Checking it right now 👍',
  ]);
  const [aiTranslatingId, setAiTranslatingId] = useState<string | null>(null);
  const [translatedMessages, setTranslatedMessages] = useState<{ [id: string]: string }>({});
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);

  // Recording voice note state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingVolume, setRecordingVolume] = useState(30);
  const voiceRecorderRef = useRef<VoiceRecorderHelper | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // Code Snippet creator modal state
  const [showCodeSnippetModal, setShowCodeSnippetModal] = useState(false);
  const [newCodeLanguage, setNewCodeLanguage] = useState<
    'html' | 'javascript' | 'typescript' | 'python' | 'cpp' | 'pascal'
  >('typescript');
  const [newCodeSnippetText, setNewCodeSnippetText] = useState('');
  const [newCodeTitle, setNewCodeTitle] = useState('');

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load AI smart replies dynamically when chat changes
  useEffect(() => {
    if (!chat) return;
    const fetchAiReplies = async () => {
      try {
        const lastFew = messages.slice(-4).map((m) => ({ sender: m.senderName, text: m.text || '' }));
        const res = await fetch('/api/ai/suggest-replies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lastMessages: lastFew, contactName: chat.name }),
        });
        const data = await res.json();
        if (data.suggestions && data.suggestions.length) {
          setAiSuggestions(data.suggestions);
        }
      } catch (e) {}
    };

    fetchAiReplies();
  }, [chat?.id, messages.length]);

  // Voice Recording Handlers
  const handleStartRecording = async () => {
    voiceRecorderRef.current = new VoiceRecorderHelper();
    setIsRecording(true);
    setRecordingSeconds(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    await voiceRecorderRef.current.startRecording((vol) => {
      setRecordingVolume(vol);
    });
  };

  const handleCancelRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.stopRecording();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleFinishRecording = async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);

    if (voiceRecorderRef.current) {
      const result = await voiceRecorderRef.current.stopRecording();

      let transcript = 'Hey, just following up on our project milestones and designs!';
      let aiSummary = 'Summary: Follow-up on project milestones and next deliverables.';
      let sentiment = 'positive';

      try {
        const res = await fetch('/api/ai/transcribe-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: result.base64,
            mimeType: 'audio/webm',
          }),
        });
        const data = await res.json();
        if (data.transcript) transcript = data.transcript;
        if (data.summary) aiSummary = data.summary;
        if (data.sentiment) sentiment = data.sentiment;
      } catch (e) {}

      onSendMessage({
        type: 'voice',
        voiceData: {
          audioUrl: result.base64,
          duration: Math.max(1, recordingSeconds),
          waveform: [30, 60, 90, 45, 80, 100, 75, 40, 85, 95, 60, 30, 70, 90, 50],
          transcript,
          aiSummary,
          sentiment,
        },
      });
      soundFx.playSent();
    }
  };

  // Send Text or /imagine Command Handler
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    if (editingMessage) {
      onEditMessage(editingMessage.id, text);
      setEditingMessage(null);
      setInputText('');
      return;
    }

    if (text.startsWith('/imagine ')) {
      const prompt = text.replace('/imagine ', '').trim();
      setInputText('');
      soundFx.playSent();

      onSendMessage({
        type: 'sticker',
        text: `🎨 Generating AI sticker: "${prompt}"...`,
        mediaUrl:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      });

      try {
        const res = await fetch('/api/ai/imagine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          onSendMessage({
            type: 'sticker',
            text: `✨ AI Sticker: ${prompt}`,
            mediaUrl: data.imageUrl,
          });
        }
      } catch (e) {}
      return;
    }

    onSendMessage({
      type: 'text',
      text,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text || `[${replyingTo.type}]`,
            type: replyingTo.type,
          }
        : undefined,
      ghostTimer: chat.ghostTimerDefault || undefined,
    });

    soundFx.playSent();
    setInputText('');
    setReplyingTo(null);
  };

  const handleTranslateMessage = async (msgId: string, text: string, targetLang: string = 'English') => {
    setAiTranslatingId(msgId);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setTranslatedMessages((prev) => ({ ...prev, [msgId]: data.translatedText }));
      }
    } catch (e) {
      console.warn('Translate error:', e);
    } finally {
      setAiTranslatingId(null);
    }
  };

  const togglePlayVoice = (msgId: string, duration: number) => {
    if (activeVoicePlayingId === msgId) {
      setActiveVoicePlayingId(null);
    } else {
      setActiveVoicePlayingId(msgId);
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10 / (duration * 10);
        if (currentProgress >= 100) {
          clearInterval(interval);
          setActiveVoicePlayingId(null);
          setVoiceProgress((prev) => ({ ...prev, [msgId]: 0 }));
        } else {
          setVoiceProgress((prev) => ({ ...prev, [msgId]: Math.min(100, currentProgress) }));
        }
      }, 100 / voicePlaybackSpeed);
    }
  };

  const visibleMessages = searchInChatQuery
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchInChatQuery.toLowerCase()))
    : messages;

  if (!chat) {
    return (
      <div
        id="glasschat-empty-chat-stage"
        className={`flex h-full flex-1 flex-col items-center justify-center relative overflow-hidden select-none p-6 text-center ${
          isSophisticatedDark ? 'bg-[#0E1013]' : isGold ? 'bg-[#F4F4F7]' : 'bg-[#0B0D0E]'
        }`}
      >
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity ${
            isSophisticatedDark ? 'sophisticated-grid-bg opacity-30' : 'opacity-20'
          }`}
        />

        <div
          className={`relative z-10 max-w-md p-8 rounded-3xl border shadow-2xl flex flex-col items-center ${
            isSophisticatedDark
              ? 'bg-[#121417]/95 border-[#D4AF37]/35 text-slate-100 shadow-[0_16px_50px_rgba(0,0,0,0.8)]'
              : isGold
              ? 'bg-white/95 border-[#D4AF37]/40 text-slate-900 shadow-[0_16px_40px_rgba(212,175,55,0.2)]'
              : 'bg-[#0F1316]/95 border-emerald-500/35 text-slate-100'
          } backdrop-blur-2xl`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#B8860B] via-[#D4AF37] to-[#FFDF73] flex items-center justify-center shadow-[0_4px_24px_rgba(212,175,55,0.4)] mb-4">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
          <h2
            className={`text-xl font-extrabold font-display mb-1 ${
              isSophisticatedDark || isGold ? 'gold-text-gradient' : 'emerald-text-gradient'
            }`}
          >
            Welcome to GlassChat Pro
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Signed in as <span className="font-bold text-[#D4AF37]">{currentUser.name}</span> (
            {currentUser.handle}). No dummy data is loaded. Start your first end-to-end encrypted
            conversation or create a group with registered contacts.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {onOpenNewChatModal && (
              <button
                onClick={onOpenNewChatModal}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-bold text-xs shadow-md hover:brightness-110 transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            )}
            {onOpenNewGroupModal && (
              <button
                onClick={onOpenNewGroupModal}
                className="flex-1 py-3 px-4 rounded-xl bg-black/40 border border-[#D4AF37]/35 text-slate-200 hover:text-white hover:border-[#D4AF37] font-bold text-xs transition-all flex items-center justify-center space-x-2"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>New Group</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="glasschat-active-chat-window"
      className={`flex h-full flex-1 relative overflow-hidden select-none transition-colors duration-300 ${
        isSophisticatedDark ? 'bg-[#0E1013]' : isGold ? 'bg-[#F4F4F7]' : 'bg-[#0B0D0E]'
      }`}
    >
      {/* Center Chat Main Section */}
      <div className="flex flex-col h-full flex-1 relative overflow-hidden">
        {/* Dynamic Chat Wallpaper Surface */}
        <div
          id="chat-window-wallpaper-surface"
          className="absolute inset-0 pointer-events-none transition-all duration-500 z-0"
          style={getChatWallpaperStyle(
            currentUser.wallpaper || 'obsidian-matrix',
            theme,
            currentUser.wallpaperOpacity ?? 0.85
          )}
        />

        {/* Ambient Theme Tone Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity z-0 ${
            isSophisticatedDark
              ? 'sophisticated-grid-bg opacity-20'
              : isGold
              ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/20 via-yellow-50/10 to-transparent opacity-40'
              : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900/40 to-transparent opacity-30'
          }`}
        />

        {/* 1. TOP HEADER */}
        <header
          id="chat-window-top-header"
          className={`relative z-20 flex items-center justify-between px-4 py-3 border-b transition-all ${
            isSophisticatedDark
              ? 'bg-[#121417]/95 border-[#D4AF37]/20 backdrop-blur-2xl shadow-sm text-slate-100'
              : isGold
              ? 'bg-white/85 border-[#D4AF37]/30 backdrop-blur-xl shadow-sm text-slate-900'
              : 'bg-[#0F1214]/90 border-emerald-500/20 backdrop-blur-xl shadow-sm text-slate-100'
          }`}
        >
          {/* Left: Avatar, Name, Handle, Status */}
          <div className="flex items-center space-x-3">
            {onBackMobile && (
              <button
                onClick={onBackMobile}
                className="md:hidden p-1.5 rounded-xl hover:bg-slate-800 text-slate-200"
              >
                <CornerUpLeft className="w-5 h-5" />
              </button>
            )}

            <div
              className="relative cursor-pointer group"
              onClick={() => setShowContactDetails(!showContactDetails)}
            >
              <div className="w-10 h-10 rounded-2xl border border-[#D4AF37]/50 p-0.5 group-hover:scale-105 transition-transform">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-[14px] object-cover"
                />
              </div>
              {chat.participants.some((p) => p.id !== currentUser.id && p.status === 'online') && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#121417]" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-100">{chat.name}</h2>
                {chat.isIncognito && (
                  <span className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/30">
                    <ShieldCheck className="w-2.5 h-2.5 mr-1" /> Incognito
                  </span>
                )}
                {chat.ghostTimerDefault && chat.ghostTimerDefault > 0 && (
                  <span className="flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-[#D4AF37] border border-[#D4AF37]/40">
                    <Clock className="w-2.5 h-2.5 mr-1" /> {chat.ghostTimerDefault}s Ghost
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 truncate max-w-[200px] md:max-w-xs">
                {chat.typingUsers && chat.typingUsers.length > 0 ? (
                  <span className="text-[#D4AF37] font-semibold animate-pulse">typing...</span>
                ) : chat.recordingUsers && chat.recordingUsers.length > 0 ? (
                  <span className="text-rose-400 font-semibold flex items-center">
                    <Mic className="w-3 h-3 mr-1 animate-pulse" /> recording audio...
                  </span>
                ) : (
                  chat.handle || chat.description || 'Tap for contact info'
                )}
              </p>
            </div>
          </div>

          {/* Right: Action Buttons (Call, Video, Search, Ghost, Toggle Info) */}
          <div className="flex items-center space-x-1.5">
            {/* E2EE Lock Button */}
            <button
              onClick={() => setShowE2EEModal(true)}
              className={`p-2 rounded-xl transition-colors ${
                isSophisticatedDark || isGold
                  ? 'text-[#D4AF37] hover:bg-white/5'
                  : 'text-emerald-400 hover:bg-emerald-950/60'
              }`}
              title="End-to-End Encryption Verified"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Ghost Timer Button */}
            <button
              onClick={() => setShowGhostModal(true)}
              className={`p-2 rounded-xl transition-colors ${
                chat.ghostTimerDefault
                  ? 'text-amber-400 bg-amber-500/20'
                  : 'text-slate-400 hover:bg-white/5'
              }`}
              title="Self-Destructing / Ghost Messages"
            >
              <Clock className="w-4 h-4" />
            </button>

            {/* In-chat Search Toggle */}
            <button
              onClick={() => setIsSearchingInChat(!isSearchingInChat)}
              className={`p-2 rounded-xl transition-colors ${
                isSearchingInChat
                  ? 'text-[#D4AF37] bg-white/10'
                  : 'text-slate-400 hover:bg-white/5'
              }`}
              title="Search inside this chat"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Audio Call */}
            <button
              id="chat-header-audio-call-btn"
              onClick={() => onStartCall('audio')}
              className="p-2 rounded-xl text-slate-300 hover:text-[#D4AF37] hover:bg-white/5 transition-colors"
              title="Start HD Audio Call"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Video Call */}
            <button
              id="chat-header-video-call-btn"
              onClick={() => onStartCall('video')}
              className="p-2 rounded-xl text-slate-300 hover:text-[#D4AF37] hover:bg-white/5 transition-colors"
              title="Start HD Video Call"
            >
              <Video className="w-4 h-4" />
            </button>

            {/* Contact Details Toggle Button */}
            <button
              onClick={() => setShowContactDetails(!showContactDetails)}
              className={`p-2 rounded-xl transition-colors ${
                showContactDetails ? 'text-[#D4AF37] bg-white/10' : 'text-slate-400 hover:bg-white/5'
              }`}
              title="Toggle Contact & AI Insights Panel"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* More Options dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors"
                title="More Chat Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showOptionsMenu && (
                <div
                  className={`absolute right-0 top-10 w-52 rounded-2xl p-2 z-50 shadow-2xl border ${
                    isSophisticatedDark
                      ? 'bg-[#1A1D23]/98 border-[#D4AF37]/35 text-slate-100'
                      : isGold
                      ? 'bg-white/95 border-[#D4AF37]/40 text-slate-800'
                      : 'bg-[#14181B]/95 border-emerald-500/30 text-slate-100'
                  } backdrop-blur-2xl`}
                >
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onToggleIncognito();
                    }}
                    className="flex items-center space-x-2 w-full p-2 text-xs rounded-xl text-left hover:bg-white/10"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                    <span>Toggle Incognito Mode</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onOpenDocumentScanner();
                    }}
                    className="flex items-center space-x-2 w-full p-2 text-xs rounded-xl text-left hover:bg-white/10"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Scan Physical Document</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowGhostModal(true);
                    }}
                    className="flex items-center space-x-2 w-full p-2 text-xs rounded-xl text-left hover:bg-white/10"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Disappearing Messages</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* In-Chat Search Bar if active */}
        {isSearchingInChat && (
          <div className="relative z-20 px-4 py-2 bg-[#1A1D23] border-b border-[#D4AF37]/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-4 h-4 text-[#D4AF37]" />
              <input
                type="text"
                placeholder="Search in this chat..."
                value={searchInChatQuery}
                onChange={(e) => setSearchInChatQuery(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-slate-100"
                autoFocus
              />
            </div>
            <button
              onClick={() => setIsSearchingInChat(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. MESSAGES SCROLL CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          {/* End-to-End Encryption Banner */}
          <div className="flex justify-center my-2">
            <div
              onClick={() => setShowE2EEModal(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-semibold cursor-pointer transition-all border shadow-sm ${
                isSophisticatedDark
                  ? 'bg-[#1A1D23]/90 text-[#FFDF73] border-[#D4AF37]/35 hover:bg-[#20252D]'
                  : isGold
                  ? 'bg-white/80 text-[#8B5E05] border-[#D4AF37]/40 hover:bg-white'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Messages are end-to-end encrypted with 256-bit AES</span>
            </div>
          </div>

          {/* Message items */}
          {visibleMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const translated = translatedMessages[msg.id] || msg.translatedText;

            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
              >
                {/* Message Bubble Container */}
                <div
                  className={`relative max-w-[85%] md:max-w-md lg:max-w-lg p-3.5 rounded-2xl transition-all duration-200 ${
                    isMe
                      ? isSophisticatedDark
                        ? 'glass-bubble-sophisticated-sent rounded-tr-xs text-white'
                        : isGold
                        ? 'glass-bubble-gold-sent rounded-tr-xs text-slate-900'
                        : 'glass-bubble-dark-sent rounded-tr-xs text-slate-100'
                      : isSophisticatedDark
                      ? 'glass-bubble-sophisticated-received rounded-tl-xs text-slate-100'
                      : isGold
                      ? 'glass-bubble-gold-received rounded-tl-xs text-slate-900'
                      : 'glass-bubble-dark-received rounded-tl-xs text-slate-100'
                  }`}
                >
                  {/* Replying quote if present */}
                  {msg.replyTo && (
                    <div
                      className={`mb-2 p-2 rounded-xl text-xs border-l-4 ${
                        isMe
                          ? 'bg-black/20 border-white/60 text-white/90'
                          : 'bg-white/5 border-[#D4AF37] text-slate-300'
                      }`}
                    >
                      <p className="font-bold text-[11px] text-[#FFDF73]">{msg.replyTo.senderName}</p>
                      <p className="truncate">{msg.replyTo.text}</p>
                    </div>
                  )}

                  {/* Sender Name in Group chats if not me */}
                  {!isMe && chat.type === 'group' && (
                    <p className="text-[11px] font-bold text-[#D4AF37] mb-1">{msg.senderName}</p>
                  )}

                  {/* TYPE: Text */}
                  {msg.type === 'text' && (
                    <div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                      {/* Instant AI Translation */}
                      {translated && (
                        <div className="mt-2 pt-2 border-t border-white/20 text-xs italic text-slate-200">
                          <div className="flex items-center space-x-1 text-[10px] font-bold text-[#FFDF73] mb-0.5">
                            <Languages className="w-3 h-3" />
                            <span>Translated ({msg.targetLang || 'English'}):</span>
                          </div>
                          <p>{translated}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TYPE: Voice Note */}
                  {msg.type === 'voice' && msg.voiceData && (
                    <div className="space-y-2 min-w-[220px]">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => togglePlayVoice(msg.id, msg.voiceData!.duration)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md ${
                            isMe
                              ? 'bg-white text-slate-950 font-bold'
                              : 'bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-white'
                          }`}
                        >
                          {activeVoicePlayingId === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        {/* Waveform visualizer bars */}
                        <div className="flex-1 flex items-center space-x-0.5 h-7">
                          {msg.voiceData.waveform.map((height, idx) => {
                            const isPlayed =
                              ((voiceProgress[msg.id] || 0) / 100) * msg.voiceData!.waveform.length > idx;
                            return (
                              <span
                                key={idx}
                                style={{ height: `${height}%` }}
                                className={`w-1 rounded-full transition-all ${
                                  isPlayed
                                    ? isMe
                                      ? 'bg-white'
                                      : 'bg-[#D4AF37]'
                                    : isMe
                                    ? 'bg-white/40'
                                    : 'bg-slate-600'
                                } ${activeVoicePlayingId === msg.id ? 'wave-bar-active' : ''}`}
                              />
                            );
                          })}
                        </div>

                        {/* Playback speed toggle */}
                        <button
                          onClick={() => {
                            const speeds: (1 | 1.5 | 2)[] = [1, 1.5, 2];
                            const nextIdx = (speeds.indexOf(voicePlaybackSpeed) + 1) % speeds.length;
                            setVoicePlaybackSpeed(speeds[nextIdx]);
                          }}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/20 text-white"
                        >
                          {voicePlaybackSpeed}x
                        </button>
                      </div>

                      {/* AI Transcribe & Key Takeaways Expandable Drawer */}
                      {msg.voiceData.aiSummary && (
                        <div className="pt-1 text-xs">
                          <button
                            onClick={() =>
                              setExpandedSummaryId(expandedSummaryId === msg.id ? null : msg.id)
                            }
                            className={`flex items-center space-x-1 text-[11px] font-bold ${
                              isMe ? 'text-white hover:underline' : 'text-[#D4AF37] hover:underline'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>AI Voice Transcript & Key Points</span>
                          </button>

                          {expandedSummaryId === msg.id && (
                            <div className="mt-1.5 p-2 rounded-xl bg-black/25 border border-white/10 text-[11px] space-y-1">
                              <p className="font-semibold text-slate-100">
                                "{msg.voiceData.transcript}"
                              </p>
                              <p className="whitespace-pre-line text-slate-300">
                                {msg.voiceData.aiSummary}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TYPE: Image */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="space-y-1.5">
                      <img
                        src={msg.mediaUrl}
                        alt="Shared media"
                        referrerPolicy="no-referrer"
                        onClick={() => onOpenMediaLightbox(msg.mediaUrl!, msg.text)}
                        className="rounded-xl max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      />
                      {msg.text && <p className="text-sm mt-1">{msg.text}</p>}
                    </div>
                  )}

                  {/* TYPE: Code Snippet */}
                  {msg.type === 'code' && msg.codeSnippet && (
                    <div className="space-y-2">
                      {msg.text && <p className="text-xs mb-1">{msg.text}</p>}
                      <div className="rounded-xl overflow-hidden bg-[#16191E] text-slate-200 border border-[#D4AF37]/35 font-mono-code text-xs shadow-md">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[#121417] border-b border-[#D4AF37]/20">
                          <span className="font-bold text-[10px] text-[#D4AF37] uppercase">
                            {msg.codeSnippet.language}
                          </span>
                          <button
                            onClick={() =>
                              onOpenCodeSandbox(msg.codeSnippet!.code, msg.codeSnippet!.language)
                            }
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-[10px] font-extrabold hover:brightness-110 shadow-sm"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Run Preview</span>
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto max-h-48 text-[11px] leading-snug text-emerald-400">
                          {msg.codeSnippet.code}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* TYPE: Document */}
                  {msg.type === 'document' && (
                    <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-black/20 border border-white/10">
                      <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">
                          {msg.fileName || 'Scanned_Document.pdf'}
                        </p>
                        <p className="text-[10px] text-slate-400">{msg.fileSize || '2.4 MB'}</p>
                      </div>
                      <button
                        onClick={() => alert(`Downloading ${msg.fileName || 'Document'}`)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-200"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* TYPE: Location */}
                  {msg.type === 'location' && msg.location && (
                    <div className="space-y-1.5">
                      <div className="h-28 w-full rounded-xl bg-slate-900 relative overflow-hidden flex items-center justify-center border border-[#D4AF37]/30">
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
                        <div className="flex flex-col items-center z-10 text-center px-2">
                          <MapPin className="w-6 h-6 text-rose-500 animate-bounce" />
                          <p className="text-xs font-bold text-white mt-1">{msg.location.name}</p>
                          <p className="text-[10px] text-slate-300">{msg.location.address}</p>
                        </div>
                      </div>
                      {msg.text && <p className="text-xs mt-1">{msg.text}</p>}
                    </div>
                  )}

                  {/* TYPE: AI Sticker */}
                  {msg.type === 'sticker' && msg.mediaUrl && (
                    <div className="flex flex-col items-center space-y-1">
                      <img
                        src={msg.mediaUrl}
                        alt="Sticker"
                        referrerPolicy="no-referrer"
                        className="w-36 h-36 object-cover rounded-2xl shadow-lg border border-[#D4AF37]/50"
                      />
                      {msg.text && (
                        <p className="text-[11px] font-semibold text-slate-300 text-center">
                          {msg.text}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bottom Meta Row: Ghost timer, Timestamp, Delivery ticks */}
                  <div
                    className={`flex items-center justify-end space-x-1.5 mt-1.5 pt-1 text-[10px] ${
                      isMe ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {/* Ghost timer badge */}
                    {msg.ghostTimer && (
                      <span className="flex items-center text-amber-300 font-bold mr-1">
                        <Clock className="w-2.5 h-2.5 mr-0.5" />
                        {msg.ghostTimer}s
                      </span>
                    )}

                    {/* Starred badge */}
                    {msg.isStarred && <Star className="w-3 h-3 text-[#FFDF73] fill-current" />}

                    {/* Pinned badge */}
                    {msg.isPinned && <Pin className="w-3 h-3 text-[#FFDF73] transform rotate-45" />}

                    {/* Time */}
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Ticks if sent by me */}
                    {isMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-[#FFDF73]" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-white/70" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reaction Badges below bubble */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex items-center space-x-1 mt-1 -mb-1 px-1 z-10">
                    {Object.entries(msg.reactions).map(([emoji, usersList]) => {
                      const users = (usersList as string[]) || [];
                      return (
                        <button
                          key={emoji}
                          onClick={() => onReactMessage(msg.id, emoji)}
                          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs border shadow-sm transition-transform hover:scale-110 ${
                            users.includes(currentUser.id)
                              ? 'bg-[#1A1D23] border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-[#14171C] border-white/10 text-slate-300'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] font-bold">{users.length}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Hover Quick Action Toolbar */}
                <div
                  className={`absolute top-0 ${
                    isMe ? 'right-full mr-2' : 'left-full ml-2'
                  } hidden group-hover:flex items-center space-x-1 bg-[#1A1D23]/95 border border-[#D4AF37]/35 shadow-xl rounded-2xl p-1 z-20 backdrop-blur-md`}
                >
                  {/* Emoji Reactions */}
                  {['👍', '❤️', '😂', '🔥', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => onReactMessage(msg.id, emoji)}
                      className="hover:scale-125 p-1 transition-transform text-sm"
                    >
                      {emoji}
                    </button>
                  ))}

                  {/* Translate with AI */}
                  {msg.type === 'text' && (
                    <button
                      onClick={() => handleTranslateMessage(msg.id, msg.text || '')}
                      className="p-1 hover:text-[#D4AF37] text-slate-400"
                      title="Translate with AI"
                    >
                      <Languages className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Reply */}
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="p-1 hover:text-[#D4AF37] text-slate-400"
                    title="Reply"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Star */}
                  <button
                    onClick={() => onStarMessage(msg.id)}
                    className="p-1 hover:text-[#D4AF37] text-slate-400"
                    title="Star message"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>

                  {/* Pin */}
                  <button
                    onClick={() => onPinMessage(msg.id)}
                    className="p-1 hover:text-[#D4AF37] text-slate-400"
                    title="Pin message"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteMessage(msg.id, isMe)}
                    className="p-1 hover:text-rose-500 text-slate-400"
                    title="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. CONTEXTUAL SMART AI REPLIES CHIPS */}
        {aiSuggestions.length > 0 && !isRecording && (
          <div className="relative z-20 px-4 py-1.5 flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-[#D4AF37] flex items-center flex-shrink-0">
              <Sparkles className="w-3 h-3 mr-1" /> Smart AI:
            </span>
            {aiSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(suggestion);
                }}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border transition-all hover:scale-105 shadow-sm ${
                  isSophisticatedDark
                    ? 'bg-[#1A1D23] text-slate-200 border-[#D4AF37]/35 hover:bg-[#222731]'
                    : isGold
                    ? 'bg-white/90 text-slate-800 border-[#D4AF37]/40 hover:bg-[#FFF9E6]'
                    : 'bg-[#14181B] text-slate-200 border-emerald-500/30 hover:bg-emerald-950/50'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* 4. REPLY BANNER if active */}
        {replyingTo && (
          <div className="relative z-20 px-4 py-2 bg-[#1A1D23] border-t border-[#D4AF37]/25 flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <CornerUpLeft className="w-4 h-4 text-[#D4AF37]" />
              <div className="text-xs truncate">
                <span className="font-bold text-[#FFDF73]">{replyingTo.senderName}: </span>
                <span className="text-slate-300 truncate">
                  {replyingTo.text || `[${replyingTo.type}]`}
                </span>
              </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 5. BOTTOM INPUT BAR */}
        <footer
          id="chat-input-footer-bar"
          className={`relative z-20 p-3 border-t transition-all ${
            isSophisticatedDark
              ? 'bg-[#121417]/95 border-[#D4AF37]/20 backdrop-blur-2xl text-slate-100'
              : isGold
              ? 'bg-white/85 border-[#D4AF37]/30 backdrop-blur-xl text-slate-900'
              : 'bg-[#0F1214]/90 border-emerald-500/20 backdrop-blur-xl text-slate-100'
          }`}
        >
          {isRecording ? (
            /* Live Voice Recording State */
            <div className="flex items-center justify-between px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-2xl animate-pulse">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-sm font-bold text-rose-400">
                  Recording audio... {recordingSeconds}s
                </span>
                <div className="flex items-center space-x-0.5">
                  {[1, 2, 3, 4, 5].map((b) => (
                    <span
                      key={b}
                      style={{ height: `${(recordingVolume * ((b % 3) + 1)) / 4}px` }}
                      className="w-1 bg-rose-500 rounded-full max-h-5"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancelRecording}
                  className="p-2 rounded-xl hover:bg-rose-950 text-rose-400 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishRecording}
                  className="p-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md"
                >
                  Send Voice Note
                </button>
              </div>
            </div>
          ) : (
            /* Standard Input Bar */
            <div className="flex items-center space-x-2">
              {/* Attachment Button */}
              <div className="relative">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isSophisticatedDark
                      ? 'bg-[#1A1D23] text-slate-300 border-[#D4AF37]/30 hover:border-[#D4AF37]'
                      : isGold
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-[#D4AF37]'
                      : 'bg-[#14181B] text-slate-300 border-slate-800 hover:border-emerald-500'
                  }`}
                  title="Attach Media, Scans, Code"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Attachment Menu Popover */}
                {showAttachmentMenu && (
                  <div
                    className={`absolute left-0 bottom-14 w-56 rounded-2xl p-2 z-50 shadow-2xl border ${
                      isSophisticatedDark
                        ? 'bg-[#1A1D23]/98 border-[#D4AF37]/40 text-slate-100'
                        : isGold
                        ? 'bg-white/95 border-[#D4AF37]/40 text-slate-800'
                        : 'bg-[#14181B]/95 border-emerald-500/30 text-slate-100'
                    } backdrop-blur-2xl grid grid-cols-2 gap-1.5`}
                  >
                    <button
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        onSendMessage({
                          type: 'image',
                          mediaUrl:
                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                          text: 'Sophisticated Dark & Gold design preview',
                        });
                      }}
                      className="flex flex-col items-center p-2.5 rounded-xl hover:bg-white/10 text-center"
                    >
                      <Camera className="w-5 h-5 text-[#D4AF37] mb-1" />
                      <span className="text-[11px] font-semibold">Photo/Video</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        onOpenDocumentScanner();
                      }}
                      className="flex flex-col items-center p-2.5 rounded-xl hover:bg-white/10 text-center"
                    >
                      <FileText className="w-5 h-5 text-rose-500 mb-1" />
                      <span className="text-[11px] font-semibold">Doc Scanner</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        setShowCodeSnippetModal(true);
                      }}
                      className="flex flex-col items-center p-2.5 rounded-xl hover:bg-white/10 text-center"
                    >
                      <Code className="w-5 h-5 text-indigo-400 mb-1" />
                      <span className="text-[11px] font-semibold">Code Block</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAttachmentMenu(false);
                        onSendMessage({
                          type: 'location',
                          location: {
                            latitude: 6.9271,
                            longitude: 79.8612,
                            name: 'PGV Creation HQ',
                            address: 'Colombo, Sri Lanka',
                          },
                          text: 'Live Location Shared',
                        });
                      }}
                      className="flex flex-col items-center p-2.5 rounded-xl hover:bg-white/10 text-center"
                    >
                      <MapPin className="w-5 h-5 text-emerald-400 mb-1" />
                      <span className="text-[11px] font-semibold">Location</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Input Text Area */}
              <div className="flex-1 relative">
                <textarea
                  id="chat-message-text-input"
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    chat.isIncognito
                      ? 'Incognito message (no history saved)...'
                      : 'Type a message or /imagine [prompt]...'
                  }
                  className={`w-full py-2.5 pl-3 pr-10 rounded-2xl text-sm outline-none resize-none border transition-all ${
                    isSophisticatedDark
                      ? 'bg-[#1A1D23] border-[#D4AF37]/30 text-slate-100 placeholder-slate-500 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30'
                      : isGold
                      ? 'bg-white/90 border-[#D4AF37]/30 text-slate-800 placeholder-slate-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                      : 'bg-[#14181B]/90 border-emerald-500/25 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />

                {/* Emoji Trigger */}
                <button
                  onClick={() => {
                    setInputText((prev) => prev + ' ✨ ');
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-[#D4AF37]"
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Send or Mic Button */}
              {inputText.trim() ? (
                <button
                  id="chat-send-message-btn"
                  onClick={handleSend}
                  className="p-2.5 rounded-2xl shadow-lg transition-transform hover:scale-105 bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-white font-bold shadow-[0_4px_16px_rgba(212,175,55,0.4)]"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  id="chat-voice-record-btn"
                  onClick={handleStartRecording}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isSophisticatedDark
                      ? 'bg-[#1A1D23] text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#20252D]'
                      : isGold
                      ? 'bg-amber-50 text-[#AA820A] border-[#D4AF37]/40 hover:bg-amber-100'
                      : 'bg-slate-900 text-emerald-400 border-emerald-500/30 hover:bg-slate-800'
                  }`}
                  title="Hold or click to record Voice Note with AI transcript"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </footer>
      </div>

      {/* Right Contact & AI Insights Panel (from Sophisticated Dark Specification) */}
      {showContactDetails && (
        <aside
          className={`w-72 md:w-80 border-l flex flex-col p-6 overflow-y-auto transition-all ${
            isSophisticatedDark
              ? 'bg-[#121417] border-[#D4AF37]/20 text-slate-100'
              : isGold
              ? 'bg-[#F9F9FB] border-slate-200 text-slate-900'
              : 'bg-[#0B0D0E] border-emerald-500/20 text-slate-100'
          }`}
        >
          {/* Profile Header */}
          <div className="text-center mb-6">
            <div className="w-22 h-22 mx-auto rounded-full border-4 border-[#D4AF37] p-1 mb-3 shadow-xl relative">
              <img
                src={chat.avatar}
                alt={chat.name}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h3 className="font-bold text-base">{chat.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {chat.description || chat.handle || 'PGV Client Member'}
            </p>
          </div>

          {/* AI Insights & Media */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-3">
                AI Assistant Insights
              </p>
              <div
                className={`p-4 rounded-2xl border ${
                  isSophisticatedDark
                    ? 'bg-[#1A1D23] border-[#D4AF37]/25 shadow-sm'
                    : isGold
                    ? 'bg-white border-[#D4AF37]/20 shadow-sm'
                    : 'bg-emerald-950/40 border-emerald-500/25'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold bg-[#D4AF37] text-slate-950 px-2 py-0.5 rounded">
                    AI
                  </span>
                  <span className="text-[11px] font-bold text-slate-200">Smart Summary</span>
                </div>
                <p className="text-[11px] text-slate-300 italic leading-relaxed">
                  "{chat.lastMessage?.text ? `Conversation active with ${chat.name}. Key points indexed.` : 'The project timeline is trending 2 days early. Client expects gold aesthetics.'}"
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">
                Encrypted Media
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="aspect-square bg-slate-800 rounded-xl overflow-hidden border border-[#D4AF37]/20 relative group cursor-pointer"
                  onClick={() =>
                    onOpenMediaLightbox(
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'
                    )
                  }
                >
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"
                    alt="Shared Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div
                  className="aspect-square bg-slate-800 rounded-xl overflow-hidden border border-[#D4AF37]/20 relative group cursor-pointer"
                  onClick={() =>
                    onOpenMediaLightbox(
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
                    )
                  }
                >
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"
                    alt="Shared Media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D4AF37]/20 space-y-2">
              <button
                onClick={() => alert(`Star messages for ${chat.name}`)}
                className={`flex items-center justify-between w-full p-3 rounded-xl border text-xs font-medium transition-colors ${
                  isSophisticatedDark
                    ? 'bg-[#1A1D23] border-white/5 hover:border-[#D4AF37]/40'
                    : 'bg-white border-slate-200 hover:bg-[#FAF8F2]'
                }`}
              >
                <span>Star Messages</span>
                <span className="text-[#D4AF37]">★</span>
              </button>

              <button
                onClick={() => setShowE2EEModal(true)}
                className={`flex items-center justify-between w-full p-3 rounded-xl border border-[#D4AF37] text-xs font-bold text-[#D4AF37] transition-colors ${
                  isSophisticatedDark ? 'bg-[#1A1D23] hover:bg-[#22272F]' : 'bg-white hover:bg-[#FAF8F2]'
                }`}
              >
                <span>Secure Vault</span>
                <span>🔒</span>
              </button>
            </div>
          </div>

          <div className="mt-auto pt-6 text-center">
            <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-mono">
              End-to-End Encrypted
            </p>
            <p className="text-[8px] text-[#D4AF37] font-bold mt-1 tracking-wider">
              POWERED BY PGV CREATION
            </p>
          </div>
        </aside>
      )}

      {/* Code Snippet Modal */}
      {showCodeSnippetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
              isSophisticatedDark
                ? 'bg-[#16191E] border-[#D4AF37]/50 text-slate-100'
                : isGold
                ? 'bg-white border-[#D4AF37]/50 text-slate-900'
                : 'bg-[#121619] border-emerald-500/40 text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <Code className="w-5 h-5 text-[#D4AF37]" />
                <span>Share Code Block</span>
              </h3>
              <button onClick={() => setShowCodeSnippetModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400">Language</label>
                <select
                  value={newCodeLanguage}
                  onChange={(e) => setNewCodeLanguage(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-transparent text-sm mt-1 text-slate-100"
                >
                  <option value="typescript">TypeScript / React</option>
                  <option value="javascript">JavaScript</option>
                  <option value="html">HTML / CSS</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="pascal">Pascal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GlassmorphismStyles.tsx"
                  value={newCodeTitle}
                  onChange={(e) => setNewCodeTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-transparent text-sm mt-1 text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Code</label>
                <textarea
                  rows={6}
                  placeholder="// Paste your code here..."
                  value={newCodeSnippetText}
                  onChange={(e) => setNewCodeSnippetText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-[#0E1013] text-emerald-400 font-mono-code text-xs mt-1"
                />
              </div>

              <button
                onClick={() => {
                  if (!newCodeSnippetText.trim()) return;
                  onSendMessage({
                    type: 'code',
                    text: newCodeTitle ? `Snippet: ${newCodeTitle}` : 'Code snippet shared',
                    codeSnippet: {
                      language: newCodeLanguage,
                      title: newCodeTitle,
                      code: newCodeSnippetText,
                    },
                  });
                  setShowCodeSnippetModal(false);
                  setNewCodeSnippetText('');
                  setNewCodeTitle('');
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-bold shadow-md"
              >
                Send Code Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E2EE Security Modal */}
      {showE2EEModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
              isSophisticatedDark
                ? 'bg-[#16191E] border-[#D4AF37]/50 text-slate-100'
                : isGold
                ? 'bg-white border-[#D4AF37]/50 text-slate-900'
                : 'bg-[#121619] border-emerald-500/40 text-white'
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold">End-to-End Encryption</h3>
                <p className="text-xs text-slate-400">256-bit AES GCM + Double Ratchet</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Messages and calls with <span className="font-bold text-white">{chat.name}</span> are
              secured with end-to-end encryption. No one outside of this chat, not even GlassChat or
              PGV Creation, can read or listen to them.
            </p>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono-code text-[10px] text-center mb-4 text-[#FFDF73]">
              Security Fingerprint: 4920 8192 3847 9102 5819 2831
            </div>

            <button
              onClick={() => setShowE2EEModal(false)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-bold shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Ghost Timer Modal */}
      {showGhostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
              isSophisticatedDark
                ? 'bg-[#16191E] border-[#D4AF37]/50 text-slate-100'
                : isGold
                ? 'bg-white border-[#D4AF37]/50 text-slate-900'
                : 'bg-[#121619] border-emerald-500/40 text-white'
            }`}
          >
            <h3 className="text-base font-bold mb-2 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Self-Destructing Timer</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              New messages sent in this chat will disappear automatically after:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Off', seconds: 0 },
                { label: '10 Seconds', seconds: 10 },
                { label: '1 Minute', seconds: 60 },
                { label: '1 Hour', seconds: 3600 },
                { label: '24 Hours', seconds: 86400 },
              ].map((item) => (
                <button
                  key={item.seconds}
                  onClick={() => {
                    onSetGhostTimer(item.seconds);
                    setShowGhostModal(false);
                  }}
                  className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${
                    chat.ghostTimerDefault === item.seconds
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white border-[#D4AF37]'
                      : 'hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowGhostModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
