'use client';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabaseの環境変数が設定されていません。');
  }
  return createClient(url, key);
};

const supabase = getSupabaseClient();

interface Session {
  id: string;
  date: string;
  content: string;
  notes: string;
}

interface Student {
  id: string;
  name: string;
  kana: string;
  grade: string;
  age: number | null;
  goal: string;
  concern: string;
  memo: string;
  sessions: Session[];
}

const emptySessionForm = { date: '', content: '', notes: '' };

export default function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [sessionForm, setSessionForm] = useState(emptySessionForm);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  const currentStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setGoalForm(currentStudent?.goal === '未設定' ? '' : currentStudent?.goal ?? '');
  }, [currentStudent?.id, currentStudent?.goal]);

  const fetchData = async (keepSelectedId = true) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const [{ data: customersData, error: customersError }, { data: logsData, error: logsError }] =
        await Promise.all([
          supabase.from('customers').select('*').order('name', { ascending: true }),
          supabase.from('training_logs').select('*').order('date', { ascending: false }).order('created_at', { ascending: false })
        ]);

      if (customersError) throw customersError;
      if (logsError) throw logsError;

      const formatted: Student[] = (customersData ?? []).map((customer: any) => {
        const sessions: Session[] = (logsData ?? [])
          .filter((log: any) => String(log.customer_id) === String(customer.id))
          .map((log: any) => ({
            id: String(log.id),
            date: log.date || (log.created_at ? String(log.created_at).slice(0, 10) : ''),
            content: log.content || '',
            notes: log.memo || ''
          }));

        return {
          id: String(customer.id),
          name: customer.name || [customer.family_name, customer.given_name].filter(Boolean).join(' ') || String(customer.id),
          kana: customer.kana || '',
          grade: customer.grade || '未設定',
          age: typeof customer.age === 'number' ? customer.age : null,
          // customersテーブルでは目標を target に保存しているため、targetを正として扱う
          goal: customer.target || '未設定',
          concern: customer.concern || '',
          memo: customer.memo || customer.custom_memo_1 || '',
          sessions
        };
      });

      setStudents(formatted);
      setSelectedStudentId((prev) => {
        if (keepSelectedId && prev && formatted.some((student) => student.id === prev)) return prev;
        return formatted[0]?.id || '';
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      console.error(error);
      setErrorMessage(`データ取得に失敗しました: ${text}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedStudentId || !sessionForm.date || !sessionForm.content.trim()) return;

    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const payload = {
        customer_id: selectedStudentId,
        date: sessionForm.date,
        content: sessionForm.content.trim(),
        memo: sessionForm.notes.trim() || null
      };

      if (editingSessionId) {
        const { error } = await supabase
          .from('training_logs')
          .update(payload)
          .eq('id', editingSessionId);
        if (error) throw error;
        setMessage('トレーニング記録を更新しました。');
      } else {
        const { error } = await supabase.from('training_logs').insert([payload]);
        if (error) throw error;
        setMessage('トレーニング記録を保存しました。');
      }

      setSessionForm(emptySessionForm);
      setEditingSessionId(null);
      await fetchData();
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      console.error(error);
      setErrorMessage(`保存に失敗しました: ${text}`);
    } finally {
      setSaving(false);
    }
  };

  const startEditSession = (session: Session) => {
    setEditingSessionId(session.id);
    setSessionForm({ date: session.date, content: session.content, notes: session.notes });
    setMessage('');
    setErrorMessage('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setSessionForm(emptySessionForm);
  };

  const deleteSession = async (sessionId: string) => {
    if (!window.confirm('このトレーニング記録を削除しますか？')) return;

    setMessage('');
    setErrorMessage('');
    try {
      const { error } = await supabase.from('training_logs').delete().eq('id', sessionId);
      if (error) throw error;
      if (editingSessionId === sessionId) cancelEdit();
      setMessage('トレーニング記録を削除しました。');
      await fetchData();
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      console.error(error);
      setErrorMessage(`削除に失敗しました: ${text}`);
    }
  };

  const saveGoal = async () => {
    if (!currentStudent) return;

    setSavingGoal(true);
    setMessage('');
    setErrorMessage('');
    try {
      const { error } = await supabase
        .from('customers')
        .update({ target: goalForm.trim() || null })
        .eq('id', currentStudent.id);
      if (error) throw error;
      setMessage('目標を保存しました。');
      await fetchData();
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      console.error(error);
      setErrorMessage(`目標の保存に失敗しました: ${text}`);
    } finally {
      setSavingGoal(false);
    }
  };

  const resetAll = () => {
    setMessage('');
    setErrorMessage('');
    setSessionForm(emptySessionForm);
    setEditingSessionId(null);
  };

  if (loading) {
    return <main style={styles.page}><p>Supabaseからデータを読み込み中...</p></main>;
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>受講生カルテ管理</h1>
      <p style={styles.subtitle}>Supabase連動版・トレーニング記録管理</p>

      {message && <div style={styles.success}>{message}</div>}
      {errorMessage && <div style={styles.error}>{errorMessage}</div>}

      {students.length === 0 ? (
        <section style={styles.card}>
          <h2>受講生が見つかりません</h2>
          <p>Supabaseの <code>customers</code> テーブルを確認してください。</p>
        </section>
      ) : (
        <>
          <section style={styles.card}>
            <label style={styles.label}>受講生を選択</label>
            <select
              value={selectedStudentId}
              onChange={(event) => {
                setSelectedStudentId(event.target.value);
                resetAll();
              }}
              style={styles.input}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.grade})
                </option>
              ))}
            </select>
          </section>

          {currentStudent && (
            <>
              <section style={styles.card}>
                <h2 style={styles.sectionTitle}>{currentStudent.name} さんのカルテ</h2>
                <div style={styles.infoGrid}>
                  <div><strong>氏名：</strong>{currentStudent.name}</div>
                  {currentStudent.kana && <div><strong>かな：</strong>{currentStudent.kana}</div>}
                  <div><strong>学年：</strong>{currentStudent.grade}</div>
                  {currentStudent.age !== null && <div><strong>年齢：</strong>{currentStudent.age}歳</div>}
                </div>

                <div style={styles.goalBox}>
                  <label style={styles.label}>目標</label>
                  <textarea
                    value={goalForm}
                    onChange={(event) => setGoalForm(event.target.value)}
                    rows={2}
                    placeholder="受講生の目標を入力"
                    style={styles.textarea}
                  />
                  <button onClick={saveGoal} disabled={savingGoal} style={styles.primaryButton}>
                    {savingGoal ? '保存中...' : '目標を保存'}
                  </button>
                </div>

                {currentStudent.concern && (
                  <div style={styles.smallBox}><strong>悩み・課題：</strong>{currentStudent.concern}</div>
                )}
                {currentStudent.memo && (
                  <div style={styles.smallBox}><strong>メモ：</strong>{currentStudent.memo}</div>
                )}
              </section>

              <section style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  {editingSessionId ? 'トレーニング記録を編集' : '新規トレーニング記録'}
                </h2>
                <form onSubmit={handleSaveSession}>
                  <label style={styles.label}>日付</label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={(event) => setSessionForm({ ...sessionForm, date: event.target.value })}
                    style={styles.input}
                    required
                  />

                  <label style={styles.label}>トレーニング内容</label>
                  <textarea
                    value={sessionForm.content}
                    onChange={(event) => setSessionForm({ ...sessionForm, content: event.target.value })}
                    rows={4}
                    placeholder="実施したトレーニング、確認事項など"
                    style={styles.textarea}
                    required
                  />

                  <label style={styles.label}>特記事項・メモ</label>
                  <textarea
                    value={sessionForm.notes}
                    onChange={(event) => setSessionForm({ ...sessionForm, notes: event.target.value })}
                    rows={2}
                    placeholder="気づき、次回への申し送りなど"
                    style={styles.textarea}
                  />

                  <div style={styles.buttonRow}>
                    <button type="submit" disabled={saving} style={styles.primaryButton}>
                      {saving ? '保存中...' : editingSessionId ? '変更を保存' : 'Supabaseに保存'}
                    </button>
                    {editingSessionId && (
                      <button type="button" onClick={cancelEdit} style={styles.secondaryButton}>
                        編集をキャンセル
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section style={styles.card}>
                <div style={styles.historyHeader}>
                  <h2 style={styles.sectionTitle}>トレーニング履歴</h2>
                  <span style={styles.count}>{currentStudent.sessions.length}件</span>
                </div>

                {currentStudent.sessions.length === 0 ? (
                  <p>履歴がありません。</p>
                ) : (
                  currentStudent.sessions.map((session) => (
                    <article key={session.id} style={styles.session}>
                      <div style={styles.sessionTop}>
                        <strong>{session.date}</strong>
                        <div style={styles.buttonRowSmall}>
                          <button onClick={() => startEditSession(session)} style={styles.editButton}>編集</button>
                          <button onClick={() => deleteSession(session.id)} style={styles.deleteButton}>削除</button>
                        </div>
                      </div>
                      <div style={styles.content}>{session.content}</div>
                      {session.notes && <div style={styles.notes}>メモ：{session.notes}</div>}
                    </article>
                  ))
                )}
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f3f6fa', padding: '32px 20px 60px', fontFamily: 'Arial, sans-serif', color: '#222' },
  title: { maxWidth: 800, margin: '0 auto 4px', fontSize: 28 },
  subtitle: { maxWidth: 800, margin: '0 auto 24px', color: '#666' },
  card: { maxWidth: 800, margin: '0 auto 18px', background: '#fff', border: '1px solid #ddd', borderRadius: 10, padding: 20, boxSizing: 'border-box' },
  sectionTitle: { margin: '0 0 16px', fontSize: 21 },
  label: { display: 'block', fontWeight: 700, margin: '12px 0 6px' },
  input: { width: '100%', boxSizing: 'border-box', padding: 11, border: '1px solid #bbb', borderRadius: 6, fontSize: 16, background: '#fff' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: 11, border: '1px solid #bbb', borderRadius: 6, fontSize: 15, resize: 'vertical' },
  primaryButton: { background: '#087cf0', color: '#fff', border: 0, borderRadius: 6, padding: '10px 18px', cursor: 'pointer', fontSize: 15 },
  secondaryButton: { background: '#fff', color: '#333', border: '1px solid #aaa', borderRadius: 6, padding: '10px 18px', cursor: 'pointer', fontSize: 15 },
  editButton: { background: '#fff', border: '1px solid #aaa', borderRadius: 5, padding: '5px 10px', cursor: 'pointer' },
  deleteButton: { background: '#fff', color: '#b42318', border: '1px solid #e0a0a0', borderRadius: 5, padding: '5px 10px', cursor: 'pointer' },
  buttonRow: { display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  buttonRowSmall: { display: 'flex', gap: 6 },
  success: { maxWidth: 800, margin: '0 auto 14px', padding: 12, background: '#eaf8ef', border: '1px solid #a9d9b8', borderRadius: 7, color: '#166534' },
  error: { maxWidth: 800, margin: '0 auto 14px', padding: 12, background: '#fff0f0', border: '1px solid #e0aaaa', borderRadius: 7, color: '#9b1c1c' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 18 },
  goalBox: { background: '#f7faff', border: '1px solid #dbe8f7', borderRadius: 8, padding: 14 },
  smallBox: { marginTop: 12, padding: 10, background: '#f7f7f7', borderRadius: 6, lineHeight: 1.6 },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  count: { background: '#eef3f8', padding: '4px 10px', borderRadius: 999, color: '#555' },
  session: { borderLeft: '4px solid #087cf0', background: '#fafafa', padding: '12px 14px', marginBottom: 12, borderRadius: '0 7px 7px 0' },
  sessionTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 },
  content: { whiteSpace: 'pre-wrap', lineHeight: 1.6 },
  notes: { marginTop: 8, color: '#666', fontSize: 14, whiteSpace: 'pre-wrap' }
};
