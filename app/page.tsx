import { getPersonData, getPersonRecordCount, normalizeQuery } from "../lib/person";
import { decryptData } from "../lib/crypto";
import Footer from "../components/Footer";
import SearchForm from "../components/SearchForm";
import Logo from "../components/Logo";

import { headers } from "next/headers";

async function searchPerson(formData: FormData) {
  "use server";

  // 获取加密数据或原始数据（后向兼容）
  const encryptedQuery = formData.get("q_encrypted")?.toString();
  let queryRaw = formData.get("q")?.toString() ?? "";

  // 如果有加密数据，先解密
  if (encryptedQuery) {
    try {
      queryRaw = await decryptData(encryptedQuery);
    } catch (decryptError) {
      return {
        error: "解密失败",
        status: 400,
      };
    }
  }

  const query = normalizeQuery(queryRaw);

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
        <Logo />

      </div>

      <SearchForm searchAction={searchPerson} recordCount={recordCount} />

      <Footer>
        <div>
          <a href="https://github.com/garinasset/leak-check">
            <span className="font-normal">安全 : </span><span className="font-bold">开放源代码</span>
          </a>
        </div>
        <div>
          <a href="mailto:contact@garinasset.com">
            <span className="font-normal">联系我们 : </span><span className="font-bold">Email</span>
          </a>
        </div>
        <div >
          <a href="https://www.garinasset.com">
          <span className="font-normal">应用 & 接口 : </span><span className="font-bold">嘉林数据</span>
          </a>
        </div>
      </Footer>
    </div>
  );
}
