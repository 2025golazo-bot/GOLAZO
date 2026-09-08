"use client";

import React, { useState } from "react";
import Image from "next/image";

// コンポーネント定義など...

export default function Layout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("売上管理");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 
        ※ 1段目の暗色ヘッダーバーは削除しました。
        水色背景のメインナビゲーションバーのみを残します。
      */}
      <header className="bg-[#60A5FA] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* 左側：ロゴ画像 ＋ パーソナルジム GOLAZO */}
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 overflow-hidden rounded-md">
                <Image
                  src="/logo.png" // public/logo.png に保存したロゴ画像
                  alt="パーソナルジム GOLAZO ロゴ"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <span className="font-bold text-xl tracking-wide">
                パーソナルジム GOLAZO
              </span>
            </div>

            {/* 右側：各画面への切り替えナビゲーションボタン */}
            <nav className="flex space-x-2">
              {[
                { name: "売上管理", id: "sales" },
                { name: "顧客カルテ", id: "karte" },
                { name: "タスク・議事録", id: "tasks" },
                { name: "近隣情報", id: "local" },
                { name: "取引一覧", id: "transactions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.name
                      ? "bg-white text-[#60A5FA] font-semibold"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>

          </div>
        </div>
      </header>

      {/* 画面コンテンツエリア */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 既存の売上管理 / 顧客カルテ / 新規3ページのロジック */}
      </main>
    </div>
  );
}
