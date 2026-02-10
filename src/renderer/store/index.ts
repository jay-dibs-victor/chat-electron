import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import connectionReducer from './connectionSlice';

export const store = configureStore({
    reducer: {
        chats: chatReducer,
        connection: connectionReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
