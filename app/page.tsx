import { getPersonData, getPersonRecordCount, normalizeQuery } from "../lib/person";
import { restoreData } from "../lib/crypto";
import Footer from "../components/Footer";
import SearchForm from "../components/SearchForm";
import Logo from "../components/Logo";

import { headers } from "next/headers";

async function searchPerson(formData: FormData) {
  "use server";

  const obfuscatedQuery = formData.get("q_obfuscated")?.toString();

  if (!obfuscatedQuery) {
    return {
      error: "缺少混淆查询参数",
      status: 400,
    };
  }

  let queryRaw = "";

  try {
    queryRaw = await restoreData(obfuscatedQuery);
  } catch {
    return {
      error: "还原失败",
      status: 400,
    };
  }

  const query = normalizeQuery(queryRaw);
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
      error instanceof Error ? error.message : "接口请求遇到未知异常。";

    if (errorMessage === "PERSON_QUERY_TIMEOUT") {
      return { error: "接口请求被限定在4秒内, 当前已超时" };
    }

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
        <Logo />
      </div>

      <div className="flex w-full flex-1 min-h-0 items-stretch px-2">
        <SearchForm searchAction={searchPerson} recordCount={recordCount} />
      </div>


      <Footer>
        <div>
          <a href="https://github.com/garinasset/leak-check" target="_blank"
            rel="noopener">
            <span className="font-normal">安全 : </span><span className="font-bold">开放源代码</span>
          </a>
        </div>
        <div>
          <a href="mailto:contact@garinasset.com">
            <span className="font-normal">联系我们 : </span><span className="font-bold">Email</span>
          </a>
        </div>
        <div >
          <a href="https://api.garinasset.com" target="_blank"
            rel="noopener">
            <span className="font-normal">应用 & 接口 : </span><span className="font-bold">嘉林数据</span>
          </a>
        </div>
      </Footer>
    </div>
  );
}
