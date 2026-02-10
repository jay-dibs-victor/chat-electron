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



    ipcMain.handle('seed-data', () => {
        seedData();
    });
}

export function saveMessage(chatId: string, message: any) {
    if (!db) return;

}

function seedData() {
    if (!db) return;

}
