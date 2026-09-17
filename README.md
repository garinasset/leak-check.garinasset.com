# [厘查](https://leak-check.garinasset.com)

> 基于 Next.js 的 leak-check 官方应用, 背后由 嘉林数据 驱动.

## 🧩 技术栈

| 技术 | 作用 |
| --- | --- |
| [![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/) | Web 应用框架，负责应用页面与服务端能力 |
| [![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/) | JavaScript 运行环境，为应用提供服务端运行能力 |
| [![NVM](https://img.shields.io/badge/NVM-000000?logo=nvm&logoColor=white)](https://github.com/nvm-sh/nvm) | Node.js 版本管理，解决不同项目的 Node.js 版本隔离问题 |
| [![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)](https://docs.npmjs.com/) | 依赖管理与项目构建，统一管理 Node.js 项目依赖 |
| [![PM2](https://img.shields.io/badge/PM2-2B037A?logo=pm2&logoColor=white)](https://pm2.io/) | Node.js 进程管理，负责应用常驻、重启、日志与零停机 Reload |
| [![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/) | 代码托管与版本管理 |
| [![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://docs.github.com/en/actions) | CI/CD 自动化，将代码变更自动部署到生产服务器 |
| [![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white)](https://nginx.org/) | 反向代理与 HTTPS 入口，将域名请求转发至应用进程 |
| [![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com/) | DNS、HTTPS 与负载均衡，连接用户与多台生产服务器 |

## 🚀 部署设计

**GitHub → GitHub Actions → SSH → 服务器集群 → PM2 → Nginx → Cloudflare**

采用 **GitHub Actions + SSH** 实现自动部署，服务器集群保持相同的应用环境，由 PM2 管理 Node.js 进程，Nginx 提供 Web 入口，Cloudflare Load Balancing 负责多节点流量调度。

## 🔗 应用

[https://leak-check.garinasset.com/](https://leak-check.garinasset.com)

## 📚 官方文档

[Next.js](https://nextjs.org/docs) ·
[Node.js](https://nodejs.org/docs) ·
[NVM](https://github.com/nvm-sh/nvm) ·
[npm](https://docs.npmjs.com/) ·
[PM2](https://pm2.io/docs/runtime/overview/) ·
[GitHub Actions](https://docs.github.com/en/actions) ·
[Nginx](https://nginx.org/en/docs/) ·
[Cloudflare Load Balancing](https://developers.cloudflare.com/load-balancing/)