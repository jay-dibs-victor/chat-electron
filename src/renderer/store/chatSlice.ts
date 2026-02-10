import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { decrypt, encrypt } from '../services/SecurityService';

export interface Message {
    id: string;
    chatId: string;
    ts: number;
    sender: string;
    body: string;
}

export interface Chat {
    id: string;
    title: string;
    lastMessageAt: number;
    unreadCount: number;
}

interface ChatState {
    chats: Chat[];
    messages: Message[];
    selectedChatId: string | null;
    loading: boolean;
    hasMoreMessages: boolean;
    searchQuery: string;
    searchResults: Message[];
    outboundQueue: Message[];
}

const initialState: ChatState = {
    chats: [],
    messages: [],
    selectedChatId: null,
    loading: false,
    hasMoreMessages: true,
    searchQuery: '',
    searchResults: [],
    outboundQueue: [],
};


const getElectron = () => (window as any).electron;

export const fetchChats = createAsyncThunk(
    'chats/fetchChats',
    async ({ limit, offset }: { limit: number; offset: number }) => {
        return await getElectron().ipcRenderer.invoke('get-chats', { limit, offset });
    }
);

export const fetchMessages = createAsyncThunk(
    'chats/fetchMessages',
    async ({ chatId, limit, offset }: { chatId: string; limit: number; offset: number }) => {
        const messages: Message[] = await getElectron().ipcRenderer.invoke('get-messages', { chatId, limit, offset });
        return await Promise.all(messages.map(async (msg) => ({
            ...msg,
            body: await decrypt(msg.body)
        })));
    }
);

export const searchMessages = createAsyncThunk(
    'chats/searchMessages',
    async ({ chatId, query, limit }: { chatId: string; query: string; limit: number }) => {
        const messages: Message[] = await getElectron().ipcRenderer.invoke('search-messages', { chatId, query, limit });
        return await Promise.all(messages.map(async (msg) => ({
            ...msg,
            body: await decrypt(msg.body)
        })));
    }
);

export const sendMessage = createAsyncThunk(
    'chats/sendMessage',
    async ({ chatId, message }: { chatId: string; message: string }, { getState, dispatch }) => {
        const state: any = getState();
        const isOffline = state.connection.status === 'Offline';

        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const ts = Date.now();

        const pendingMsg: Message = {
            id: messageId,
            chatId,
            ts,
            sender: 'Me',
            body: message
        };

        if (isOffline) {
            console.log('[ChatSlice] Offline, queuing message:', messageId);
            dispatch(addToQueue(pendingMsg));
            return pendingMsg;
        }

        const encryptedBody = await encrypt(message);
        const result = await getElectron().ipcRenderer.invoke('send-message', { chatId, message: encryptedBody });

        return {
            ...result,
            body: message // Return plaintext for UI
        } as Message;
    }
);

export const syncQueue = createAsyncThunk(
    'chats/syncQueue',
    async (_, { getState, dispatch }) => {
        const state: any = getState();
        const queue = state.chats.outboundQueue;

        for (const msg of queue) {
            try {
                const encryptedBody = await encrypt(msg.body);
                await getElectron().ipcRenderer.invoke('send-message', { chatId: msg.chatId, message: encryptedBody });
                dispatch(removeFromQueue(msg.id));
            } catch (err) {
                console.error('Failed to sync message:', msg.id, err);
            }
        }
    }
);

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {

        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchQuery = '';
        },
        addToQueue: (state, action: PayloadAction<Message>) => {
            state.outboundQueue.push(action.payload);
        },
        removeFromQueue: (state, action: PayloadAction<string>) => {
            state.outboundQueue = state.outboundQueue.filter(m => m.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChats.pending, (state) => {
                state.loading = true;
            })

    },
});

export const {
    clearSearchResults, addToQueue, removeFromQueue } = chatSlice.actions;
export default chatSlice.reducer;
