'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase クライアントの安全な初期化（ビルド時クラッシュ防止） ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- 型定義 ---
interface Session {
  id: string;
  date: string;
  content: string;
  notes?: string;
  photoUrl?: string;
}

interface Student {
  id: string;
  parentId: string;
  name: string;
  grade?: string;
  goal?: string;
  sessions: Session[];
}

export default function StudentManager() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // 新規セッション追加フォームの状態
  const [newSessionDate, setNewSessionDate] = useState<string>('');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionNotes, setNewSessionNotes] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    fetchDataFromSupabase();
  }, []);

  // --- 1. Supabaseからデータを取得する処理 ---
  const fetchDataFromSupabase = async () => {
    setLoading(true);
    try {
      // customersテーブル（生徒一覧）を取得
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      // salesテーブル（セッション記録）を取得
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*');

      if (salesError) throw salesError;

      // データ整形（Supabaseのデータをアプリ用の型にマッピング）
      if (customersData && customersData.length > 0) {
        const formattedStudents: Student[] = customersData.map((c: any) => {
          // 該当する生徒のセッション履歴をフィルター
          const studentSessions: Session[] = (salesData || [])
            .filter((s: any) => s.customer_square_id === c.id || s.customer_square_id === c.square_id)
            .map((s: any) => ({
              id: s.id,
              date: s.created_at ? s.created_at.split('T')[0] : '日付なし',
              content: s.source || '（内容なし）',
              notes: s.square_payment_id ? `決済ID: ${s.square_payment_id}` : ''
            }));

          return {
            id: c.id,
            parentId: 'p1',
            name: c.name || c.id,
            grade: c.grade || '未設定',
            goal: c.goal || '未設定',
            sessions: studentSessions
          };
        });

        setStudents(formattedStudents);
        setSelectedStudentId(formattedStudents[0]?.id || '');
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Supabaseからのデータ取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Supabaseへ新規セッションを追加・保存する処理 ---
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !newSessionDate || !newSessionContent) return;

    try {
      // Supabaseの sales テーブルにデータを挿入 (INSERT)
      const { data, error } = await supabase
        .from('sales')
        .insert([
          {
            customer_square_id: selectedStudentId,
            source: newSessionContent,
            amount: 0,
            square_payment_id: newSessionNotes || null
          }
        ])
        .select();

      if (error) {
        alert('Supabaseへの保存に失敗しました: ' + error.message);
        return;
      }

      alert('データがSupabaseに正常に保存されました！');

      // フォームをリセットして最新データを再取得
      setNewSessionDate('');
      setNewSessionContent('');
      setNewSessionNotes('');
      fetchDataFromSupabase();

    } catch (err) {
      console.error('保存処理中にエラーが発生しました:', err);
    }
  };

  if (!isMounted) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>受講生カルテ管理 (Supabase連動版)</h1>

      {loading ? (
        <p>Supabaseからデータを読み込み中...</p>
      ) : students.length === 0 ? (
        <p>生徒データが見つかりません。Supabaseの `customers` テーブルにデータを追加してください。</p>
      ) : (
        <>
          {/* 生徒選択ドロップダウン */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>受講生を選択:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{ padding: '8px', fontSize: '16px' }}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.grade})
                </option>
              ))}
            </select>
          </div>

          {currentStudent && (
            <div>
              {/* 基本情報表示 */}
              <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>{currentStudent.name} さんの情報</h2>
                <p><strong>目標:</strong> {currentStudent.goal}</p>
              </div>

              {/* 新規セッション登録フォーム */}
              <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>新規トレーニング記録の追加（Supabaseに直接保存）</h3>
                <form onSubmit={handleAddSession}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>日付:</label>
                    <input
                      type="date"
                      value={newSessionDate}
                      onChange={(e) => setNewSessionDate(e.target.value)}
                      style={{ width: '100%', padding: '8px' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>トレーニング内容 (sourceに保存):</label>
                    <textarea
                      value={newSessionContent}
                      onChange={(e) => setNewSessionContent(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '8px' }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>特記事項・メモ:</label>
                    <input
                      type="text"
                      value={newSessionNotes}
                      onChange={(e) => setNewSessionNotes(e.target.value)}
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#0070f3',
                      color: '#fff',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Supabaseに保存
                  </button>
                </form>
              </div>

              {/* 過去のセッション履歴 */}
              <div>
                <h3>トレーニング履歴（Supabaseから読み込み）</h3>
                {currentStudent.sessions.length === 0 ? (
                  <p>履歴がありません。</p>
                ) : (
                  currentStudent.sessions.map((session) => (
                    <div
                      key={session.id}
                      style={{
                        borderLeft: '4px solid #0070f3',
                        marginBottom: '15px',
                        backgroundColor: '#fafafa',
                        padding: '10px'
                      }}
                    >
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#555' }}>{session.date}</p>
                      <p style={{ margin: '0 0 5px 0' }}>{session.content}</p>
                      {session.notes && (
                        <p style={{ margin: 0, fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                          {session.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
