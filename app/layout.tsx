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
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {/* 共通ナビゲーションバー（昨日登録された各ページへのリンク） */}
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="font-bold text-lg text-blue-600">GYM MANAGER</h1>
            <nav className="flex gap-6 text-sm font-medium">
              <a href="/" className="hover:text-blue-600 transition-colors">ダッシュボード・カルテ</a>
              <a href="/sales" className="hover:text-blue-600 transition-colors">売上管理</a>
              <a href="/task-manager" className="hover:text-blue-600 transition-colors">タスク</a>
              <a href="/transactions" className="hover:text-blue-600 transition-colors">取引詳細</a>
              <a href="/local-info" className="hover:text-blue-600 transition-colors">近隣情報</a>
            </nav>
          </div>
        </header>

        {/* 各ページの中身（変更なし） */}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
