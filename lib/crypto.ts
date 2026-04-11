import { NEXT_PUBLIC_OBFUSCATION_KEY } from "./config.client";

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let keyPromise: Promise<CryptoKey> | undefined;

function getWebCrypto(): Crypto {
    if (!globalThis.crypto?.subtle) {
        throw new Error("当前环境不支持 Web Crypto");
    }

    return globalThis.crypto;
}

async function deriveKey(): Promise<CryptoKey> {
    const crypto = getWebCrypto();
    const data = encoder.encode(NEXT_PUBLIC_OBFUSCATION_KEY);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    return crypto.subtle.importKey("raw", hashBuffer, ALGORITHM, false, [
        "encrypt",
        "decrypt",
    ]);
}

function getKey(): Promise<CryptoKey> {
    keyPromise ??= deriveKey();
    return keyPromise;
}

function toBase64(bytes: Uint8Array): string {
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

export async function obfuscateData(plaintext: string): Promise<string> {
    try {
        const crypto = getWebCrypto();
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        const key = await getKey();
        const encryptedData = await crypto.subtle.encrypt(
            { name: ALGORITHM, iv },
            key,
            encoder.encode(plaintext)
        );

        const payload = new Uint8Array(iv.length + encryptedData.byteLength);
        payload.set(iv);
        payload.set(new Uint8Array(encryptedData), iv.length);

        return toBase64(payload);
    } catch (error) {
        throw new Error(
            `混淆失败: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

export async function restoreData(obfuscatedBase64: string): Promise<string> {
    try {
        const crypto = getWebCrypto();
        const payload = fromBase64(obfuscatedBase64);

        if (payload.length <= IV_LENGTH) {
            throw new Error("密文格式无效");
        }

        const iv = payload.slice(0, IV_LENGTH);
        const encryptedData = payload.slice(IV_LENGTH);
        const key = await getKey();
        const decryptedData = await crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            encryptedData
        );

        return decoder.decode(decryptedData);
    } catch (error) {
        throw new Error(
            `还原失败: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
