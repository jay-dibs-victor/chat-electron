import { describe, it, expect } from 'vitest';
import connectionReducer, { setStatus, incrementRetry, resetRetry } from './connectionSlice';

describe('connectionSlice', () => {
    const initialState = {
        status: 'Offline' as const,
        retryCount: 0,
    };

    it('should handle setStatus', () => {
        const state = connectionReducer(initialState, setStatus('Connected'));
        expect(state.status).toBe('Connected');
    });

    it('should handle incrementRetry', () => {
        const state = connectionReducer(initialState, incrementRetry());
        expect(state.retryCount).toBe(1);
    });

    it('should handle resetRetry', () => {
        const state = connectionReducer({ status: 'Offline', retryCount: 5 }, resetRetry());
        expect(state.retryCount).toBe(0);
    });
});
