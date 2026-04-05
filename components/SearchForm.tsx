"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { FIELDS, fieldNameMap, isValidPersonQuery, normalizeQuery } from "../lib/person";
import { obfuscateData } from "../lib/crypto";
import QueryTypeDisplay from "./QueryTypeDisplay";

interface SearchFormProps {
  searchAction: (formData: FormData) => Promise<{ query?: string; result?: Record<string, (string | number)[]>; error?: string; status?: number }>;
  recordCount?: string | null;
}

const DEFAULT_PLACEHOLDER = "输入 身份证 或 电话 或 邮箱 或 QQ 号";
const DEFAULT_RESULT_MESSAGE = "你有权了解你的数据处于何种状态。";
const SHAKE_DURATION = 1000;

export default function SearchForm({ searchAction, recordCount }: SearchFormProps) {
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<Record<string, (string | number)[]>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [is422Error, setIs422Error] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [userIsEditing, setUserIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = normalizeQuery(inputValue);

  // 清除所有查询状态
  const clearQueryState = () => {
    setErrorMessage("");
    setIs422Error(false);
    setResult({});
  };

  const showInvalidState = () => {
    setIs422Error(true);
    setErrorMessage("");
    setResult({});
    setUserIsEditing(false);

    if (searchBoxRef.current) {
      searchBoxRef.current.classList.add("shake");
      setTimeout(() => {
        searchBoxRef.current?.classList.remove("shake");
      }, SHAKE_DURATION);
    }
  };

  useEffect(() => {
    const initForm = () => {
      formRef.current?.reset();
      setInputValue("");
      setErrorMessage("");
      setIs422Error(false);
      setResult({});
      setHasHydrated(true);
      setUserIsEditing(false);
      searchBoxRef.current?.classList.remove("shake");
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        initForm();
      }
    };
    const timer = window.setTimeout(initForm, 0);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!normalizedQuery) return;

    if (!isValidPersonQuery(normalizedQuery)) {
      showInvalidState();
      return;
    }

    clearQueryState();
    setUserIsEditing(false);

    startTransition(async () => {
      // =========================
      // ⏱️ 通用：带超时 fetch
      // =========================
      const fetchWithTimeout = async (url: string | URL | Request, options = {}, timeout = 4000) => {
        const controller = new AbortController();

        const timer = setTimeout(() => controller.abort(), timeout);

        try {
          return await fetch(url, {
            ...options,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timer);
        }
      };

      // ================================
      // 🌐 网络风险检测（DNS / 重启 / 断网）
      // ================================
      async function detectNetworkRisk() {
        try {
          const results = await Promise.allSettled([
            fetchWithTimeout("https://leak-check.garinasset.com/health", {
              cache: "no-store",
            }),

            fetchWithTimeout("https://dev.garinasset.com/", {
              cache: "no-store",
            }),

            fetchWithTimeout("https://www.cloudflare.com/cdn-cgi/trace", {
              mode: "no-cors",
              cache: "no-store",
            }),
          ]);

          const mainFail = results[0].status === "rejected";
          const backupFail = results[1].status === "rejected";
          const cfFail = results[2].status === "rejected";
          // 
          // 典型：主挂 + 备正常 + CF正常 → 可疑劫持
          if (mainFail && !backupFail && !cfFail) {
            return "HIJACK_SUSPECTED";
          }

          // 主 + 备都挂，但CF正常 → 服务器维护
          if (mainFail && backupFail && !cfFail) {
            return "SERVER_MAINTENANCE";
          }

          // CF挂 → 网络断开
          if (cfFail) {
            return "NETWORK_DOWN";
          }

          return "OK";
        } catch {
          return "UNKNOWN";
        }
      }

      // =========================
      // 🧩 主逻辑
      // =========================
      try {
        const obfuscatedQuery = await obfuscateData(normalizedQuery);

        const formData = new FormData();
        formData.set("q_obfuscated", obfuscatedQuery);

        const response = await searchAction(formData);

        // =========================
        // 1️⃣ HTTP / 状态层错误
        // =========================
        if (response?.status === 422) {
          showInvalidState();
          return;
        }

        if (response?.status === 429) {
          setErrorMessage("⚠️ 请求过于频繁, 后续请求会被降级");
          return;
        }

        if (response?.status && response.status >= 500) {
          setErrorMessage("🛠️ 服务器异常，请稍后再试");
          return;
        }

        // =========================
        // 2️⃣ 业务错误层
        // =========================
        if (response?.error) {
          setErrorMessage(`🚧 ${response.error}`);
          return;
        }

        // =========================
        // 3️⃣ 成功层
        // =========================
        if (response?.result !== undefined) {
          setResult(response.result);
          return;
        }

        // =========================
        // 4️⃣ 结构异常兜底（唯一入口）
        // =========================
        setErrorMessage("⚠️ 未识别的响应结构, 请点击 查询 重试.");

      } catch {

        setErrorMessage("🛠️ 正在进行异常自检，这可能需要一段时间.");
        // =========================
        // 🌐 网络层异常处理
        // =========================
        const risk = await detectNetworkRisk();

        if (risk === "HIJACK_SUSPECTED") {
          setErrorMessage(
            "🌐 识别到 DNS 异常: 这可能是您的 DNS 被运营商 间断性 劫持."
          );
          return;
        }

        if (risk === "SERVER_MAINTENANCE") {
          setErrorMessage(
            "⚠️ 识别到服务器正在冷维护, 可能很快, 也可能很慢, 稍后相见."
          );
          return;
        }

        if (risk === "NETWORK_DOWN") {
          setErrorMessage("🌐 识别到网络抖动, 请点击 查询 重试.");
          return;
        }

        if (risk === "UNKNOWN") {
          setErrorMessage("⚠️ 识别到未定义的网络探针异常, 请 刷新页面 重试.");
          return;
        }

        setErrorMessage("🕳️ 识别到服务器正常, 但网络抖动, 请点击 查询 重试.");
      }
    });
  };


  const syncInputValue = (value: string) => {
    setInputValue(value);
    setUserIsEditing(true);
    clearQueryState();
    searchBoxRef.current?.classList.remove("shake");
  };

  const filteredFields = FIELDS.filter(
    (field) => Array.isArray(result[field]) && result[field].length > 0
  );
  const queryHeader = (
    <div className="flex flex-col items-center space-y-2 mb-6">
      <QueryTypeDisplay query={normalizedQuery} />
      <div className="font-bold break-all text-[0.75rem] underline decoration-dashed result-text-color">
        {normalizedQuery}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 w-full flex-1 self-stretch flex-col">
      <style>{`
        .shake {
            animation: shake 0.35s ease;
        }

        @keyframes shake {
            0% {
                transform: translateX(0);
            }

            20% {
                transform: translateX(-4px);
            }

            40% {
                transform: translateX(4px);
            }

            60% {
                transform: translateX(-3px);
            }

            80% {
                transform: translateX(3px);
            }

            100% {
                transform: translateX(0);
            }
        }
      `}</style>

      <form ref={formRef} autoComplete="off" noValidate className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
        <div className="w-full max-w-[43em] mx-auto mb-4 px-2 text-center">
          <div className="text-sm leading-6 font-medium tracking-[0.08em] text-[#94a3b8]">
            {recordCount ? (
              <>
                检查{" "}
                <span className="text-[var(--foreground)]">
                  {recordCount}
                </span>{" "}
                泄漏记录
              </>
            ) : (
              "搜索 -- 泄漏记录"
            )}
          </div>
        </div>

        <div className="w-full max-w-[43em] mx-auto px-2">
          <div ref={searchBoxRef} className={`flex items-center min-h-[3.375em] rounded-[1.75em] border border-[#d5d9e2] bg-background px-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] ${is422Error ? "shake border-[#e67b55]" : ""}`}>
            <svg
              className="text-[#64748b] w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              name="q"
              value={inputValue}
              onChange={(e) => syncInputValue(e.currentTarget.value)}
              className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] placeholder-[#94a3b8] text-base px-2"
              placeholder={DEFAULT_PLACEHOLDER}
              autoComplete="off"
              data-form-type="other"
              disabled={isPending}
              required
              autoCorrect="off"
              inputMode="search"
              enterKeyHint="search"
              spellCheck="false"
            />
          </div>
        </div>

        <div className="flex justify-center flex-wrap mt-4 w-full max-w-[43em] mx-auto">
          <button
            type="submit"
            disabled={!hasHydrated || isPending || !normalizedQuery}
            suppressHydrationWarning
            className="rounded-full border border-[#d0d7e2] bg-[#111827] text-white font-medium text-sm px-5 py-2 min-w-[5.5rem] h-10 hover:bg-[#1f2937] hover:border-[#111827] transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onTouchStart={() => { }}
            onTouchEnd={() => { }}
          >
            {isPending ? "查询中" : "查询"}
          </button>
        </div>
      </form>

      <div className="mt-6 flex min-h-0 w-full flex-1 flex-col">
        {errorMessage ? (
          <div className="w-full max-w-[43em] mx-auto">
            {queryHeader}
            <div className="flex justify-center">
              <div className="bg-red-600 mt-4 text-white px-4 py-2 rounded-full text-xs font-bold">
                <span>{errorMessage}</span>
              </div>
            </div>
          </div>
        ) : userIsEditing && inputValue ? (
          <div className="w-full max-w-[43em] mx-auto">
            {queryHeader}
          </div>
        ) : is422Error && inputValue ? (
          <div className="w-full max-w-[43em] mx-auto">
            {queryHeader}
            <div className="flex justify-center">
              <div className="bg-red-600 mt-4 text-white px-4 py-2 rounded-full text-xs font-bold">
                <span>⛔️ 需要输入 身份证 或 电话 或 邮箱 或 QQ 号</span>
              </div>
            </div>
          </div>
        ) : Object.keys(result).length === 0 && !isPending ? (
          <div className="w-full max-w-[43em] mx-auto mt-auto">
            <p className="text-xs result-text-color font-light text-center">
              {DEFAULT_RESULT_MESSAGE}
            </p>
          </div>
        ) : filteredFields.length === 0 && !isPending ? (
          <div className="w-full max-w-[43em] mx-auto">
            {queryHeader}
            <div className="flex justify-center">
              <div className="bg-green-600 mt-4 text-white px-4 py-2 rounded-full text-xs font-bold">
                <span>🔒 安全: 未检测到个人信息 “泄漏”</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[43em] mx-auto px-2">
            {queryHeader}
            <div className="mt-6">
              <div className="space-y-px">
                {filteredFields.map((field, idx) => {
                  const items = result[field] ?? [];
                  const isLastRow = idx === filteredFields.length - 1;
                  return (
                    <div key={idx} className={`flex w-full border-color ${!isLastRow ? 'border-b ' : ''}`}>
                      {/* 第一列：字段名 - 右对齐 */}
                      <div className="w-1/2 font-normal text-[0.75rem] px-4 py-3 result-name-color flex items-center justify-end border-r border-color min-w-0">
                        {fieldNameMap[field] || field}
                      </div>
                      {/* 第二列：字段值 - 左对齐 */}
                      <div className="w-1/2 flex flex-col gap-2 px-4 py-3 justify-start min-w-0">
                        {items.map((item: string | number, i: number) => (
                          <div
                            key={i}
                            className="font-bold break-all text-[0.75rem] result-text-color"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
