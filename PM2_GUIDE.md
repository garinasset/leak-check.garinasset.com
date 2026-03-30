# PM2 使用指南

## 📋 项目使用 PM2 管理生产环境

### 🔧 安装 PM2

```bash
npm install -g pm2
```

---

## 🚀 启动应用

### 生产环境启动

```bash
pm2 start ecosystem.config.js --env production
```

会使用以下环境变量（需在 `ecosystem.config.js` 中自定义）：

```bash
NODE_ENV=production
NEXT_PUBLIC_ENCRYPTION_KEY_LEAK_CHECK=your-production-obfuscation-key
PERSON_BACKEND_URL=https://api.production.com/leak-check/dig/masking
PERSON_COUNT_URL=https://api.production.com/leak-check/
```

### 本地开发

```bash
npm run dev
```

本地开发环境变量来自 `.env.local`。

---

## 📝 如何配置生产环境变量

### 编辑 `ecosystem.config.js`

找到 `env_production` 部分，修改为真实的生产值：

```javascript
env_production: {
  NODE_ENV: "production",
  PORT: 8001,

  // ⚠️ 改成你的客户端混淆 key
  NEXT_PUBLIC_ENCRYPTION_KEY_LEAK_CHECK: "your-real-production-obfuscation-key",

  // ⚠️ 改成你的生产后端地址
  PERSON_BACKEND_URL: "https://api.production.garinasset.com/leak-check/dig/masking",
  PERSON_COUNT_URL: "https://api.production.garinasset.com/leak-check/",
},
```

---

## 🔄 常用 PM2 命令

```bash
# 查看所有应用
pm2 list

# 查看应用详情
pm2 info leak-check

# 查看实时日志
pm2 logs leak-check

# 查看应用监控
pm2 monit

# 重启应用
pm2 restart leak-check

# 重载应用（无停机更新）
pm2 reload leak-check

# 停止应用
pm2 stop leak-check

# 删除应用
pm2 delete leak-check

# 开机自启（Linux/Mac）
pm2 startup
pm2 save
```

---

## 📌 总结

| 环境 | 配置位置 | 启动命令 |
|-----|--------|--------|
| **本地开发** | `.env.local` | `npm run dev` |
| **生产环境** | `ecosystem.config.js` (`env_production`) | `pm2 start ecosystem.config.js --env production` |

**✅ 现在配置生产环境的方式：**
1. 编辑 `ecosystem.config.js` 中的 `env_production` 部分
2. 改成真实的客户端混淆 key 和后端地址
3. 运行 `pm2 start ecosystem.config.js --env production`

完成！
