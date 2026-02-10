const { WebSocketServer, WebSocket } = require('ws') as any;
import { saveMessage } from './db';
import crypto from 'crypto';

const ENCRYPTION_KEY_STR = 'secure-messenger-demo-key-2026';

function encryptSync(text: string): string {
    return ''
}

export function startWsServer(onNewMessage: (msg: any) => void) {
    const wss = new WebSocketServer({ port: 8080 });

    wss.on('connection', (ws: any) => {
        console.log('WS: Client connected');
        ws.on('message', (message: any) => {
            const data = JSON.parse(message.toString());
            if (data.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
            }
        });
        ws.on('close', () => {
            console.log('WS: Client disconnected');
        });
    });

    // Simulator
    setInterval(() => {
        const chatId = `chat_${Math.floor(Math.random() * 200) + 1}`;
        const rawBody = `Random sync message at ${new Date().toLocaleTimeString()} (Encrypted Placeholder: ${Math.random().toString(36).substring(7)})`;
        const message = {
            id: `ws_${Date.now()}`,
            chatId,
            ts: Date.now(),
            sender: 'External User',
            body: encryptSync(rawBody),
        };
        saveMessage(chatId, message);
        onNewMessage(message);
        // Broadcast to all connected clients
        wss.clients.forEach((client: any) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'new-message', payload: message }));
            }
        });
    }, 2000);
    return wss;
}
