export const FIELDS = [
  "id", "name", "receiver", "nickname", "phone", "address",
  "car", "email", "qq", "weibo", "contact", "company", "source"
];

export const fieldNameMap: Record<string, string> = {
  id: "身份证",
  name: "姓名",
  receiver: "收件人",
  nickname: "昵称",
  phone: "电话",
  address: "地址",
  car: "车辆配置",
  email: "邮箱",
  qq: "QQ 号",
  weibo: "微博",
  contact: "对公称呼",
  company: "单位",
  source: "被泄漏途径",
};

const BACKEND_URL = process.env.PERSON_BACKEND_URL ?? "http://172.16.1.4/breach/dig/masking";
const PERSON_COUNT_URL = process.env.PERSON_COUNT_URL ?? "http://172.16.1.4/breach/";

export function normalizeQuery(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export function isValidPersonQuery(raw: string): boolean {
  const query = normalizeQuery(raw);

  if (!query) {
    return false;
  }

  const isIdCard = /^(?:\d{15}|\d{17}[\dXx])$/.test(query);
  const isPhone = /^1[3-9]\d{9}$/.test(query);
  const isQQ = /^[1-9]\d{4,11}$/.test(query);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);

  return isIdCard || isPhone || isQQ || isEmail;
}

export function formatRecordCount(raw: string): string {
  const digitsOnly = raw.replace(/[^\d]/g, "");

  if (!digitsOnly) {
    return raw.trim();
  }

  return new Intl.NumberFormat("en-US").format(Number(digitsOnly));
}

export async function getPersonRecordCount(): Promise<string | null> {
  const response = await fetch(PERSON_COUNT_URL, {
    method: "GET",
    headers: { accept: "text/plain" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`记录数接口请求失败: ${response.status}`);
  }

  const text = (await response.text()).trim();

  return text ? formatRecordCount(text) : null;
}

export async function getPersonData(q: string): Promise<Record<string, (string | number)[]>> {
  const normalizedQuery = normalizeQuery(q);

  if (!normalizedQuery) return {};

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: normalizedQuery }),
    // 避免在构建时缓存敏感数据
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`后端接口请求失败: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (!data || typeof data !== "object") {
    throw new Error("后端返回数据格式不正确");
  }

  const sanitized: Record<string, (string | number)[]> = {};

  for (const key of FIELDS) {
    const value = data[key];

    if (Array.isArray(value)) {
      sanitized[key] = value
        .filter((item): item is string | number => item !== null && item !== "" && (typeof item === "string" || typeof item === "number"));
    } else if (value === null || value === undefined) {
      sanitized[key] = [];
    } else if (typeof value === "string" || typeof value === "number") {
      sanitized[key] = [value];
    } else {
      sanitized[key] = [];
    }
  }

  return sanitized;
}
