/**
 * PM2 生态系统配置文件 - 示例模板
 * 
 * 使用方法：
 *   1. 复制此文件: cp ecosystem.config.example.js ecosystem.config.js
 *   2. 修改 env_production 中的值
 *   3. pm2 start ecosystem.config.js --env production
 */

module.exports = {
    apps: [
        {
            name: "nextjs-leak-check",
            script: "node_modules/next/dist/bin/next",
            args: "start -p 8001",
            // ========================
            // 进程模式（Next.js 推荐 fork）
            // ========================
            exec_mode: "fork",
            instances: 1,

            // ============================================================================
            // 🚀 生产环境变量
            // ============================================================================
            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
                // ⚠️ 客户端混淆 key - 改成真实值
                NEXT_PUBLIC_OBFUSCATION_KEY: "your-production-obfuscation-key",
                // ⚠️ 生产后端地址 - 改成真实值
                PERSON_BACKEND_URL: "https://api.example.com/leak-check/dig/masking",
                PERSON_COUNT_URL: "https://api.example.com/leak-check/",
            },

            // ============================================================================
            // 📋 PM2 配置选项
            // ============================================================================
            error_file: "./logs/err.log",
            out_file: "./logs/out.log",
            log_file: "./logs/combined.log",
            time: true,

            // 应用崩溃时自动重启
            autorestart: true,

            // 最多重启 10 次
            max_restarts: 10,

            // 重启之间的间隔时间（毫秒）
            min_uptime: "10s",

            // 生产环境不监听文件变更
            watch: false,

        },
    ],
};
