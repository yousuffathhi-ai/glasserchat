import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'GlassChat Pro',
    creator: 'PGV Creation',
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Translation endpoint
app.post('/api/ai/translate', async (req, res) => {
  try {
    const { text, targetLang = 'English' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback simple dictionary simulation if no API key
      return res.json({
        translatedText: `[${targetLang}]: ${text}`,
        detectedLang: 'Auto',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Translate the following chat message precisely into ${targetLang}. Keep natural conversational tone, slang and emojis intact. Return ONLY the translated string without any conversational filler or quotes.\n\nMessage: "${text}"`,
    });

    const translatedText = response.text?.trim() || text;
    res.json({ translatedText, targetLang });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message || 'Translation failed' });
  }
});

// AI Voice Note Transcriber & Summarizer
app.post('/api/ai/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', textContext } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        transcript: textContext || "Hey! Just wanted to follow up on the GlassChat UI redesign and the golden glass liquid effects. Let's connect at 4 PM.",
        summary: "• Discussed GlassChat liquid gold UI design\n• Agreed to connect at 4:00 PM today\n• Action item: Review WebRTC screen sharing",
        sentiment: "positive",
      });
    }

    let prompt = `You are GlassChat Pro's Voice Note AI Assistant. 
Analyze and transcribe the provided voice note audio (or context). 
Provide:
1. Full accurate Transcript
2. A bulleted Summary with Key Takeaways (2-3 concise bullets)
3. Overall Mood/Sentiment (e.g. Enthusiastic, Urgent, Friendly, Inquisitive).

Format your response in JSON:
{
  "transcript": "...",
  "summary": "• Point 1\\n• Point 2",
  "sentiment": "Friendly"
}`;

    let contents: any = prompt;

    if (audioBase64) {
      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType.includes('wav') ? 'audio/wav' : mimeType.includes('mp3') ? 'audio/mp3' : 'audio/webm',
            },
          },
          { text: prompt + `\nAdditional Context: ${textContext || ''}` },
        ],
      };
    } else if (textContext) {
      contents = prompt + `\nContextual speech note content: "${textContext}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      transcript: parsed.transcript || textContext || 'Voice note audio transcribed.',
      summary: parsed.summary || '• Voice note received\n• Key discussion points captured',
      sentiment: parsed.sentiment || 'Friendly',
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({
      transcript: 'Voice audio note processed.',
      summary: '• Audio voice note shared in chat',
      sentiment: 'Neutral',
    });
  }
});

// Smart Contextual Reply Suggestions
app.post('/api/ai/suggest-replies', async (req, res) => {
  try {
    const { lastMessages, contactName = 'Friend' } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        suggestions: [
          'Sounds great! ✨',
          "Let's hop on a call 📞",
          'Checking it right now 👍',
        ],
      });
    }

    const historyStr = Array.isArray(lastMessages)
      ? lastMessages.map((m: any) => `${m.sender}: ${m.text}`).join('\n')
      : 'User: Hey, how are you?';

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `You are GlassChat Pro's Smart Reply Engine.
Based on the following recent conversation with ${contactName}, generate 3 distinct, snappy, natural quick reply chips that the user might want to tap.
Keep them under 6 words each. Include subtle emoji where appropriate.

Conversation:
${historyStr}

Return JSON array of 3 strings: ["Reply 1", "Reply 2", "Reply 3"]`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const suggestions = JSON.parse(response.text || '[]');
    res.json({ suggestions: Array.isArray(suggestions) && suggestions.length ? suggestions.slice(0, 3) : ['Sounds good! 👍', 'Thanks! ✨', 'On it! 🚀'] });
  } catch (error: any) {
    res.json({ suggestions: ['Sounds good! 👍', 'Got it, thanks! ✨', 'Let me check! 🚀'] });
  }
});

