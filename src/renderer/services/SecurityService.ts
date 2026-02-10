

const ENCRYPTION_KEY_STR = 'secure-messenger-demo-key-2026'; // Demo key
const IV_LENGTH = 12;

async function getKey(): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyData = enc.encode(ENCRYPTION_KEY_STR);
    const hash = await crypto.subtle.digest('SHA-256', keyData);
    return await crypto.subtle.importKey(
        'raw',
        hash,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encrypt(text: string): Promise<string> {
    try {
        const key = await getKey();
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        const encoded = new TextEncoder().encode(text);

        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoded
        );

        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);

        return btoa(String.fromCharCode(...combined));
    } catch (err) {
        console.error('Encryption failed', err);
        return text; // Fallback
    }
}

export async function decrypt(cipher: string): Promise<string> {
    try {
        if (!cipher || cipher.length < 16) return cipher; // Not encrypted or too short

        const combined = new Uint8Array(
            atob(cipher).split('').map(c => c.charCodeAt(0))
        );

        const iv = combined.slice(0, IV_LENGTH);
        const ciphertext = combined.slice(IV_LENGTH);
        const key = await getKey();

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (err) {
        // If decryption fails, it might be plaintext or wrong key
        return cipher;
    }
}

export function safeLog(message: string, content?: any) {
    if (content && typeof content === 'string') {
        console.log(` ${message} (Content length: ${content.length})`);
    } else if (content) {
        console.log(`${message}`, { ...content, body: '[REDACTED]' });
    } else {
        console.log(`${message}`);
    }
}
