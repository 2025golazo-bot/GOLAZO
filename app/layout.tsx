import type { Metadata } from 'next';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}
