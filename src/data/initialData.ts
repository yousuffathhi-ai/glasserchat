import { Chat, Story, UserProfile, Message, Contact, CallRecord } from '../types';

// Default empty structures - All data is dynamically loaded from real registered users only
export const CURRENT_USER: UserProfile | null = null;
export const INITIAL_MESSAGES: { [chatId: string]: Message[] } = {};
export const INITIAL_CHATS: Chat[] = [];
export const INITIAL_STORIES: Story[] = [];
export const INITIAL_CONTACTS: Contact[] = [];
export const INITIAL_CALL_RECORDS: CallRecord[] = [];
