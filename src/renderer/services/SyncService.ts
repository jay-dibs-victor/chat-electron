import { AppDispatch } from '../store';
import { setStatus as setConnectionStatus } from '../store/connectionSlice';
import { syncQueue } from '../store/chatSlice';
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

            console.log(` do nothing here bcus  d db transaction business logic already handles this`)

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
