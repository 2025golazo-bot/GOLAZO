'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// ビルド時のクラッシュを防ぐ安全なSupabase初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [stats, setStats] = useState({
    customersCount: 0,
    recentSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // 顧客数の取得
        const { count, error: customerError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        if (customerError) {
          console.error('Customer fetch error:', customerError);
        }

        setStats({
          customersCount: count || 0,
          recentSales: 0,
        });
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ヘッダー */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">パーソナルジム GOLAZO</h1>
            <p className="text-xs text-slate-500 mt-1">ジム管理・顧客分析ダッシュボード</p>
          </div>
          <span className="bg-sky-100 text-sky-800 text-xs px-3 py-1 rounded-full font-bold">
            システム稼働中
          </span>
        </div>

        {/* スタッツ・概要カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold">登録生徒数</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">
              {loading ? '...' : `${stats.customersCount} 名`}
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 font-semibold">クイックリンク</p>
            <div className="mt-2 flex gap-2">
              <Link
                href="/customers/student/s-001"
                className="bg-[#5e9bc4] hover:bg-sky-600 text-white text-xs font-bold px-3 py-2 rounded transition"
              >
                生徒詳細カルテへ
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
