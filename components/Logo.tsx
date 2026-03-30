"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Logo() {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false
  );

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    darkModeQuery.addEventListener("change", handleDarkModeChange);

    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mobileQuery.addEventListener("change", handleMobileChange);

    return () => {
      darkModeQuery.removeEventListener("change", handleDarkModeChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, []);

  // 移动设备黑暗模式下显示暗色logo，否则显示普通logo
  const logoSrc = isDark && isMobile ? "/logo-dark.png" : "/logo.png";

  return (
    <Link
      href="/"
      className="group inline-flex flex-col items-center gap-2"
    >
      <div className="relative">
        <Image
          src={logoSrc}
          alt="嘉林数据"
          width={128}
          height={128}
          priority
          className="
              object-contain
              transition-all duration-300
              group-hover:scale-105
              group-hover:opacity-90
            "
        />

        {/* subtle glow 光感（高级感关键） */}
        <div
          className="
              absolute inset-0
              rounded-full
              opacity-0
              group-hover:opacity-100
              transition duration-300
              blur-xl
              bg-white/10
            "
        />
      </div>
    </Link>
  );
}
