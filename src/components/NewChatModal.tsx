import React, { useState } from 'react';
import { Search, Plus, Users, X, Check, Shield, UserPlus, Sparkles } from 'lucide-react';
import { Chat, Contact, ThemeMode, UserProfile } from '../types';

interface NewChatModalProps {
  mode: 'direct' | 'group';
  theme: ThemeMode;
  currentUser: UserProfile;
  contacts: Contact[];
  onClose: () => void;
  onCreateDirectChat: (contact: Contact) => void;
  onCreateGroupChat: (name: string, description: string, participantIds: string[]) => void;
  onAddNewContact?: (contactData: { name: string; handle: string; bio?: string }) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  mode,
  theme,
  currentUser,
  contacts,
  onClose,
  onCreateDirectChat,
  onCreateGroupChat,
  onAddNewContact,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  const [search, setSearch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Direct quick add state
  const [quickName, setQuickName] = useState('');
  const [quickHandle, setQuickHandle] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((cid) => cid !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedContactIds.length === 0) return;
    onCreateGroupChat(groupName.trim(), groupDescription.trim(), [currentUser.id, ...selectedContactIds]);
    onClose();
  };

  const handleQuickAddAndChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickHandle.trim()) return;

    const formattedHandle = quickHandle.startsWith('@') ? quickHandle.trim() : `@${quickHandle.trim()}`;
    const newContact: Contact = {
      id: `c_${Date.now()}`,
      name: quickName.trim(),
      handle: formattedHandle,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      status: 'offline',
      bio: 'GlassChat Registered Member',
    };

    if (onAddNewContact) {
      onAddNewContact({
        name: newContact.name,
        handle: newContact.handle,
        bio: newContact.bio,
      });
    }

    if (mode === 'direct') {
      onCreateDirectChat(newContact);
      onClose();
    } else {
      setIsAddingNew(false);
      setQuickName('');
      setQuickHandle('');
    }
  };

  return (
    <div
      id="new-chat-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
    >
      <div
        className={`w-full max-w-md rounded-3xl p-6 border shadow-[0_20px_60px_rgba(0,0,0,0.8)] ${
          isSophisticatedDark
            ? 'bg-[#121417] border-[#D4AF37]/35 text-slate-100'
            : isGold
            ? 'bg-white border-[#D4AF37]/40 text-slate-900'
            : 'bg-[#0F1316] border-emerald-500/40 text-slate-100'
        } backdrop-blur-3xl`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {mode === 'group' ? (
              <Users className="w-5 h-5 text-[#D4AF37]" />
            ) : (
              <Plus className="w-5 h-5 text-[#D4AF37]" />
            )}
            <h3 className="text-lg font-bold">
              {mode === 'group' ? 'Create New Group' : 'New Direct Conversation'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'group' && (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Group Subject / Title..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#D4AF37]/25 bg-black/30 text-sm outline-none focus:border-[#D4AF37]"
            />
            <input
              type="text"
              placeholder="Group Topic or Description (optional)..."
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="w-full p-2.5 rounded-2xl border border-[#D4AF37]/25 bg-black/30 text-xs outline-none focus:border-[#D4AF37]"
            />
          </div>
        )}

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search registered contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D4AF37]/25 bg-black/30 outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Contacts List or Empty State */}
        {isAddingNew ? (
          <form onSubmit={handleQuickAddAndChat} className="p-3 rounded-2xl bg-black/40 border border-[#D4AF37]/30 space-y-3 mb-4">
            <p className="text-xs font-bold text-[#D4AF37] flex items-center space-x-1">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enter New Registered Contact Details:</span>
            </p>
            <input
              type="text"
              required
              placeholder="Contact Full Name..."
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#D4AF37]/20 outline-none text-slate-100"
            />
            <input
              type="text"
              required
              placeholder="Handle (e.g. @alex)..."
              value={quickHandle}
              onChange={(e) => setQuickHandle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-[#D4AF37]/20 outline-none text-slate-100"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-xs font-bold shadow"
              >
                {mode === 'direct' ? 'Start Conversation' : 'Add to Group List'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1.5 mb-4 pr-1">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Sparkles className="w-6 h-6 text-[#D4AF37] mb-2" />
                <p className="text-xs font-semibold text-slate-300">No matching registered contacts</p>
                <p className="text-[10px] text-slate-400 mt-1 mb-3">
                  Add someone by handle to start an encrypted thread.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-bold text-xs flex items-center space-x-1 shadow-md"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Contact Directly</span>
                </button>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      if (mode === 'direct') {
                        onCreateDirectChat(contact);
                        onClose();
                      } else {
                        toggleSelect(contact.id);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-amber-500/20 border-[#D4AF37]'
                        : 'bg-black/30 hover:bg-[#1A1D23] border-transparent hover:border-[#D4AF37]/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-2xl object-cover border border-[#D4AF37]/30"
                        />
                        {contact.status === 'online' && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100">{contact.name}</p>
                        <p className="text-[10px] text-slate-400">{contact.handle}</p>
                      </div>
                    </div>

                    {mode === 'group' && (
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950'
                            : 'border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {!isAddingNew && filteredContacts.length > 0 && (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="w-full mb-3 py-2 text-xs font-bold text-[#D4AF37] border border-dashed border-[#D4AF37]/40 rounded-xl hover:bg-[#D4AF37]/10 flex items-center justify-center space-x-1.5 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Another Person</span>
          </button>
        )}

        {mode === 'group' && (
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedContactIds.length === 0}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFDF73] to-[#B8860B] text-slate-950 font-black shadow-lg disabled:opacity-40 text-xs hover:brightness-110 transition-all"
          >
            Create Group ({selectedContactIds.length} Members)
          </button>
        )}
      </div>
    </div>
  );
};
