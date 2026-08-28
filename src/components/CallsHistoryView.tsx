import React, { useState } from 'react';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Plus,
  Link2,
  Copy,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { CallRecord, Contact, ThemeMode, UserProfile } from '../types';

interface CallsHistoryViewProps {
  callRecords: CallRecord[];
  contacts: Contact[];
  theme: ThemeMode;
  currentUser: UserProfile;
  onStartCallWithContact: (contact: Contact, type: 'audio' | 'video') => void;
}

export const CallsHistoryView: React.FC<CallsHistoryViewProps> = ({
  callRecords,
  contacts,
  theme,
  currentUser,
  onStartCallWithContact,
}) => {
  const isSophisticatedDark = theme === 'sophisticated-dark';
  const isGold = theme === 'gold-light';
  const [copiedLink, setCopiedLink] = useState(false);
  const [search, setSearch] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://glasschat.app/join/pgv-studio-782');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredCalls = callRecords.filter((c) =>
    c.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      id="calls-history-view"
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
            Calls Log
          </h2>
        </div>

        {/* Create Call Link Banner */}
        <div
          onClick={handleCopyLink}
          className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border mb-3 ${
            isSophisticatedDark
              ? 'bg-[#1A1D23] border-[#D4AF37]/35 shadow-sm hover:border-[#D4AF37]'
              : isGold
              ? 'bg-gradient-to-r from-amber-50 to-white border-[#D4AF37]/40 shadow-sm hover:shadow-md'
              : 'bg-gradient-to-r from-emerald-950/60 to-[#121619] border-emerald-500/30 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-white">
              <Link2 className="w-5 h-5 font-bold" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Create Call Link</p>
              <p className="text-[10px] text-slate-400">Share a link for your encrypted call</p>
            </div>
          </div>
          <button className="text-xs font-bold text-[#D4AF37] flex items-center space-x-1">
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search recent calls..."
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

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5 py-1">
        <span className="text-[11px] font-bold text-slate-400 px-3 uppercase">Recent History</span>

        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <Sparkles className="w-8 h-8 text-[#D4AF37]/60 mb-2 animate-pulse" />
            <p className="text-sm font-semibold text-slate-300">No call history</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              All incoming, outgoing, and missed end-to-end encrypted calls will appear here.
            </p>
          </div>
        ) : (
          filteredCalls.map((call) => {
            const contact = contacts.find((c) => c.name === call.contactName);
            return (
              <div
                key={call.id}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${
                  isSophisticatedDark
                    ? 'bg-[#16191E]/70 hover:bg-[#1C2027] border-transparent hover:border-[#D4AF37]/25'
                    : isGold
                    ? 'bg-white/40 hover:bg-white/90 border-transparent hover:border-[#D4AF37]/30'
                    : 'bg-[#121619]/40 hover:bg-[#14181B] border-transparent hover:border-emerald-500/25'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl border border-[#D4AF37]/40 p-0.5 relative">
                    <img
                      src={call.contactAvatar}
                      alt={call.contactName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-[14px] object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{call.contactName}</h4>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                      {call.direction === 'incoming' && (
                        <PhoneIncoming className="w-3 h-3 text-emerald-400" />
                      )}
                      {call.direction === 'outgoing' && (
                        <PhoneOutgoing className="w-3 h-3 text-[#D4AF37]" />
                      )}
                      {call.direction === 'missed' && <PhoneMissed className="w-3 h-3 text-rose-500" />}
                      <span>
                        {call.direction.toUpperCase()} • {call.duration || '0:00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() =>
                      contact && onStartCallWithContact(contact, 'audio')
                    }
                    className="p-2 rounded-xl text-[#D4AF37] hover:bg-white/10 transition-colors"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      contact && onStartCallWithContact(contact, 'video')
                    }
                    className="p-2 rounded-xl text-[#D4AF37] hover:bg-white/10 transition-colors"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
