import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  Phone,
  Video,
  Shield,
  Sparkles,
  UserCheck,
  UserPlus,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw,
  Check,
  Smartphone,
  Send,
} from 'lucide-react';
import { Contact, ThemeMode, UserProfile } from '../types';

interface ContactsViewProps {
  contacts: Contact[];
  theme: ThemeMode;
  currentUser: UserProfile;
  onSelectContactToChat: (contact: Contact) => void;
  onStartCallWithContact: (contact: Contact, type: 'audio' | 'video') => void;
  onOpenNewContactModal: () => void;
  onAddNewContact?: (contact: Contact) => void;
}

interface ServerFoundUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  profilePic: string;
  status: string;
  isOnline: boolean;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  theme,
  currentUser,
  onSelectContactToChat,
  onStartCallWithContact,
  onOpenNewContactModal,
  onAddNewContact,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  
  const [search, setSearch] = useState('');
  const [isSearchingDB, setIsSearchingDB] = useState(false);
  const [searchedUser, setSearchedUser] = useState<ServerFoundUser | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Local filtered contacts
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      (c.bio && c.bio.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))
  );

  // Debounced Backend Search for Registered Users
  useEffect(() => {
    if (!search.trim() || search.trim().length < 2) {
      setSearchedUser(null);
      setSearchNotFound(false);
      setIsSearchingDB(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDB(true);
      try {
        const res = await fetch('/api/contacts/search-registered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchQuery: search.trim(),
            currentUserPhone: currentUser.phone,
            currentUserId: currentUser.id,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.found && data.user) {
            setSearchedUser(data.user);
            setSearchNotFound(false);
          } else {
            setSearchedUser(null);
            setSearchNotFound(true);
          }
        } else {
          setSearchNotFound(true);
          setSearchedUser(null);
        }
      } catch (err) {
        console.warn('DB search error:', err);
        setSearchNotFound(true);
      } finally {
        setIsSearchingDB(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [search, currentUser.id, currentUser.phone]);

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/?ref=${encodeURIComponent(currentUser.handle || currentUser.name)}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleAddFoundUser = (user: ServerFoundUser) => {
    if (onAddNewContact) {
      const newContact: Contact = {
        id: user.id,
        name: user.name,
        handle: user.username,
        avatar: user.profilePic,
        status: user.isOnline ? 'online' : 'offline',
        bio: user.status,
        phone: user.phone,
      };
      onAddNewContact(newContact);
      setSearch('');
      setSearchedUser(null);
    }
  };

  const handleDirectChatFoundUser = (user: ServerFoundUser) => {
    const contactObj: Contact = {
      id: user.id,
      name: user.name,
      handle: user.username,
      avatar: user.profilePic,
      status: user.isOnline ? 'online' : 'offline',
      bio: user.status,
      phone: user.phone,
    };
    if (onAddNewContact) {
      onAddNewContact(contactObj);
    }
    onSelectContactToChat(contactObj);
  };

  const handleDirectCallFoundUser = (user: ServerFoundUser, type: 'audio' | 'video') => {
    const contactObj: Contact = {
      id: user.id,
      name: user.name,
      handle: user.username,
      avatar: user.profilePic,
      status: user.isOnline ? 'online' : 'offline',
      bio: user.status,
      phone: user.phone,
    };
    onStartCallWithContact(contactObj, type);
  };

  // Sync Device Contacts with Registered Server Users
  const handleSyncDeviceContacts = async () => {
    setSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const res = await fetch('/api/contacts/registered');
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0 && onAddNewContact) {
          let addedCount = 0;
          data.users.forEach((serverUser: ServerFoundUser) => {
            if (serverUser.id !== currentUser.id) {
              const alreadyExists = contacts.some((c) => c.id === serverUser.id || c.phone === serverUser.phone);
              if (!alreadyExists) {
                onAddNewContact({
                  id: serverUser.id,
                  name: serverUser.name,
                  handle: serverUser.username,
                  avatar: serverUser.profilePic,
                  status: serverUser.isOnline ? 'online' : 'offline',
                  bio: serverUser.status,
                  phone: serverUser.phone,
                });
                addedCount++;
              }
            }
          });
          setSyncSuccessMsg(`Synced! ${data.users.length} registered GlassChat network members verified.`);
        }
      }
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }
  };

  const inviteText = `Join me on GlassChat Pro - next-generation encrypted messenger with WebRTC HD video calls & AI translation: ${window.location.origin}/?ref=${encodeURIComponent(currentUser.handle)}`;

  return (
    <div
      id="contacts-view"
      className={`flex flex-col h-full w-full border-r transition-all duration-300 select-none ${
        isSophisticatedDark
          ? 'bg-[#121417]/95 border-[#D4AF37]/20 backdrop-blur-2xl text-slate-100'
          : isGold
          ? 'bg-white/80 border-[#D4AF37]/25 backdrop-blur-xl text-slate-900'
          : 'bg-[#0B0D0E]/85 border-emerald-500/20 backdrop-blur-xl text-slate-100'
      }`}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2
              className={`text-2xl font-extrabold font-display ${
                isSophisticatedDark || isGold ? 'gold-text-gradient' : 'emerald-text-gradient'
              }`}
            >
              Address Book
            </h2>
            <p className="text-[11px] text-slate-400">Live contact discovery & phone sync</p>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleSyncDeviceContacts}
              disabled={syncing}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-[#D4AF37] border border-[#D4AF37]/30 text-xs flex items-center gap-1 transition-all"
              title="Sync & verify network users"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-bold">Sync</span>
            </button>

            <button
              onClick={onOpenNewContactModal}
              className="p-2 px-3 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-md hover:brightness-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Sync notification badge */}
        {syncSuccessMsg && (
          <div className="mb-2 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5 animate-fade-in">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search registered phone (+1...), username (@...), or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border outline-none transition-all ${
              isSophisticatedDark
                ? 'bg-[#1A1D23] border-[#D4AF37]/25 text-slate-100 focus:border-[#D4AF37]'
                : isGold
                ? 'bg-white border-[#D4AF37]/30 text-slate-900 focus:border-[#D4AF37]'
                : 'bg-[#14181B] border-slate-700 text-slate-100'
            }`}
          />
          {isSearchingDB && (
            <div className="absolute right-3 top-2.5">
              <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Main List & Discovery Area */}
      <div className="flex-1 overflow-y-auto px-3 space-y-2 py-1">
        
        {/* 1. REAL-TIME SERVER SEARCH RESULT (FOUND USER) */}
        {searchedUser && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1A1D23] to-[#121417] border-2 border-[#D4AF37] shadow-[0_4px_25px_rgba(212,175,55,0.2)] mb-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Verified Registered GlassChat User</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{searchedUser.isOnline ? 'Online' : 'Available'}</span>
              </span>
            </div>

            <div className="flex items-center space-x-3 mb-3">
              <img
                src={searchedUser.profilePic}
                alt={searchedUser.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border border-[#D4AF37]/50"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{searchedUser.name}</h4>
                <p className="text-xs text-[#D4AF37] font-medium">{searchedUser.username}</p>
                <p className="text-[11px] text-slate-400">{searchedUser.phone}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 italic mb-3 bg-black/30 p-2 rounded-xl border border-white/5">
              "{searchedUser.status}"
            </p>

            {/* Action Buttons for Found User */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleDirectChatFoundUser(searchedUser)}
                className="py-1.5 px-2 rounded-xl bg-[#D4AF37] text-slate-950 font-bold text-xs flex items-center justify-center gap-1 hover:brightness-105"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => handleDirectCallFoundUser(searchedUser, 'audio')}
                className="py-1.5 px-2 rounded-xl bg-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-700 border border-emerald-500/30"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Voice</span>
              </button>
              <button
                onClick={() => handleDirectCallFoundUser(searchedUser, 'video')}
                className="py-1.5 px-2 rounded-xl bg-slate-800 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-700 border border-cyan-500/30"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
            </div>

            <button
              onClick={() => handleAddFoundUser(searchedUser)}
              className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-[#D4AF37] hover:underline flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>Save to My Contacts List</span>
            </button>
          </div>
        )}

        {/* 2. NOT FOUND STATE - INVITE VIA WHATSAPP / SMS */}
        {searchNotFound && !searchedUser && search.trim().length >= 2 && (
          <div className="p-4 rounded-2xl bg-[#16191E]/90 border border-red-500/30 text-center space-y-3 mb-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">No registered user found</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                "{search}" is not on GlassChat yet. Invite them to connect!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(inviteText)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp Invite</span>
              </a>
              <a
                href={`sms:?body=${encodeURIComponent(inviteText)}`}
                className="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SMS Invite</span>
              </a>
            </div>

            <button
              onClick={handleCopyInviteLink}
              className="w-full py-1.5 text-xs text-[#D4AF37] hover:underline flex items-center justify-center gap-1"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Invite Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Direct App Share Link</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 3. REGISTERED CONTACTS LIST */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {filteredContacts.length} Saved Contacts
          </span>
          <span className="text-[10px] text-[#D4AF37]">256-bit AES E2EE</span>
        </div>

        {filteredContacts.length === 0 && !searchedUser ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <Sparkles className="w-8 h-8 text-[#D4AF37]/60 mb-2 animate-pulse" />
            <p className="text-sm font-semibold text-slate-300">No contacts found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mb-3">
              Search by phone number, handle, or sync network contacts.
            </p>
            <button
              onClick={handleSyncDeviceContacts}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync All Registered Users</span>
            </button>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                isSophisticatedDark
                  ? 'bg-[#16191E]/70 hover:bg-[#1C2027] border-transparent hover:border-[#D4AF37]/25'
                  : isGold
                  ? 'bg-white/40 hover:bg-white/90 border-transparent hover:border-[#D4AF37]/30'
                  : 'bg-[#121619]/40 hover:bg-[#14181B] border-transparent hover:border-emerald-500/25'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl border border-[#D4AF37]/40 p-0.5">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-[14px] object-cover"
                    />
                  </div>
                  {contact.status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#121417]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 truncate">{contact.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{contact.handle || contact.phone}</p>
                  <p className="text-[10px] text-[#D4AF37] italic mt-0.5 truncate max-w-[170px]">
                    {contact.bio || 'Encrypted GlassChat User'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  onClick={() => onSelectContactToChat(contact)}
                  className="p-2 rounded-xl text-[#D4AF37] hover:bg-white/10 transition-colors"
                  title="Send Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onStartCallWithContact(contact, 'audio')}
                  className="p-2 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-white/10 transition-colors"
                  title="Audio Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onStartCallWithContact(contact, 'video')}
                  className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-colors"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default ContactsView;
