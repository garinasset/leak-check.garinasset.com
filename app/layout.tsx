import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '厘查 - 嘉林数据',
    template: '%s | 信息安全检测',
  },

  description:
    '厘查 可以快速查询个人信息在信息安全事故中的泄漏状况, 支持通过身份证、手机号、电话、邮箱、QQ号 进行查询。我们注重信息隐私安全, 因此信息查询会以密文传输, 而查询结果则会脱敏呈现。',

  keywords: [
    '厘查',
    '信息泄露查询',
    '个人信息查询',
    '数据泄露查询',
    '手机号查询',
    '电话查询',
    '身份证查询',
    'QQ号查询',
    '邮箱查询',
    '信息安全工具',
    '隐私安全检测',
  ],

  authors: [{ name: '嘉林数据' }],

  creator: '嘉林数据',

  metadataBase: new URL('https://leak-check.garinasset.com'),

  // iOS / Safari 添加到主屏幕后的名称
  appleWebApp: {
    title: '厘查',
  },

  openGraph: {
    title: '厘查',
    description:
      '检测你的电话、身份证、邮箱等是否出现在泄露数据库中。',
    url: 'https://leak-check.garinasset.com',
    siteName: '厘查 - 嘉林数据',
    type: 'website',
    locale: 'zh_CN',
  },

  twitter: {
    card: 'summary_large_image',
    title: '厘查',
    description:
      '检测你的电话、身份证、邮箱等是否出现在泄露数据库中。',
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