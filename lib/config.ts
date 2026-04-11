// 加密混淆 key
export const NEXT_PUBLIC_OBFUSCATION_KEY =
    process.env.NEXT_PUBLIC_OBFUSCATION_KEY ?? "leak-check";

// API（服务端专用）
export const API_COUNT_URL =
    process.env.API_COUNT_URL;

export const API_DIG_URL =
    process.env.API_DIG_URL;

// 🚨 强制检查（避免生产 silent bug）
if (typeof window === "undefined") {
    if (!API_COUNT_URL) {
        throw new Error("Missing env: API_COUNT_URL");
    }

    if (!API_DIG_URL) {
        throw new Error("Missing env: API_DIG_URL");
    }
}