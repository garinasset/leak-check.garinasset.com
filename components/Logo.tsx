"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Logo() {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检测暗色模式
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(darkModeQuery.matches);

    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    darkModeQuery.addEventListener("change", handleDarkModeChange);

    // 检测移动设备
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mobileQuery.matches);

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
    <Image
      src={logoSrc}
      alt="GARINASSET"
      width={128}
      height={128}
      loading="eager"
      priority
      className="max-w-[8em] max-h-[8em] object-contain"
    />
  );
}
