import Image from "next/image";
import { normalizeQuery } from "../lib/person";

interface QueryTypeDisplayProps {
    query: string;
}

export default function QueryTypeDisplay({ query }: QueryTypeDisplayProps) {
    const normalized = normalizeQuery(query);

    let content: React.ReactNode = null;

    // 身份证
    if (/^\d{17}[\dXx]$/.test(normalized)) {
        content = "🪪";
    }
    // 手机号
    else if (/^1[3-9]\d{9}$/.test(normalized)) {
        content = "📞";
    }
    // 邮箱
    else if (/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(normalized)) {
        content = "✉️";
    }
    // QQ
    else if (
        /^[1-9]\d{4,10}$/.test(normalized) &&
        !(normalized.length === 11 && normalized.startsWith("1"))
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
