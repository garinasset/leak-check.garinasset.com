
// ================================
// 🚀 强制 env 读取（生产安全）
// ================================
function mustGetEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`❌ Missing environment variable: ${name}`);
  }

  return value;
}

// ================================
// 🔐 加密混淆 key（现在也强制）
// ================================
export const NEXT_PUBLIC_OBFUSCATION_KEY = mustGetEnv(
  "NEXT_PUBLIC_OBFUSCATION_KEY"
);

// ================================
// 🌐 API（服务端专用）
// ================================
export const API_COUNT_URL = mustGetEnv("API_COUNT_URL");
export const API_DIG_URL = mustGetEnv("API_DIG_URL");