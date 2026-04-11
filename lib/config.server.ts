import "server-only";

// ================================
// 🚀 强制 env 读取
// ================================
function mustGetEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`❌ Missing environment variable: ${name}`);
  }

  return value;
}

// ================================
// 🌐 Server-only API
// ================================
export const API_COUNT_URL = mustGetEnv("API_COUNT_URL");
export const API_DIG_URL = mustGetEnv("API_DIG_URL");