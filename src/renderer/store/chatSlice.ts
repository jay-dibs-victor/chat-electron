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
