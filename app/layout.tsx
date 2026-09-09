import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header'; // 共通ヘッダーをインポート

export const metadata: Metadata = {
  title: 'パーソナルジム GOLAZO 管理システム',
  description: 'パーソナルジムGOLAZOの管理システムです',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-100 text-slate-800 font-sans antialiased min-h-screen">
        {/* ここに配置しておけば、全ページの上部に共通ヘッダーが自動で表示されます */}
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
