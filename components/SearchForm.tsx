"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { FIELDS, fieldNameMap, isValidPersonQuery, normalizeQuery } from "../lib/person";

interface SearchFormProps {
  searchAction: (formData: FormData) => Promise<{ query?: string; result?: Record<string, (string | number)[]>; error?: string; status?: number }>;
  recordCount?: string | null;
}

export default function SearchForm({ searchAction, recordCount }: SearchFormProps) {
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<Record<string, (string | number)[]>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [is422Error, setIs422Error] = useState(false);
  const [invalidQuery, setInvalidQuery] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [placeholder, setPlaceholder] = useState("输入 身份证 或 手机号 或 邮箱 或 QQ 号");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = normalizeQuery(inputValue);
  const defaultPlaceholder = "输入 身份证 或 手机号 或 邮箱 或 QQ 号";

  const resetFormState = () => {
    formRef.current?.reset();
    setInputValue("");
    setResult({});
    setErrorMessage("");
    setIs422Error(false);
    setInvalidQuery("");
    setPlaceholder(defaultPlaceholder);
    searchBoxRef.current?.classList.remove("shake");
  };

  const showInvalidState = (query: string) => {
    setIs422Error(true);
    setInvalidQuery(query);
    setErrorMessage("");
    setResult({});

    if (searchBoxRef.current) {
      searchBoxRef.current.classList.add("shake");
    }

    const oldInputValue = query;
    setInputValue("");
    setPlaceholder(defaultPlaceholder);

    window.setTimeout(() => {
      setInputValue(oldInputValue);
      setPlaceholder(defaultPlaceholder);
      searchBoxRef.current?.classList.remove("shake");
    }, 1000);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      resetFormState();
      setHasHydrated(true);
    }, 0);

    const handlePageShow = () => {
      resetFormState();
      setHasHydrated(true);
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const nextQuery = normalizedQuery;

    if (!nextQuery) {
      return;
    }

    if (!isValidPersonQuery(nextQuery)) {
      showInvalidState(nextQuery);
      return;
    }

    const formData = new FormData();
    formData.set("q", nextQuery);

    setErrorMessage("");
    setIs422Error(false);
    setInvalidQuery("");
    setResult({});

    startTransition(async () => {
      try {
        const response = await searchAction(formData);

        if (response.status === 422) {
          showInvalidState(nextQuery);
        } else if (response.error) {
          setErrorMessage(response.error);
        } else if (response.result) {
          setResult(response.result);
        } else {
          setErrorMessage("查询无结果");
        }
      } catch {
        setErrorMessage("查询失败，请稍候再试。");
      }
    });
  };

  const syncInputValue = (value: string) => {
    setInputValue(value);
    // 清除422错误状态、shake 动画和错误 placeholder
    if (is422Error) {
      setIs422Error(false);
      setInvalidQuery("");
      setPlaceholder(defaultPlaceholder);
      if (searchBoxRef.current) {
        searchBoxRef.current.classList.remove("shake");
      }
    }
  };

  const filteredFields = FIELDS.filter(
    (field) => Array.isArray(result[field]) && result[field].length > 0
  );

  return (
    <>
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

      <form ref={formRef} autoComplete="off" noValidate className="flex flex-col items-center w-full mb-12" onSubmit={handleSubmit}>
        <div className="w-full max-w-[43em] px-2 mb-4 text-center">
          <div className="mt-1 text-sm leading-6 font-medium tracking-[0.08em] text-[#94a3b8]">
            {recordCount ? (
              <>
                搜索{" "}
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

        <div className="w-full max-w-[43em] px-2">
          <div ref={searchBoxRef} className={`flex items-center min-h-[3.375em] rounded-[1.75em] border border-[#d5d9e2] bg-white px-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] ${is422Error ? "shake border-[#e67b55]" : ""}`}>
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
              className="flex-1 bg-transparent border-none outline-none text-[#0f172a] placeholder-[#94a3b8] text-base px-3"
              placeholder={placeholder}
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

        <div className="flex justify-center flex-wrap mt-4 w-full max-w-[43em]">
          <button
            type="submit"
            disabled={!hasHydrated || isPending || !normalizedQuery}
            suppressHydrationWarning
            className="rounded-full border border-[#d0d7e2] bg-[#111827] text-white font-medium text-sm px-5 py-2 min-w-[5.5rem] h-10 hover:bg-[#1f2937] hover:border-[#111827] transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onTouchStart={() => { }}
            onTouchEnd={() => { }}
          >
            {isPending ? "搜索中..." : "搜索"}
          </button>
        </div>
      </form>

      <div className="w-full px-4 pb-8 flex justify-center">
        {errorMessage && (
          <div className="w-full max-w-[43em] mb-4 rounded-3xl border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-[#b42318] text-sm shadow-[0_10px_24px_rgba(190,24,93,0.08)]">
            {errorMessage}
          </div>
        )}

        {is422Error && !isPending ? (
          <div className="w-full max-w-[43em] rounded-[2rem] border border-[#fed7aa] bg-[#fff7ed] px-6 py-10 text-center shadow-[0_16px_40px_rgba(245,158,11,0.08)]">
            <div className="text-[#c2410c] text-[0.72rem] tracking-[0.35em] uppercase">Input Status</div>
            <div className="mt-4 text-[#ea580c] text-[2.75rem] leading-none font-bold sm:text-[4rem]">INVALID</div>
            <div className="mt-4 text-[#7c2d12] text-base sm:text-lg">
              需要输入 身份证 或 手机号 或 邮箱 或 QQ 号
            </div>
            <div className="mt-5 rounded-2xl border border-[#fed7aa] bg-white px-4 py-3 text-sm text-[#9a3412] break-all">
              当前输入：<span className="text-[#c2410c]">{invalidQuery}</span>
            </div>
            <div className="mt-4 text-sm text-[#9a3412]/70">
              请确认您的输入内容 是否包含特殊字符 或 多余空格
            </div>
          </div>
        ) : Object.keys(result).length === 0 && !isPending ? null : filteredFields.length === 0 && !isPending ? (
          <div className="w-full max-w-[43em] rounded-[2rem] border border-[#dbe3ef] bg-[#f8fafc] px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-[#64748b] text-[0.72rem] tracking-[0.35em] uppercase">Scan Result</div>
            <div className="mt-4 text-[#0f172a] text-[4rem] leading-none font-bold sm:text-[5rem]">SAFE</div>
            <div className="mt-3 text-[#475569] text-base sm:text-lg">未发现泄漏信息</div>
          </div>
        ) : (
          <div className="w-full max-w-[52rem] py-3">
            <div className="overflow-hidden rounded-[2rem] border border-[#dbe3ef] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="border-b border-[#e7edf5] px-6 py-5 text-center">
                <div className="text-[#64748b] text-[0.72rem] tracking-[0.35em] uppercase">Search Result</div>
                <div className="mt-2 text-[#0f172a] text-2xl font-semibold">搜索结果</div>
                <div className="mt-2 text-sm text-[#64748b] break-all">
                  查询内容：<span className="text-[#0f172a]">{normalizedQuery}</span>
                </div>
              </div>

              <table className="w-full table-fixed border-collapse">
                <tbody>
                  {filteredFields.map((field, idx) => {
                    const items = result[field] ?? [];
                    return (
                      // text-[#94a3b8] text-red-400 text-[#0f172a] text-red-400 text-[#e11d48]
                      <tr key={idx} className="border-t border-[#d9e1ea] first:border-t-0 ">
                        <th className="w-1/2 border-r border-[#d9e1ea] px-6 text-right align-middle text-[0.9rem] tracking-[0.08em] text-[#0f172a]">
                          {fieldNameMap[field] || field}
                        </th>
                        <td className="w-1/2 px-6 py-3 text-left align-middle text-[0.9rem] leading-5 text-[#0f172a]">
                          <div className="space-y-2">
                            {items.map((item: string | number, i: number) => (
                              <div key={i} className="break-words">
                                {item}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
