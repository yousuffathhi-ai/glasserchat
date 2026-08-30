// Real-time WebRTC Call Signaling & Ringing Engine
// Supports cross-tab BroadcastChannel, server-side polling/push, and storage events

export interface SignalingCallPayload {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  callerPhone?: string;
  callerHandle?: string;
  receiverId: string;
  callType: 'audio' | 'video';
  chatId?: string;
  status: 'ringing' | 'accepted' | 'rejected' | 'cancelled' | 'ended';
  timestamp: number;
}

type CallEventListener = (payload: SignalingCallPayload) => void;

class CallSignalingManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<CallEventListener> = new Set();
  private currentUserId: string | null = null;
  private activeCall: SignalingCallPayload | null = null;
  private serverPollInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('glasschat_call_signaling');
      this.channel.onmessage = (event) => {
        this.handleIncomingSignal(event.data);
      };
    }

    // Cross-tab storage event fallback
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'glasschat_active_call_signal' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.handleIncomingSignal(data);
          } catch (err) {
            console.warn('Signal parse error:', err);
          }
        }
      });
    }

    // Start server poll for background call signals
    this.startServerPolling();
  }

  public setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
  }

  public subscribe(listener: CallEventListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(payload: SignalingCallPayload) {
    this.listeners.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error('Signaling listener error:', e);
      }
    });
  }

  private handleIncomingSignal(payload: SignalingCallPayload) {
    if (!payload) return;

    // Check if relevant to this client
    if (this.currentUserId && (payload.receiverId === this.currentUserId || payload.callerId === this.currentUserId)) {
      this.activeCall = payload.status === 'ended' || payload.status === 'rejected' || payload.status === 'cancelled' 
        ? null 
        : payload;
      this.notifyListeners(payload);
    }
  }

  // Initiate call to receiver
  public async makeCall(params: {
    callerId: string;
    callerName: string;
    callerAvatar: string;
    callerPhone?: string;
    callerHandle?: string;
    receiverId: string;
    callType: 'audio' | 'video';
    chatId?: string;
  }): Promise<SignalingCallPayload> {
    const payload: SignalingCallPayload = {
      callId: `call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      callerId: params.callerId,
      callerName: params.callerName,
      callerAvatar: params.callerAvatar,
      callerPhone: params.callerPhone,
      callerHandle: params.callerHandle,
      receiverId: params.receiverId,
      callType: params.callType,
      chatId: params.chatId,
      status: 'ringing',
      timestamp: Date.now(),
    };

    this.activeCall = payload;
    this.broadcastSignal(payload);

    // Send to backend server
    try {
      await fetch('/api/signaling/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn('Server signaling notification note:', e);
    }

    return payload;
  }

  // Accept incoming call
  public async acceptCall(callId: string) {
    if (!this.activeCall && callId) {
      this.activeCall = {
        callId,
        callerId: '',
        callerName: '',
        callerAvatar: '',
        receiverId: this.currentUserId || '',
        callType: 'video',
        status: 'accepted',
        timestamp: Date.now(),
      };
    }

    if (this.activeCall) {
      const updated: SignalingCallPayload = {
        ...this.activeCall,
        status: 'accepted',
        timestamp: Date.now(),
      };
      this.activeCall = updated;
      this.broadcastSignal(updated);

      try {
        await fetch('/api/signaling/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId, action: 'accept' }),
        });
      } catch (e) {
        console.warn('Server signaling action note:', e);
      }
    }
  }

  // Reject incoming call
  public async rejectCall(callId: string) {
    if (this.activeCall) {
      const updated: SignalingCallPayload = {
        ...this.activeCall,
        status: 'rejected',
        timestamp: Date.now(),
      };
      this.activeCall = null;
      this.broadcastSignal(updated);

      try {
        await fetch('/api/signaling/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId, action: 'reject' }),
        });
      } catch (e) {
        console.warn('Server signaling action note:', e);
      }
    }
  }

  // Cancel outgoing call while ringing
  public async cancelCall(callId: string) {
    if (this.activeCall) {
      const updated: SignalingCallPayload = {
        ...this.activeCall,
        status: 'cancelled',
        timestamp: Date.now(),
      };
      this.activeCall = null;
      this.broadcastSignal(updated);

      try {
        await fetch('/api/signaling/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId, action: 'cancel' }),
        });
      } catch (e) {
        console.warn('Server signaling action note:', e);
      }
    }
  }

  // End active connected call
  public async endCall(callId: string) {
    if (this.activeCall) {
      const updated: SignalingCallPayload = {
        ...this.activeCall,
        status: 'ended',
        timestamp: Date.now(),
      };
      this.activeCall = null;
      this.broadcastSignal(updated);

      try {
        await fetch('/api/signaling/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId, action: 'end' }),
        });
      } catch (e) {
        console.warn('Server signaling action note:', e);
      }
    }
  }

  private broadcastSignal(payload: SignalingCallPayload) {
    if (this.channel) {
      this.channel.postMessage(payload);
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('glasschat_active_call_signal', JSON.stringify(payload));
      } catch (e) {
        console.warn('LocalStorage signal store error:', e);
      }
    }
    this.notifyListeners(payload);
  }

  private startServerPolling() {
    if (typeof window === 'undefined') return;
    
    // Poll every 3 seconds for server signals if online
    this.serverPollInterval = setInterval(async () => {
      if (!this.currentUserId) return;
      try {
        const res = await fetch(`/api/signaling/active?userId=${encodeURIComponent(this.currentUserId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.call) {
            this.handleIncomingSignal(data.call);
          }
        }
      } catch (e) {
        // Silent poll fallback
      }
    }, 3000);
  }
}

export const callSignaling = new CallSignalingManager();
