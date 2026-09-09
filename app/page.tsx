'use client';

import React, { useState, useEffect } from 'react';

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

interface Parent {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

// --- 初期データ（localStorageにデータが存在しない場合に使用） ---
const INITIAL_PARENTS: Parent[] = [
  { id: 'p1', name: '保護者 太郎', email: 'parent1@example.com', phone: '090-0000-0000' }
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    parentId: 'p1',
    name: 'ゴラッソ 陸手',
    grade: '小学5年生',
    goal: '体幹バランスの強化とアジリティ向上',
    sessions: [
      {
        id: 'sess1',
        date: '2026-09-01',
        content: 'BOSUバランストレーナーを使用した体幹トレーニングおよびリアクションアジリティの測定。',
        notes: 'バランス感覚が非常に良くなっています。'
      }
    ]
  }
];

export default function StudentManager() {
  // ハイドレーションエラー（SSRとクライアントのミスマッチ）を防ぐフラグ
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 1. 保護者データ（localStorageから取得、無ければINITIAL_PARENTS）
  const [parents, setParents] = useState<Parent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('golazo_parents');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse golazo_parents from localStorage', e);
        }
      }
    }
    return INITIAL_PARENTS;
  });

  // 2. 受講生データ（localStorageから取得、無ければINITIAL_STUDENTS）
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('golazo_students');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse golazo_students from localStorage', e);
        }
      }
    }
    return INITIAL_STUDENTS;
  });

  // 選択中の生徒ID
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  // 新規セッション追加フォームの状態
  const [newSessionDate, setNewSessionDate] = useState<string>('');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionNotes, setNewSessionNotes] = useState<string>('');

  // クライアント側でのマウント完了を記録
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. parents の変更を検知して localStorage へ自動保存
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('golazo_parents', JSON.stringify(parents));
    }
  }, [parents, isMounted]);

  // 4. students の変更を検知して localStorage へ自動保存
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('golazo_students', JSON.stringify(students));
    }
  }, [students, isMounted]);

  // マウント前は何もレンダリングしない（SSRミスマッチの防止）
  if (!isMounted) {
    return null;
  }

  // 選択中の生徒オブジェクトの取得
  const currentStudent = students.find((s) => s.id === selectedStudentId);

  // セッション追加処理（データが更新されると自動的にlocalStorageへ保存されます）
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !newSessionDate || !newSessionContent) return;

    const newSession: Session = {
      id: `sess_${Date.now()}`,
      date: newSessionDate,
      content: newSessionContent,
      notes: newSessionNotes
    };

    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === selectedStudentId) {
          return {
            ...student,
            sessions: [newSession, ...student.sessions]
          };
        }
        return student;
      })
    );

    // フォームのリセット
    setNewSessionDate('');
    setNewSessionContent('');
    setNewSessionNotes('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #333', pb: '10px' }}>受講生カルテ管理</h1>

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
              {student.name} ({student.grade || '学年未設定'})
            </option>
          ))}
        </select>
      </div>

      {currentStudent && (
        <div>
          {/* 基本情報表示 */}
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>{currentStudent.name} さんの情報</h2>
            <p><strong>目標:</strong> {currentStudent.goal || '未設定'}</p>
          </div>

          {/* 新規セッション登録フォーム */}
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>新規トレーニング記録の追加</h3>
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
                <label style={{ display: 'block', marginBottom: '5px' }}>トレーニング内容:</label>
                <textarea
                  value={newSessionContent}
                  onChange={(e) => setNewSessionContent(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>特記事項・所感:</label>
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
                記録を保存（自動同期）
              </button>
            </form>
          </div>

          {/* 過去のセッション履歴 */}
          <div>
            <h3>トレーニング履歴</h3>
            {currentStudent.sessions.length === 0 ? (
              <p>履歴がありません。</p>
            ) : (
              currentStudent.sessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    borderLeft: '4px solid #0070f3',
                    paddingLeft: '15px',
                    marginBottom: '15px',
                    backgroundColor: '#fafafa',
                    padding: '10px'
                  }}
                >
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#555' }}>{session.date}</p>
                  <p style={{ margin: '0 0 5px 0' }}>{session.content}</p>
                  {session.notes && (
                    <p style={{ margin: 0, fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                      メモ: {session.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
