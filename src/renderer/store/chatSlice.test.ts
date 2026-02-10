// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import chatReducer, { selectChat, addMessage, Message, Chat } from './chatSlice';

describe('chatSlice', () => {
    const initialState = {
        chats: [
            { id: 'chat_1', title: 'Chat 1', lastMessageAt: 1000, unreadCount: 0 }
        ],
        messages: [],
        selectedChatId: null,
        loading: false,
        hasMoreMessages: true,
        searchQuery: '',
        searchResults: [],
    };

    it('should handle selectChat', () => {
        // Mock electron global
        (window as any).electron = {
            ipcRenderer: {
                invoke: vi.fn().mockResolvedValue(null)
            }
        };

        const state = chatReducer(initialState, selectChat('chat_1'));
        expect(state.selectedChatId).toBe('chat_1');
        expect(state.messages).toEqual([]);
    });

    it('should handle addMessage and update unreadCount', () => {
        const message = {
            id: 'msg_1',
            chatId: 'chat_1',
            ts: 2000,
            sender: 'Other',
            body: 'Hello'
        };

        const state = chatReducer(initialState, addMessage(message));
        expect(state.chats[0].unreadCount).toBe(1);
        expect(state.chats[0].lastMessageAt).toBe(2000);
    });
});
