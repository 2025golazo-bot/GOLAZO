// components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  // リンクが現在地かどうかを判定するヘルパー
  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/sales', label: '売上管理', icon: '📊' },
    { href: '/clients', label: '顧客リスト', icon: '📋' },
    { href: '/task-manager', label: 'タスク・議事録', icon: '📝' },
    { href: '/local-info', label: '近隣情報', icon: '📍' },
    { href: '/vendors', label: 'マシン・業者一覧', icon: '🏋️' },
  ];

  return (
    <header className="bg-[#5e9bc4] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* 左側：ロゴ・サービス名 */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white text-lg shadow-inner">
              G
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white leading-tight">
                パーソナルジム GOLAZO
              </h1>
              <p className="text-[10px] text-white/80">マネジメントシステム</p>
            </div>
          </div>
        </div>

        {/* 右側：各ページへの統一ナビゲーションボタン */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  active
                    ? 'bg-white text-[#5e9bc4] shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
