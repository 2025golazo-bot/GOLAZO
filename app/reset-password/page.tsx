'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください。');
      return;
    }

    if (password !== passwordConfirm) {
      setError('確認用パスワードが一致しません。');
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/login');
      router.refresh();
    } catch (err: any) {
      setError(
        err.message ||
          'パスワードの更新に失敗しました。再設定メールからもう一度お試しください。'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#5e9bc4]">
            新しいパスワードの設定
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            新しいパスワードを入力してください。
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              新しいパスワード
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#5e9bc4] text-white font-bold rounded-lg shadow hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            {loading ? '更新中...' : 'パスワードを更新'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs text-[#5e9bc4] hover:underline font-medium"
          >
            &larr; ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
