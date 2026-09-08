'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// ※既存のsupabaseクライアント設定ファイル（lib/supabase.tsなど）があればそちらをインポートしていただいても大丈夫です
// 例: import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Supabaseの環境変数を使ってクライアントを初期化（あるいは既存のインポートに置き換え）
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`, // 再設定後のリダイレクト先
      });

      if (error) {
        throw error;
      }

      setMessage('パスワード再設定用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。');
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました。メールアドレスをご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#5e9bc4]">パスワードの再設定</h1>
          <p className="text-xs text-slate-500 mt-1">
            登録したメールアドレスを入力してください。パスワード再設定用の案内をお送りします。
          </p>
        </div>

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="w-full p-2.5 border rounded-lg text-sm bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#5e9bc4] text-white font-bold rounded-lg shadow hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            {loading ? '送信中...' : '再設定メールを送信'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs text-[#5e9bc4] hover:underline font-medium">
            &larr; ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
