const sqlite3 = require('sqlite3');
import path from 'path';
import { app, ipcMain } from 'electron';
import fs from 'fs';

let db: any;

export function setupDbHandlers() {
    const dbPath = path.join(process.cwd(), 'messenger.db');
    console.log('Database Path (Root):', dbPath);

    db = new sqlite3.Database(dbPath, (err: any) => {
        if (err) {
            console.error('Failed to open database:', err);
        } else {
            console.log('Database opened successfully');

            // Initialize tables and seed data in sequence
            db.serialize(() => {
                console.log('Initializing database tables...');

                db.run(`
                    CREATE TABLE IF NOT EXISTS chats (
                      id TEXT PRIMARY KEY,
                      title TEXT,
                      lastMessageAt INTEGER,
                      unreadCount INTEGER DEFAULT 0
                    )
                `, (err: any) => { if (err) console.error('Error creating chats table:', err); });

                db.run(`
                    CREATE TABLE IF NOT EXISTS messages (
                      id TEXT PRIMARY KEY,
                      chatId TEXT,
                      ts INTEGER,
                      sender TEXT,
                      body TEXT,
                      FOREIGN KEY(chatId) REFERENCES chats(id)
                    )
                `, (err: any) => { if (err) console.error('Error creating messages table:', err); });

                db.run(`
                    CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(id UNINDEXED, chatId, body)
                `, (err: any) => {
                    if (err) {
                        console.error('Error creating FTS table (check if FTS5 is supported):', err);
                    }
                });

                db.run(`CREATE INDEX IF NOT EXISTS idx_messages_chatId_ts ON messages(chatId, ts DESC)`);
                db.run(`CREATE INDEX IF NOT EXISTS idx_chats_lastMessageAt ON chats(lastMessageAt DESC)`);

                console.log('Table initialization complete. Running seed check...');
                seedData();
            });
        }
    });

    // IPC Handlers
    ipcMain.handle('get-chats', (_: any, { limit, offset }: { limit: number; offset: number }) => {
        // console.log(`IPC: get-chats limit=${limit}, offset=${offset}`);
        return new Promise((resolve, reject) => {
            if (!db) return resolve([]);
            db.all('SELECT * FROM chats ORDER BY lastMessageAt DESC LIMIT ? OFFSET ?', [limit, offset], (err: any, rows: any) => {
                if (err) {
                    console.error('Error fetching chats:', err);
                    reject(err);
                } else {
                    console.log(`Fetched ${rows.length} chats`);
                    resolve(rows || []);
                }
            });
        });
    });

    ipcMain.handle('get-messages', (_: any, { chatId, limit, offset }: { chatId: string; limit: number; offset: number }) => {
        return new Promise((resolve, reject) => {
            if (!db) return resolve([]);
            db.all('SELECT * FROM messages WHERE chatId = ? ORDER BY ts DESC LIMIT ? OFFSET ?', [chatId, limit, offset], (err: any, rows: any) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('search-messages', (_: any, { chatId, query, limit }: { chatId: string; query: string; limit: number }) => {
        return new Promise((resolve, reject) => {
            if (!db) return resolve([]);
            // Note: Using MATCH ? with f.body for FTS5 search
            db.all(`
                SELECT m.* FROM messages m
                JOIN messages_fts f ON m.id = f.id
                WHERE f.chatId = ? AND f.body MATCH ?
                ORDER BY m.ts DESC LIMIT ?
            `, [chatId, query, limit], (err: any, rows: any) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('mark-as-read', (_: any, chatId: string) => {
        if (db) db.run('UPDATE chats SET unreadCount = 0 WHERE id = ?', [chatId]);
    });

    ipcMain.handle('send-message', (_: any, { chatId, message }: { chatId: string; message: string }) => {
        return new Promise((resolve, reject) => {
            if (!db) return reject(new Error('Database not initialized'));

            const messageId = `${chatId}_msg_${Date.now()}`;
            const ts = Date.now();
            const sender = 'Me';

            console.log(`IPC: send-message to chat ${chatId}`);

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // Insert message
                db.run(
                    'INSERT INTO messages (id, chatId, ts, sender, body) VALUES (?, ?, ?, ?, ?)',
                    [messageId, chatId, ts, sender, message],
                    (err: any) => {
                        if (err) {
                            console.error('Error inserting message:', err);
                            db.run('ROLLBACK');
                            return reject(err);
                        }
                    }
                );

                // Insert into FTS
                db.run(
                    'INSERT INTO messages_fts (id, chatId, body) VALUES (?, ?, ?)',
                    [messageId, chatId, message],
                    (err: any) => {
                        if (err) console.error('Error inserting into FTS:', err);
                    }
                );

                // Update chat lastMessageAt
                db.run(
                    'UPDATE chats SET lastMessageAt = ? WHERE id = ?',
                    [ts, chatId],
                    (err: any) => {
                        if (err) console.error('Error updating chat:', err);
                    }
                );

                db.run('COMMIT', (commitErr: any) => {
                    if (commitErr) {
                        console.error('Send message transaction failed:', commitErr);
                        reject(commitErr);
                    } else {
                        console.log('Message sent successfully');
                        resolve({ id: messageId, chatId, ts, sender, body: message });
                    }
                });
            });
        });
    });

    ipcMain.handle('seed-data', () => {
        seedData();
    });
}

// added this feature for user send message to current chat
export function saveMessage(chatId: string, message: any) {
    if (!db) return;
    db.serialize(() => {
        const insertMessage = db.prepare('INSERT INTO messages (id, chatId, ts, sender, body) VALUES (?, ?, ?, ?, ?)');
        const insertFts = db.prepare('INSERT INTO messages_fts (id, chatId, body) VALUES (?, ?, ?)');
        const updateChat = db.prepare('UPDATE chats SET lastMessageAt = ?, unreadCount = unreadCount + 1 WHERE id = ?');

        db.run('BEGIN TRANSACTION');
        insertMessage.run(message.id, chatId, message.ts, message.sender, message.body);
        insertFts.run(message.id, chatId, message.body);
        updateChat.run(message.ts, chatId);
        db.run('COMMIT');

        insertMessage.finalize();
        insertFts.finalize();
        updateChat.finalize();
    });
}

function seedData() {
    if (!db) return;
    db.get('SELECT COUNT(*) as count FROM chats', (err: any, row: any) => {
        if (err) {
            console.error('Error checking chat count for seeding:', err);
            return;
        }

        if (row && row.count > 0) {
            console.log('Database already contains data. Skipping seed.');
            return;
        }

        console.log('Seeding data (200 chats, 20,000 messages)... This may take a moment.');

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const insertChat = db.prepare('INSERT INTO chats (id, title, lastMessageAt, unreadCount) VALUES (?, ?, ?, ?)');
            const insertMessage = db.prepare('INSERT INTO messages (id, chatId, ts, sender, body) VALUES (?, ?, ?, ?, ?)');
            const insertFts = db.prepare('INSERT INTO messages_fts (id, chatId, body) VALUES (?, ?, ?)');

            for (let i = 1; i <= 200; i++) {
                const chatId = `chat_${i}`;
                const lastTs = Date.now() - Math.floor(Math.random() * 10000000);
                insertChat.run(chatId, `Chat ${i}`, lastTs, 0);

                const messagesPerChat = 100;
                for (let j = 1; j <= messagesPerChat; j++) {
                    const msgId = `${chatId}_msg_${j}`;
                    const ts = lastTs - (messagesPerChat - j) * 60000;
                    const body = `Message ${j} in Chat ${i}`;
                    insertMessage.run(msgId, chatId, ts, j % 2 === 0 ? 'Me' : 'User', body);
                    insertFts.run(msgId, chatId, body);
                }
            }

            insertChat.finalize();
            insertMessage.finalize();
            insertFts.finalize();

            db.run('COMMIT', (commitErr: any) => {
                if (commitErr) {
                    console.error('Seed transaction failed:', commitErr);
                } else {
                    console.log('Seeding complete successfully.');
                }
            });
        });
    });
}
