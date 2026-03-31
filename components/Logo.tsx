"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center">
      <div className="relative w-[128px] h-[128px]">

        {/* 🌞 浅色 */}
        <Image
          src="/logo.png"
          alt="logo"
          width={128}
          height={128}
          priority
          className="
        absolute inset-0
        object-contain
        transition-all duration-300
        group-hover:scale-105
        group-hover:opacity-90
        opacity-100 dark:opacity-0
      "
        />

        {/* 🌙 深色 */}
        <Image
          src="/logo-dark.png"
          alt="logo"
          width={128}
          height={128}
          priority
          className="
        absolute inset-0
        object-contain
        transition-all duration-300
        group-hover:scale-105
        group-hover:opacity-90
        opacity-0 dark:opacity-100
      "
        />

      </div>
    </Link>
  );
}