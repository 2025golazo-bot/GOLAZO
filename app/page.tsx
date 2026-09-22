'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

const menuItems = [
  {
    href: '/clients',
    icon: '📋',
    title: '顧客リスト',
    description: '顧客情報・カルテ・測定結果を管理します。',
  },
  {
    href: '/task-manager',
    icon: '📝',
    title: 'タスク・議事録',
    description: '業務タスクやミーティング議事録を管理します。',
  },
  {
    href: '/local-info',
    icon: '📍',
    title: '近隣情報',
    description: '近隣施設・地域情報・営業情報を管理します。',
  },
  {
    href: '/vendors',
    icon: '🏋️',
    title: 'マシン・業者一覧',
    description: 'マシン・設備・取引業者の情報を管理します。',
  },
  {
    href: '/sales',
    icon: '📊',
    title: '売上管理',
    description: '売上・決済・取引情報を管理します。',
  },
  {
    href: '/profit',
    icon: '💰',
    title: '収支管理',
    description: '売上・経費・利益を月ごとに確認します。',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm font-semibold text-[#5e9bc4] mb-2">
              GOLAZO MANAGEMENT SYSTEM
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              GOLAZO 管理システム
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              管理したい機能を選択してください。
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-slate-700 mb-4">
            管理メニュー
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-[#5e9bc4]/40 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#5e9bc4]/10 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 group-hover:text-[#5e9bc4] transition">
                      {item.title}
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 text-xs font-semibold text-[#5e9bc4]">
                  開く →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
