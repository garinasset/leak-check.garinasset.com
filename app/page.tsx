import { getPersonData, getPersonRecordCount, normalizeQuery } from "../lib/person";
import Footer from "../components/Footer";
import SearchForm from "../components/SearchForm";
import Image from "next/image";

import { headers } from "next/headers";

async function searchPerson(formData: FormData) {
  "use server";

  const query = normalizeQuery(
    formData.get("q")?.toString() ?? ""
  );

  // =========================
  // ⭐ 获取真实用户 IP
  // =========================
  const headerList = await headers();

  const realIP =
    headerList.get("x-forwarded-for")?.split(",")[0] ||
    headerList.get("x-real-ip") ||
    "";

  try {
    const result = await getPersonData(query, realIP);

    return { query, result };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "查询失败，请稍候再试。";

    if (errorMessage.includes("422")) {
      return { status: 422 };
    }

    return { error: errorMessage };
  }
}

export default async function HomePage() {
  const headerList = await headers();

  const realIP =
    headerList.get("x-forwarded-for")?.split(",")[0] ||
    headerList.get("x-real-ip") ||
    "";

  const recordCount = await getPersonRecordCount(realIP).catch(() => null);

  return (
    <div className="min-h-screen flex flex-col font-mono">
      <div className="flex flex-col items-center mt-6 mb-4">
        {/* Logo 选择：注释原 Image，选用大字版本 */}

        <Image
          src="/logo.png"
          alt="GARINASSET"
          width={128}
          height={128}
          loading="eager"
          priority
          className="max-w-[8em] max-h-[8em] object-contain"
        />

      </div>

      <SearchForm searchAction={searchPerson} recordCount={recordCount} />

      <Footer>
        <div>
          <a href="#">
            公众利益导向
          </a>
        </div>
        <div>
          <a href="#">
            “不记录”「查询记录」
          </a>
        </div>
        <div>
          <a href="#">
            “不提供” 「敏感信息」
          </a>
        </div>
        <div>
          <a href="https://github.com/garinasset/breach">
            开放源代码
          </a>
        </div>
        <div>
          <a href="mailto:contact@garinasset.com">
            联系我们
          </a>
        </div>
        <div >
          <a href="https://www.garinasset.com">
            嘉林数据
          </a>
        </div>

      </Footer>
    </div>
  );
}
