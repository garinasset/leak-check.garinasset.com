/**
 * 客户端和服务端共用的加密/解密工具
 * 使用 AES-256-GCM 算法
 */

// 密钥盐，从环境变量获取，默认值为示例
const ENCRYPTION_KEY_LEAK_CHECK = process.env.ENCRYPTION_KEY_LEAK_CHECK || "leak-check-encryption-key";

/**
 * 使用 SHA-256 从盐值生成固定的密钥
 */
async function deriveKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ENCRYPTION_KEY_LEAK_CHECK);

  // 使用 SHA-256 哈希生成密钥
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // 导入为可用的 AES 密钥
  return crypto.subtle.importKey("raw", hashBuffer, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * 加密数据（客户端使用）
 */
export async function encryptData(plaintext: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 获取密钥
    const key = await deriveKey();

    // 加密数据
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
    throw new Error(`加密失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 解密数据（服务端使用）
 */
export async function decryptData(encryptedBase64: string): Promise<string> {
  try {
    // Base64 解码
    const binaryString = atob(encryptedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 分离 IV 和加密数据
    const iv = bytes.slice(0, 12);
    const encryptedData = bytes.slice(12);

    // 获取密钥
    const key = await deriveKey();

    // 解密数据
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
      `解密失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
