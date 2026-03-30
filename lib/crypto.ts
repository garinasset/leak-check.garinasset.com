/**
 * 客户端和服务端共用的混淆/还原工具
 * 使用 AES-256-GCM 算法
 * 
 * ⭐ 注意: key 来自 lib/config.ts 中的 OBFUSCATION_KEY_LEAK_CHECK
 * - 在 npm run build 时， Next.js 会自动识别并内联到客户端代码
 * - 意味着 key 会暴露到浏览器，因为这里的目标是请求体混淆而非保密
 */

import { OBFUSCATION_KEY_LEAK_CHECK } from "./config";

/**
 * 使用 SHA-256 从混淆 key 生成固定长度的密钥材料
 */
async function deriveKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(OBFUSCATION_KEY_LEAK_CHECK);

    // 使用 SHA-256 哈希生成固定长度的密钥材料
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // 导入为可用的 AES 密钥
    return crypto.subtle.importKey("raw", hashBuffer, "AES-GCM", false, [
        "encrypt",
        "decrypt",
    ]);
}

/**
 * 混淆数据（客户端使用）
 */
export async function obfuscateData(plaintext: string): Promise<string> {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // 生成随机 IV
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // 获取密钥
        const key = await deriveKey();

        // 混淆数据
        const encryptedData = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );

        // 合并 IV 和加密数据，然后 Base64 编码
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);

        // 转为 Base64 字符串
        const binaryString = String.fromCharCode.apply(null, Array.from(combined));
        return btoa(binaryString);
    } catch (error) {
        throw new Error(`混淆失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 还原数据（服务端使用）
 */
export async function restoreData(obfuscatedBase64: string): Promise<string> {
    try {
        // Base64 解码
        const binaryString = atob(obfuscatedBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 分离 IV 和加密数据
        const iv = bytes.slice(0, 12);
        const encryptedData = bytes.slice(12);

        // 获取密钥
        const key = await deriveKey();

        // 还原数据
        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            encryptedData
        );

        // 转为字符串
        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        throw new Error(
            `还原失败: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}