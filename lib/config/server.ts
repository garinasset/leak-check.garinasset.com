import "server-only";

// ================================
// Force env read
// ================================
function mustGetEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

// ================================
// Server-only API
// ================================
export const API_COUNT_URL = mustGetEnv("API_COUNT_URL");
export const API_DIG_URL = mustGetEnv("API_DIG_URL");
export const FORWARD_CLIENT_IP = process.env.FORWARD_CLIENT_IP !== "false";