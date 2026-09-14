import React, { useState } from 'react';
import { Contact as ContactIcon, Search, User, Phone, X, Check } from 'lucide-react';
import { ContactCard, Participant } from '../../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareContact: (card: ContactCard) => void;
  availableContacts?: Participant[];
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onShareContact,
  availableContacts = [],
}) => {
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customHandle, setCustomHandle] = useState('');

  if (!isOpen) return null;

  const filtered = availableContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (c: Participant) => {
    onShareContact({
      name: c.name,
      phone: c.phone || '+1 (555) 019-2834',
      handle: c.handle,
      avatar: c.avatar,
    });
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPhone.trim()) return;
    onShareContact({
      name: customName.trim(),
      phone: customPhone.trim(),
      handle: customHandle.trim() || `@${customName.toLowerCase().replace(/\s+/g, '')}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#0E1118] border border-[#007AFF]/30 shadow-2xl p-6 text-slate-100 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF]/20 text-[#007AFF] flex items-center justify-center">
              <ContactIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black font-display text-white">Share Contact Card</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Contacts Picker */}
        {availableContacts.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-slate-400 mb-2">Select From Registered Contacts</p>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="w-full flex items-center space-x-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-100 truncate group-hover:text-[#00F0FF]">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{c.handle}</p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10">
                    Share
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Or Enter Custom Contact */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs font-bold text-slate-300 mb-2">Or Enter Contact Details</p>
          <form onSubmit={handleCustomSubmit} className="space-y-2.5">
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-[#151922] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#007AFF]"
            />
            <input
              type="text"
              required
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="Phone Number (+1 ...)"
              className="w-full bg-[#151922] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#007AFF]"
            />
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!customName.trim() || !customPhone.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#007AFF] to-[#00F0FF] text-white text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50 transition-all"
              >
                Send Contact Card
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
