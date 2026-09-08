import './globals.css';

export const metadata = {
  title: 'GYM MANAGER',
  description: 'パーソナルジム管理システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {/* layout.tsx 側の header タグや nav タグを削除し、children のみにします */}
        {children}
      </body>
    </html>
  );
}
