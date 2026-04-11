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
