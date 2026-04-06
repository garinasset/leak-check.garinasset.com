import { API_COUNT_URL, API_DIG_URL } from "./config";

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
  car: "车辆",
  email: "邮箱",
  qq: "QQ",
  weibo: "微博",
  contact: "对公称谓",
  company: "单位",
  source: "泄漏链条",
};

const PERSON_QUERY_TIMEOUT_MS = 8000;
const PERSON_QUERY_TIMEOUT_ERROR = "PERSON_QUERY_TIMEOUT";

// 验证规则常量
const VALIDATION_PATTERNS = {
  // 身份证（大陆 + 台湾）
  idCard: /^(?:\d{17}[\dXx]|[A-Z][12]\d{8})$/,

  // 电话（中国大陆 + 国际E.164）
  phone: /^(?:1[3-9]\d{9}|\+\d{6,15})$/,

  // 邮箱
  email: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,

  // QQ（排除电话）
  qq: /^(?!1[3-9]\d{9}$)[1-9]\d{4,10}$/,
} as const;

export type PersonQueryType = "idCard" | "phone" | "email" | "qq" | "unknown";

export function normalizeQuery(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function validateQueryByPattern(query: string, pattern: RegExp): boolean {
  return pattern.test(query);
}

function isValidQQ(query: string): boolean {
  return validateQueryByPattern(query, VALIDATION_PATTERNS.qq) &&
    !(query.length === 11 && query.startsWith("1"));
}

export function isValidPersonQuery(raw: string): boolean {
  const query = normalizeQuery(raw);
  if (!query) return false;

  return validateQueryByPattern(query, VALIDATION_PATTERNS.idCard) ||
    validateQueryByPattern(query, VALIDATION_PATTERNS.phone) ||
    isValidQQ(query) ||
    validateQueryByPattern(query, VALIDATION_PATTERNS.email);
}

export function detectPersonQueryType(query: string): PersonQueryType {
  if (
    validateQueryByPattern(query, VALIDATION_PATTERNS.idCard)
  ) {
    return "idCard";
  }

  if (
    validateQueryByPattern(query, VALIDATION_PATTERNS.phone)
  ) {
    return "phone";
  }

  if (validateQueryByPattern(query, VALIDATION_PATTERNS.email)) {
    return "email";
  }

  if (isValidQQ(query)) {
    return "qq";
  }

  return "unknown";
}


export function formatRecordCount(raw: string): string {
  const digitsOnly = raw.replace(/[^\d]/g, "");

  if (!digitsOnly) {
    return raw.trim();
  }

  return new Intl.NumberFormat("en-US").format(Number(digitsOnly));
}

export async function getPersonRecordCount(realIP?: string): Promise<string | null> {
  const response = await fetch(API_COUNT_URL, {
    method: "GET",
    headers: {
      accept: "text/plain",
      "X-Real-IP": realIP ?? "",
      "X-Forwarded-For": realIP ?? ""
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`服务器顶级维护: ${response.status}`);
  }

  const text = (await response.text()).trim();

  return text ? formatRecordCount(text) : null;
}

export async function getPersonData(
  q: string,
  realIP?: string
): Promise<Record<string, (string | number)[]>> {

  const normalizedQuery = normalizeQuery(q);
  if (!normalizedQuery) return {};

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PERSON_QUERY_TIMEOUT_MS);

  let data: Record<string, unknown>;

  try {
    const response = await fetch(API_DIG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Real-IP": realIP ?? "",
        "X-Forwarded-For": realIP ?? ""
      },
      body: JSON.stringify({ q: normalizedQuery }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`查询失败: ${response.status}`);
    }

    data = (await response.json()) as Record<string, unknown>;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(PERSON_QUERY_TIMEOUT_ERROR);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }

  const sanitized: Record<string, (string | number)[]> = {};

  for (const key of FIELDS) {
    const value = data[key];

    if (Array.isArray(value)) {
      sanitized[key] = value.filter(
        (item): item is string | number =>
          item !== null &&
          item !== "" &&
          (typeof item === "string" || typeof item === "number")
      );
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
