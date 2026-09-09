// components/Header.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  // 不要な外部・グローバルヘッダーを非表示にするハック処理
  useEffect(() => {
    const globalNavs = document.querySelectorAll('header:not(main header), nav:not(main nav)');
    globalNavs.forEach((el) => {
      if (!el.classList.contains('golazo-custom-header')) {
        (el as HTMLElement).style.display = 'none';
      }
    });
  }, []);

  const navItems = [
    { label: '売上管理', href: '/sales', icon: '📊' },
    { label: '顧客リスト', href: '/clients', icon: '📋' },
    { label: 'タスク・議事録', href: '/task-manager', icon: '📝' },
    { label: '近隣情報', href: '/local-info', icon: '📍' },
    { label: 'マシン・業者一覧', href: '/vendors', icon: '🏋️' },
  ];

  return (
    <header className="golazo-custom-header bg-[#5e9bc4] text-white px-6 py-3 flex flex-wrap justify-between items-center shadow-md sticky top-0 z-50 gap-3">
      <div className="flex items-center gap-2.5">
        <span className="bg-white text-[#5e9bc4] px-2 py-1 rounded font-black text-xs">G</span>
        <h1 className="text-sm font-bold tracking-wider">パーソナルジム GOLAZO</h1>
      </div>
      <nav className="flex flex-wrap gap-1.5 text-xs font-semibold">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-[#5e9bc4] font-bold shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
