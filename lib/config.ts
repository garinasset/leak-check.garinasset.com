// 加密混淆 key
export const NEXT_PUBLIC_OBFUSCATION_KEY =
    process.env.NEXT_PUBLIC_OBFUSCATION_KEY ?? "leak-check";

// API 接口地址
export const API_COUNT_URL =
    process.env.API_COUNT_URL ?? "http://localhost:8000/leak-check/";
export const API_DIG_URL =
    process.env.API_DIG_URL ?? "http://localhost:8000/leak-check/dig/masking";
