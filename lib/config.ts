/**
 * 集中配置文件
 * 所有环境变量在这里管理
 * 区分开发环境和生产环境
 */

// ============================================================================
// 🔐 混淆配置 - 用于客户端混淆请求体、服务端还原请求体
// ============================================================================

/**
 * 客户端混淆 key
 * - NEXT_PUBLIC_ 前缀示意 Next.js build 时会内联到客户端代码
 * - 开发环境：使用 .env.local 中的值，或默认值 "leak-check-encryption-key"
 * - 生产环境：通过 PM2 的 env_production 或系统环境变量设置
 * 
 * 💡 为什么 key 会暴露到浏览器？
 *   因为混淆发生在客户端，这个值本来就是前后端共享协议的一部分
 *   它的目标是避免请求体在浏览器网络面板中直接显示明文
 *   它不是服务器秘密，也不替代 HTTPS
 */
export const OBFUSCATION_KEY_LEAK_CHECK =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_OBFUSCATION_KEY) ||
    "leak-check-encryption-key";

// ============================================================================
// 🌐 后端 API 地址配置
// ============================================================================

/**
 * 个人数据查询 API
 * 
 * 开发环境：
 *   - 本地测试地址：http://172.16.1.4/leak-check/dig/masking
 *   - 通过 .env.local 中的 PERSON_BACKEND_URL 覆盖
 * 
 * 生产环境：
 *   - 需要配置生产环境的后端地址
 *   - 通过部署平台环境变量设置 PERSON_BACKEND_URL
 * 
 * 用途：搜索身份证、手机号、邮箱、QQ 等个人信息
 */
export const PERSON_BACKEND_URL =
    process.env.PERSON_BACKEND_URL ?? "http://172.16.1.4/leak-check/dig/masking";

/**
 * 个人数据总数统计 API
 * 
 * 开发环境：
 *   - 本地测试地址：http://172.16.1.4/leak-check/
 *   - 通过 .env.local 中的 PERSON_COUNT_URL 覆盖
 * 
 * 生产环境：
 *   - 需要配置生产环境的统计地址
 *   - 通过部署平台环境变量设置 PERSON_COUNT_URL
 * 
 * 用途：获取数据库中的总记录数（用于首页展示）
 */
export const PERSON_COUNT_URL =
    process.env.PERSON_COUNT_URL ?? "http://172.16.1.4/leak-check/";

// ============================================================================
// 📋 环境信息
// ============================================================================

/**
 * 判断是否为开发环境
 */
export const isDevelopment = process.env.NODE_ENV === "development";

/**
 * 判断是否为生产环境
 */
export const isProduction = process.env.NODE_ENV === "production";

// ============================================================================
// 🔍 配置验证
// ============================================================================

/**
 * 开发环境下的配置日志
 * 仅在开发环境打印，生产环境不显示完整 key
 */
export function logConfig() {
    if (isDevelopment) {
        console.log("🔧 当前配置（开发环境）");
        console.log("  - 客户端混淆 key（首字符）: " + OBFUSCATION_KEY_LEAK_CHECK[0] + "***");
        console.log("  - 后端数据 API: " + PERSON_BACKEND_URL);
        console.log("  - 后端统计 API: " + PERSON_COUNT_URL);
    }
}
