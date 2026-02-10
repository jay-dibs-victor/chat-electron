import { AppDispatch } from '../store';
import { addMessage, syncQueue } from '../store/chatSlice';
import { setStatus as setConnectionStatus } from '../store/connectionSlice';
import { decrypt } from './SecurityService';

let socket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let retryCount = 0;

export function setupSync(dispatch: AppDispatch) {
    const electron = (window as any).electron;


    // Listen for messages from Electron main process (IPC)
    const removeIpcListener = electron.ipcRenderer.on('new-message', async (msg: any) => {
        const decryptedMsg = {
            ...msg,
            body: await decrypt(msg.body)
        };
        dispatch(addMessage(decryptedMsg));
    });

    connect(dispatch);

    return () => {
        if (socket) socket.close();
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        removeIpcListener();
    };
}

function connect(dispatch: AppDispatch) {
    if (socket) socket.close();

    dispatch(setConnectionStatus('Reconnecting'));
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        console.log('SyncService: Connected to server');
        dispatch(setConnectionStatus('Connected'));
        dispatch(syncQueue());
        retryCount = 0;
        startHeartbeat();
    };

    socket.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new-message') {
            // Handled via IPC usually, but also via WS if connected directly
            // In this app, the main process saves to DB and then sends via IPC
            // But we can also handle it here if the WS server is external.
            // For this simulator, the server is local and main process handles broadcast.
        }
    };

    socket.onclose = () => {
        console.log('SyncService: Disconnected');
        dispatch(setConnectionStatus('Offline'));
        stopHeartbeat();
        scheduleReconnect(dispatch);
    };

    socket.onerror = (err) => {
        console.error('SyncService: WebSocket error', err);
        socket?.close();
    };
}

function scheduleReconnect(dispatch: AppDispatch) {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    console.log(`SyncService: Reconnecting in ${delay}ms...`);

    reconnectTimeout = setTimeout(() => {
        retryCount++;
        connect(dispatch);
    }, delay);
}

function startHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
        }
    }, 10000);
}

function stopHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
}

export function simulateDrop() {
    if (socket) {
        socket.close();
    }
}
