import "server-only";

import { API_COUNT_URL, API_DIG_URL } from "./config.server";
import { FIELDS, normalizeQuery } from "./person";

const PERSON_QUERY_TIMEOUT_MS = 8000;
const PERSON_QUERY_TIMEOUT_ERROR = "PERSON_QUERY_TIMEOUT";

function formatRecordCount(raw: string): string {
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
      "X-Forwarded-For": realIP ?? "",
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
        "X-Forwarded-For": realIP ?? "",
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