// AI Imagine (Sticker & Image generator)
app.post('/api/ai/imagine', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback stylish SVG sticker / avatar
      return res.json({
        imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80`,
        prompt,
        type: 'preset',
      });
    }

    // Try generating with gemini-3.1-flash-lite-image
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: `A vibrant, high quality, luxury 3D sticker/artwork of: ${prompt}. Golden glass highlights, transparent glass effect, modern aesthetic.` }],
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1',
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          return res.json({
            imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
            prompt,
            type: 'generated',
          });
        }
      }
    } catch (imgError) {
      console.warn('Image generation fallback to themed visuals:', imgError);
    }

    // Curated aesthetic fallback visuals if image model quotas or paid keys require it
    const fallbacks = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    ];
    const picked = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json({
      imageUrl: picked,
      prompt,
      type: 'preset',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

// AI Call Minutes / Summary
app.post('/api/ai/call-summary', async (req, res) => {
  const { callDuration = '12m', participants = ['You', 'Contact'], topic = 'Project Discussion' } = req.body || {};
  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        summary: `• Call Duration: ${callDuration || '12 mins'}\n• Participants: ${participants.join(', ')}\n• Discussed: ${topic}\n• Next Action: Finalize Glassmorphism UI tokens & schedule QA testing.`,
        keyDecisions: ['Approved White & Gold Liquid Glass design', 'Enabled WebRTC HD studio screenshare', 'Configured 24h disappearing statuses'],
        actionItems: ['Follow up in chat thread', 'Review project timeline'],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Generate a professional, structured Call Summary / Minutes of Meeting for a GlassChat HD Call:
Duration: ${callDuration}
Participants: ${participants.join(', ')}
Topic: ${topic}

Provide response in JSON:
{
  "summary": "Concise summary paragraph",
  "keyDecisions": ["Decision 1", "Decision 2", "Decision 3"],
  "actionItems": ["Action 1", "Action 2"]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    res.json({
      summary: `Call completed with ${participants.join(', ')} (${callDuration}). Discussed project goals.`,
      keyDecisions: ['Reviewed project timeline', 'Confirmed deliverables'],
      actionItems: ['Follow up in chat thread'],
    });
  }
});

// ==================== REAL-TIME REGISTERED USERS & CONTACTS DATABASE ====================

interface ServerRegisteredUser {
  id: string;
  name: string;
  username: string;
  phone: string;
  profilePic: string;
  status: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: number;
}

// In-memory persistent registered users pool
const registeredUsersDB = new Map<string, ServerRegisteredUser>();

// Initialize default seed registered accounts for live testing if empty
const seedUsers: ServerRegisteredUser[] = [
  {
    id: 'user-elena-vance',
    name: 'Elena Vance',
    username: '@elena_vance',
    phone: '+14155550198',
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    status: 'Exploring Liquid Glass & WebRTC 4K 🔮',
    isOnline: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'user-marcus-sterling',
    name: 'Marcus Sterling',
    username: '@marcus_sterling',
    phone: '+14155550142',
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    status: 'Leading Quantum Architecture at PGV Creation ⚡',
    isOnline: true,
    createdAt: Date.now() - 172800000,
  },
  {
    id: 'user-sophia-chen',
    name: 'Sophia Chen',
    username: '@sophia_chen',
    phone: '+14155550177',
    profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    status: 'Available for WebRTC video sync 📹',
    isOnline: false,
    lastSeen: '10m ago',
    createdAt: Date.now() - 259200000,
  },
  {
    id: 'user-alex-rivera',
    name: 'Alex Rivera',
    username: '@alex_rivera',
    phone: '+14155550111',
    profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    status: 'End-to-End Encrypted 🔒',
    isOnline: true,
    createdAt: Date.now() - 345600000,
  }
];

seedUsers.forEach((u) => registeredUsersDB.set(u.id, u));

// Register or sync user into server DB
app.post('/api/contacts/register', (req, res) => {
  try {
    const { id, name, username, phone, profilePic, status } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'User ID and Name are required' });
    }

    const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
    const cleanUsername = (username || '').startsWith('@') ? username : `@${username || name.toLowerCase().replace(/\s+/g, '_')}`;

    const user: ServerRegisteredUser = {
      id,
      name,
      username: cleanUsername,
      phone: cleanPhone,
      profilePic: profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      status: status || 'Hey there! I am using GlassChat Pro ✨',
      isOnline: true,
      createdAt: Date.now(),
    };

    registeredUsersDB.set(id, user);
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to register user on server' });
  }
});

// Search Registered User by Phone Number or Username
app.post('/api/contacts/search-registered', async (req, res) => {
  try {
    const { searchQuery, currentUserPhone, currentUserId } = req.body;

    if (!searchQuery || typeof searchQuery !== 'string') {
      return res.status(400).json({ error: 'searchQuery string is required' });
    }

    const rawQuery = searchQuery.trim();
    // Clean phone number format (digits only)
    const cleanedDigits = rawQuery.replace(/[^0-9]/g, '');
    const lowerQuery = rawQuery.toLowerCase().replace(/^@/, '');

    const allUsers = Array.from(registeredUsersDB.values());

    // Match Registered User
    const matchedUser = allUsers.find((user) => {
      // Don't return self
      if (currentUserId && user.id === currentUserId) return false;
      if (currentUserPhone && user.phone && user.phone.replace(/[^0-9]/g, '') === currentUserPhone.replace(/[^0-9]/g, '')) {
        return false;
      }

      const userDigits = (user.phone || '').replace(/[^0-9]/g, '');
      const userUsername = (user.username || '').toLowerCase().replace(/^@/, '');
      const userName = (user.name || '').toLowerCase();

      // Check phone match
      if (cleanedDigits.length >= 4 && userDigits.includes(cleanedDigits)) {
        return true;
      }

      // Check username or name match
      if (userUsername.includes(lowerQuery) || userName.includes(lowerQuery)) {
        return true;
      }

      return false;
    });

    if (!matchedUser) {
      return res.status(200).json({
        found: false,
        message: 'No registered user found. Send Invite link via WhatsApp or SMS!',
      });
    }

    return res.status(200).json({
      found: true,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        username: matchedUser.username,
        phone: matchedUser.phone || '+1 (555) 019-2834',
        profilePic: matchedUser.profilePic || '/icon.svg',
        status: matchedUser.status || 'Hey there! I am using GlassChat',
        isOnline: matchedUser.isOnline,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Database search failed' });
  }
});

// GET /api/contacts/registered - List all registered users in DB
app.get('/api/contacts/registered', (req, res) => {
  const users = Array.from(registeredUsersDB.values()).map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    phone: u.phone,
    profilePic: u.profilePic,
    status: u.status,
    isOnline: u.isOnline,
  }));
  res.json({ users });
});

// POST /api/contacts/sync - Match array of device phone numbers against registered users
app.post('/api/contacts/sync', (req, res) => {
  try {
    const { phoneNumbers = [] } = req.body;
    const allUsers = Array.from(registeredUsersDB.values());

    const matchedUsers = allUsers.filter((user) => {
      const uDigits = (user.phone || '').replace(/[^0-9]/g, '');
      return phoneNumbers.some((p: string) => {
        const pDigits = p.replace(/[^0-9]/g, '');
        return pDigits.length >= 6 && (uDigits.includes(pDigits) || pDigits.includes(uDigits));
      });
    });

    res.json({
      totalSynced: phoneNumbers.length,
      matchedCount: matchedUsers.length,
      users: matchedUsers,
    });
  } catch (e: any) {
    res.status(500).json({ error: 'Contact sync failed' });
  }
});

// ==================== REAL-TIME CALL SIGNALING ENGINE ====================

interface ActiveCallSignal {
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

const activeCallsMap = new Map<string, ActiveCallSignal>();

// POST /api/signaling/call - Trigger call ring to receiver
app.post('/api/signaling/call', (req, res) => {
  try {
    const callData: ActiveCallSignal = req.body;
    if (!callData || !callData.callId || !callData.receiverId) {
      return res.status(400).json({ error: 'Valid callId and receiverId are required' });
    }

    activeCallsMap.set(callData.callId, callData);
    res.json({ success: true, status: 'ringing', callId: callData.callId });
  } catch (error: any) {
    res.status(500).json({ error: 'Call signal failed' });
  }
});

// POST /api/signaling/action - Accept, Reject, Cancel, End
app.post('/api/signaling/action', (req, res) => {
  try {
    const { callId, action } = req.body;
    const call = activeCallsMap.get(callId);
    if (!call) {
      return res.status(404).json({ error: 'Call session not found' });
    }

    if (action === 'accept') {
      call.status = 'accepted';
    } else if (action === 'reject') {
      call.status = 'rejected';
      setTimeout(() => activeCallsMap.delete(callId), 10000);
    } else if (action === 'cancel') {
      call.status = 'cancelled';
      setTimeout(() => activeCallsMap.delete(callId), 10000);
    } else if (action === 'end') {
      call.status = 'ended';
      setTimeout(() => activeCallsMap.delete(callId), 10000);
    }

    call.timestamp = Date.now();
    activeCallsMap.set(callId, call);
    res.json({ success: true, call });
  } catch (error: any) {
    res.status(500).json({ error: 'Signaling action failed' });
  }
});

// GET /api/signaling/active - Poll active call for user
app.get('/api/signaling/active', (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.json({ call: null });
  }

  const now = Date.now();
  for (const call of activeCallsMap.values()) {
    // Exclude stale calls (> 45s)
    if (now - call.timestamp > 45000) {
      activeCallsMap.delete(call.callId);
      continue;
    }
    if ((call.receiverId === userId || call.callerId === userId) && call.status === 'ringing') {
      return res.json({ call });
    }
  }

  res.json({ call: null });
});

// Vite Middleware for Dev and Static for Prod
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ GlassChat Pro Server active at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
