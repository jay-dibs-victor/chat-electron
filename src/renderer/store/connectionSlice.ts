import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'Connected' | 'Reconnecting' | 'Offline';

interface ConnectionState {
    status: ConnectionStatus;
    retryCount: number;
}

const initialState: ConnectionState = {
    status: 'Offline',
    retryCount: 0,
};

const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<ConnectionStatus>) => {
            state.status = action.payload;
        },
        incrementRetry: (state) => {
            state.retryCount += 1;
        },
        resetRetry: (state) => {
            state.retryCount = 0;
        }
    },
});

export const { setStatus, incrementRetry, resetRetry } = connectionSlice.actions;
export default connectionSlice.reducer;
