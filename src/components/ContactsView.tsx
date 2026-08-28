import React, { useState } from 'react';
import { Search, Plus, MessageSquare, Phone, Video, Shield, Sparkles } from 'lucide-react';
import { Contact, ThemeMode, UserProfile } from '../types';

interface ContactsViewProps {
  contacts: Contact[];
  theme: ThemeMode;
  currentUser: UserProfile;
  onSelectContactToChat: (contact: Contact) => void;
  onStartCallWithContact: (contact: Contact, type: 'audio' | 'video') => void;
  onOpenNewContactModal: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  theme,
  currentUser,
  onSelectContactToChat,
  onStartCallWithContact,
  onOpenNewContactModal,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  const [search, setSearch] = useState('');

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      c.bio.toLowerCase().includes(search.toLowerCase())
  );

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
          <h2
            className={`text-2xl font-extrabold font-display ${
              isSophisticatedDark || isGold ? 'gold-text-gradient' : 'emerald-text-gradient'
            }`}
          >
            Address Book
          </h2>
          <button
            onClick={onOpenNewContactModal}
            className="p-2 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-white shadow-md font-bold text-xs flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, handle, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
              isSophisticatedDark
                ? 'bg-[#1A1D23] border-[#D4AF37]/25 text-slate-100 focus:border-[#D4AF37]'
                : isGold
                ? 'bg-white border-[#D4AF37]/30 text-slate-900 focus:border-[#D4AF37]'
                : 'bg-[#14181B] border-slate-700 text-slate-100'
            }`}
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5 py-1">
        <span className="text-[11px] font-bold text-slate-400 px-3 uppercase">
          {filteredContacts.length} Registered Contacts
        </span>

        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <Sparkles className="w-8 h-8 text-[#D4AF37]/60 mb-2 animate-pulse" />
            <p className="text-sm font-semibold text-slate-300">No contacts in address book</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mb-3">
              Add contacts by username/handle or register additional accounts to chat.
            </p>
            <button
              onClick={onOpenNewContactModal}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Contact</span>
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
              <div className="flex items-center space-x-3">
                <div className="relative">
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
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{contact.name}</h4>
                  <p className="text-[11px] text-slate-400">{contact.handle}</p>
                  <p className="text-[10px] text-[#D4AF37] italic mt-0.5 truncate max-w-[180px]">
                    {contact.bio}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onSelectContactToChat(contact)}
                  className="p-2 rounded-xl text-[#D4AF37] hover:bg-white/10 transition-colors"
                  title="Send Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onStartCallWithContact(contact, 'audio')}
                  className="p-2 rounded-xl text-slate-300 hover:text-[#D4AF37] hover:bg-white/10 transition-colors"
                  title="Audio Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onStartCallWithContact(contact, 'video')}
                  className="p-2 rounded-xl text-slate-300 hover:text-[#D4AF37] hover:bg-white/10 transition-colors"
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
