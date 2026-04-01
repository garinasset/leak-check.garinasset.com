import Image from "next/image";
import { normalizeQuery } from "../lib/person";

interface QueryTypeDisplayProps {
    query: string;
}

export default function QueryTypeDisplay({ query }: QueryTypeDisplayProps) {
    const normalized = normalizeQuery(query);

    let content: React.ReactNode = null;

    // 身份证（大陆 + 台湾）
    if (
        /^\d{17}[\dXx]$/.test(normalized) ||   // 中国大陆
        /^[A-Z][12]\d{8}$/.test(normalized)    // 台湾身份证
    ) {
        content = "🪪";
    }

    // 手机号（国内 11位 + 国际）
    else if (
        /^1[3-9]\d{9}$/.test(normalized) ||     // 中国大陆（11位）
        /^\+\d{6,15}$/.test(normalized)        // 国际手机号
    ) {
        content = "📞";
    }

    // 邮箱
    else if (/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(normalized)) {
        content = "✉️";
    }

    // QQ（已修复 + 排除手机号 + 更严格）
    else if (
        /^[1-9]\d{4,10}$/.test(normalized) &&   // 5-11位数字
        !/^1[3-9]\d{9}$/.test(normalized)       // 排除手机号（核心修复）
    ) {
        content = (
            <Image
                src="/qq.svg"
                alt="QQ"
                width={16}
                height={16}
            />
        );
    }
    // 未知
    else {
        content = (
            <Image
                src="/unknow.svg"
                alt="未知"
                width={16}
                height={16}
            />
        );
    }

    // ✅ 🔥 统一容器（关键）
    return (
        <div className="w-5 h-5 flex items-center justify-center">
            {typeof content === "string" ? (
                <span className="text-base leading-none">{content}</span>
            ) : (
                content
            )}
        </div>
    );
}
