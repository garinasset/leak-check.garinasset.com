type HeaderReader = {
  get(name: string): string | null;
};

const CLIENT_IP_HEADER_CANDIDATES = [
  "cf-connecting-ip",
  "true-client-ip",
  "x-vercel-forwarded-for",
  "x-forwarded-for",
  "x-real-ip",
];

function extractSingleIp(value: string): string {
  return value.split(",")[0]?.trim() ?? "";
}

export function getRequestClientIp(headerList: HeaderReader): string {
  for (const headerName of CLIENT_IP_HEADER_CANDIDATES) {
    const rawValue = headerList.get(headerName);
    if (!rawValue) continue;

    const ip = extractSingleIp(rawValue);
    if (ip && ip.toLowerCase() !== "unknown") {
      return ip;
    }
  }

  return "";
}