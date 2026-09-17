import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '厘查 - 嘉林数据',
    template: '%s | 信息安全检测',
  },

  description:
    '厘查 可以快速检测个人信息是否存在数据泄露风险, 支持身份证、电话、邮箱、QQ 等多维度检索，用于信息安全检测与隐私风险排查。',

  keywords: [
    '厘查',
    '信息泄露检测',
    '个人信息泄露',
    '数据泄露检测',
    '电话查询',
    '身份证查询',
    '隐私安全',
    '信息安全工具',
  ],

  authors: [{ name: '嘉林数据' }],

  creator: '嘉林数据',

  metadataBase: new URL('https://leak-check.garinasset.com'),

  // iOS / Safari 添加到主屏幕后的名称
  appleWebApp: {
    title: '厘查',
  },

  openGraph: {
    title: '个人信息“泄露”检测工具',
    description:
      '检测你的电话、身份证、邮箱等是否出现在泄露数据库中，快速识别隐私风险。',
    url: 'https://leak-check.garinasset.com',
    siteName: '个人信息泄露检测工具',
    type: 'website',
    locale: 'zh_CN',
  },

  twitter: {
    card: 'summary_large_image',
    title: '个人信息“泄露”检测工具',
    description:
      '检测你的电话、身份证、邮箱等是否出现在泄露数据库中，快速识别隐私风险。',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}