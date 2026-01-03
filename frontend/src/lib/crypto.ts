import { argon2id } from 'hash-wasm';

// Constants
const ARGON_MEMORY = 128 * 1024; // 128 MB
const ARGON_ITERATIONS = 3;
const ARGON_PARALLELISM = 2;
const ARGON_HASH_LENGTH = 32; // 256 bits

// Utils
function strToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

function bytesToStr(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
}

function base64ToBytes(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// 1. Derive Master Key (returns CryptoKey for AES-GCM)
export async function deriveMasterKey(password: string, saltBase64: string): Promise<CryptoKey> {
    const salt = base64ToBytes(saltBase64);

    const hashHex = await argon2id({
        password,
        salt,
        parallelism: ARGON_PARALLELISM,
        iterations: ARGON_ITERATIONS,
        memorySize: ARGON_MEMORY,
        hashLength: ARGON_HASH_LENGTH,
    });

    // Convert Hex to Bytes
    const keyBytes = new Uint8Array(hashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    // Import as AES-GCM Key
    return window.crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM' },
        false, // extractable
        ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
    );
}

// 2. Derive Auth Bytes (returns Base64 string to send to server)
export async function deriveAuthHash(password: string, saltBase64: string): Promise<string> {
    const salt = base64ToBytes(saltBase64);
    const hashHex = await argon2id({
        password,
        salt,
        parallelism: ARGON_PARALLELISM,
        iterations: ARGON_ITERATIONS,
        memorySize: ARGON_MEMORY,
        hashLength: ARGON_HASH_LENGTH,
    });

    // Convert Hex to Base64
    const bytes = new Uint8Array(hashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return bytesToBase64(bytes);
}

// 3. Generate Random Key (for Vault Items or Master Key)
export async function generateItemKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true, // extractable (need to encrypt it)
        ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
    );
}

// 4. Encrypt Data
export async function encryptData(data: string, key: CryptoKey): Promise<{ cipherText: string; iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = strToBytes(data);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv as any,
        },
        key,
        encodedData as any
    );

    return {
        cipherText: bytesToBase64(new Uint8Array(encryptedBuffer)),
        iv: bytesToBase64(iv),
    };
}

// 5. Decrypt Data
export async function decryptData(cipherTextBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
    const iv = base64ToBytes(ivBase64);
    const cipherBytes = base64ToBytes(cipherTextBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv as any,
        },
        key,
        cipherBytes as any
    );

    return bytesToStr(new Uint8Array(decryptedBuffer));
}

// 6. Wrap Key (Encrypt ItemKey with MasterKey)
export async function wrapKey(keyToWrap: CryptoKey, wrappingKey: CryptoKey): Promise<{ encryptedKey: string; iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Export key to raw bytes
    const keyBytes = await window.crypto.subtle.exportKey('raw', keyToWrap);
    const keyBuffer = new Uint8Array(keyBytes);

    // Encrypt the key bytes
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv as any,
        },
        wrappingKey,
        keyBuffer as any
    );

    return {
        encryptedKey: bytesToBase64(new Uint8Array(encryptedBuffer)),
        iv: bytesToBase64(iv),
    };
}

// 7. Unwrap Key (Decrypt ItemKey with MasterKey)
export async function unwrapKey(encryptedKeyBase64: string, ivBase64: string, unwrappingKey: CryptoKey): Promise<CryptoKey> {
    const iv = base64ToBytes(ivBase64);
    const encryptedBytes = base64ToBytes(encryptedKeyBase64);

    const decryptedBytes = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv as any,
        },
        unwrappingKey,
        encryptedBytes as any
    );

    return window.crypto.subtle.importKey(
        'raw',
        decryptedBytes,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
    );
}

// Helper for generating random salt
export function generateSalt(length = 16): string {
    const random = window.crypto.getRandomValues(new Uint8Array(length));
    return bytesToBase64(random);
}
