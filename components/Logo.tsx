"use client";

import Image from "next/image";

const CLEAR_SEARCH_FORM_EVENT = "clear-search-form";

export default function Logo() {
  const handleLogoClick = () => {
    window.dispatchEvent(new Event(CLEAR_SEARCH_FORM_EVENT));
  };

  return (
    <button
      type="button"
      onClick={handleLogoClick}
      aria-label="清空查询并恢复初始状态"
      className="group inline-flex items-center"
    >
      <div className="relative w-[128px] h-[128px] overflow-visible">

        {/* 🌞 浅色 */}
        <Image
          src="/logo.png"
          alt="logo"
          sizes="128px"
          fill
          priority
          className="
            object-contain
            transition-transform duration-300
            group-hover:scale-105
            opacity-100 dark:opacity-0
            will-change-transform
          "
        />

        {/* 🌙 深色 */}
        <Image
          src="/logo-dark.png"
          alt="logo"
          sizes="128px"
          fill
          priority
          className="
            object-contain
            transition-transform duration-300
            group-hover:scale-105
            opacity-0 dark:opacity-100
            will-change-transform
          "
        />

      </div>
    </button>
  );
}