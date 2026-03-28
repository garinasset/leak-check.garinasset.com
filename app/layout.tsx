import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '个人信息 “泄露” 检查工具 - 嘉林数据',
    template: '%s | 信息安全查询',
  },

  description:
    '快速查询个人信息是否存在数据泄露风险, 支持身份证、手机号、邮箱、QQ 等多维度检索，用于信息安全检测与隐私风险排查。',

  keywords: [
    '信息泄露查询',
    '个人信息泄露',
    '数据泄露检测',
    '手机号查询',
    '身份证查询',
    '隐私安全',
    '信息安全工具',
    '黑产数据检测',
  ],

  authors: [{ name: '嘉林资产' }],

  creator: '嘉林资产',

  metadataBase: new URL('https://breach.garinasset.com'),

  openGraph: {
    title: '个人信息泄露检查工具',
    description:
      '检测你的手机号、身份证、邮箱等是否出现在泄露数据库中，快速识别隐私风险。',
    url: 'https://breach.garinasset.com',
    siteName: '个人信息泄露检查工具',
    type: 'website',
    locale: 'zh_CN',
  },

  twitter: {
    card: 'summary_large_image',
    title: '个人信息泄露检查工具',
    description: '快速检测个人信息是否泄露',
  },

  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
