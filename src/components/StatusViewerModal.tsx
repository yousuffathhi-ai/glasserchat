import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Send, Heart, Sparkles } from 'lucide-react';
import { Story, ThemeMode, UserProfile } from '../types';

interface StatusViewerModalProps {
  stories: Story[];
  initialStoryId: string;
  currentUser: UserProfile;
  theme: ThemeMode;
  onClose: () => void;
  onReplyToStory: (story: Story, replyText: string) => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  stories,
  initialStoryId,
  currentUser,
  theme,
  onClose,
  onReplyToStory,
}) => {
  const initialIndex = Math.max(
    0,
    stories.findIndex((s) => s.id === initialStoryId)
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewersDrawer, setShowViewersDrawer] = useState(false);
  const [replyText, setReplyText] = useState('');

  const currentStory = stories[currentIndex] || stories[0];
  const isMe = currentStory.userId === currentUser.id;

  // Auto-advance story timer
  useEffect(() => {
    if (isPaused || showViewersDrawer) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // 50 ticks = 5 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, showViewersDrawer, stories.length, onClose]);

  // Handle previous/next
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReplyToStory(currentStory, replyText);
    setReplyText('');
    onClose();
  };

  return (
    <div
      id="glasschat-status-viewer-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-200 select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full max-w-md h-[92vh] rounded-[36px] overflow-hidden flex flex-col justify-between border border-[#D4AF37]/40 shadow-2xl bg-slate-950 text-white">
        {/* Top Progress Segment Bars */}
        <div className="absolute top-4 inset-x-4 z-30 flex items-center space-x-1.5">
          {stories.map((story, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div key={story.id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  style={{
                    width: isCompleted ? '100%' : isCurrent ? `${progress}%` : '0%',
                  }}
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] transition-all duration-100"
                />
              </div>
            );
          })}
        </div>

        {/* Top Header: User Info & Close */}
        <div className="absolute top-8 inset-x-4 z-30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={currentStory.userAvatar}
              alt={currentStory.userName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#D4AF37]"
            />
            <div>
              <h3 className="text-sm font-bold">{currentStory.userName}</h3>
              <span className="text-[10px] text-slate-300">
                {new Date(currentStory.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })} • 24h Status
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Stage: Image or Text Story */}
        <div className="flex-1 relative flex items-center justify-center p-6 text-center">
          {/* Navigation Click Tap Zones */}
          <div className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer" onClick={handlePrev} />
          <div className="absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer" onClick={handleNext} />

          {currentStory.type === 'image' && currentStory.contentUrl ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src={currentStory.contentUrl}
                alt="Story"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-full object-cover rounded-2xl shadow-2xl"
              />
              {currentStory.caption && (
                <div className="absolute bottom-6 inset-x-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md text-sm font-medium text-white text-center">
                  {currentStory.caption}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background:
                  currentStory.backgroundColor ||
                  'linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #1A1A1E 100%)',
              }}
              className="w-full h-full rounded-2xl flex flex-col items-center justify-center p-8 shadow-inner"
            >
              <Sparkles className="w-8 h-8 text-[#FFD700] mb-4 animate-pulse" />
              <p className="text-xl font-bold leading-relaxed tracking-wide font-display">
                {currentStory.textContent}
              </p>
              {currentStory.caption && (
                <p className="text-xs text-amber-200 mt-4 font-mono font-semibold">
                  — {currentStory.caption}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar: Reply Input (for contacts) or Viewers count (for me) */}
        <div className="relative z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          {isMe ? (
            /* My Story: Viewers Count Drawer Trigger */
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShowViewersDrawer(!showViewersDrawer)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition-all"
              >
                <Eye className="w-4 h-4 text-[#D4AF37]" />
                <span>{currentStory.viewers?.length || 0} Views</span>
              </button>
            </div>
          ) : (
            /* Contact Story: Direct Reply Input */
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={`Reply to ${currentStory.userName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                className="flex-1 px-4 py-2.5 rounded-full bg-white/20 border border-white/30 text-white placeholder-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#D4AF37]"
              />
              <button
                onClick={handleSendReply}
                className="p-2.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] text-slate-950 font-bold hover:scale-105 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Viewers List Drawer */}
        {showViewersDrawer && (
          <div className="absolute inset-x-0 bottom-0 max-h-[60%] rounded-t-[32px] bg-slate-900 border-t border-[#D4AF37]/50 p-6 z-40 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold flex items-center">
                <Eye className="w-4 h-4 text-[#D4AF37] mr-1.5" />
                <span>Viewed by {currentStory.viewers?.length || 0} people</span>
              </h4>
              <button onClick={() => setShowViewersDrawer(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-48">
              {currentStory.viewers?.map((viewer) => (
                <div key={viewer.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={viewer.userAvatar}
                      alt={viewer.userName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#D4AF37]"
                    />
                    <div>
                      <p className="text-xs font-bold">{viewer.userName}</p>
                      <p className="text-[10px] text-slate-400">{viewer.viewedAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
