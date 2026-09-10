'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

// --- 型定義 ---
interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  staff: string; // TAKA or NANA
  content: string;
  homework: string;
  photo: string | null;
}

interface PhysicalData {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  fat: number;
  muscle: number;
  note?: string;
  posturePhotos?: {
    front?: string | null;
    side?: string | null;
    back?: string | null;
  };
  testPhotos?: string[]; // ケガゼロ/フィジカルチェック等
}

interface TicketHistory {
  id: string;
  date: string;
  title: string;
  count: number;
  expire: string;
  squarePaymentId: string;
}

interface Parent {
  id: string;
  name: string;
  kana: string;
  phone: string;
  ticketRemaining: number;
  ticketsHistory: TicketHistory[];
}

interface NearbyInfo {
  id: string;
  title: string;
  category: '大会・イベント' | '近隣施設' | 'その他';
  date: string;
  location: string;
  description: string;
}

interface Student {
  id: string;
  parentId: string; // 1:N 構造（保護者ID）
  name: string;
  kana: string;
  age: number;
  birthdate: string;
  firstLessonDate: string;
  lastReservationDate: string; // 最終予約日（アラート判定用）
  concern: string;
  target: string;
  memo: string;
  // 要望対応：独立した3つのメモ欄
  customMemo1: string;
  customMemo2: string;
  customMemo3: string;
  physicalHistory: PhysicalData[];
  sessions: Session[];
}

export default function ClientsPage() {
  // 保護者データ
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 'p-101',
      name: '藤田 奈々',
      kana: 'フジタ ナナ',
      phone: '090-1111-2222',
      ticketRemaining: 1, // 残り1回でチケットアラート動作確認用
      ticketsHistory: [
        { id: 'th-1', date: '2026-06-01', title: '10回券 (共通)', count: 10, expire: '2026-12-01', squarePaymentId: 'sq_pay_998811' }
      ]
    },
    {
      id: 'p-102',
      name: '山田 太郎',
      kana: 'ヤマダ タロウ',
      phone: '090-1234-5678',
      ticketRemaining: 5,
      ticketsHistory: [
        { id: 'th-2', date: '2026-08-01', title: '5回券', count: 5, expire: '2027-02-01', squarePaymentId: 'sq_pay_772200' }
      ]
    }
  ]);

  // 近隣情報・イベントデータ（全体共通または受講生紐付け）
  const [nearbyInfos, setNearbyInfos] = useState<NearbyInfo[]>([
    {
      id: 'nb-1',
      title: '練馬区ジュニアサッカー大会 予選リーグ',
      category: '大会・イベント',
      date: '2026-10-15',
      location: '区立総合運動場グラウンド',
      description: '初戦突破を目標に、アジリティ系メニューを強化中。'
    },
    {
      id: 'nb-2',
      title: '光が丘体育館 サブアリーナ開放日',
      category: '近隣施設',
      date: '2026-09-25',
      location: '光が丘体育館',
      description: '自主トレでのスペース利用に活用可能。'
    }
  ]);

  // 受講生データ一覧
  const [students, setStudents] = useState<Student[]>([
    {
      id: 's-001',
      parentId: 'p-101',
      name: '藤田 陸',
      kana: 'フジタ リク',
      age: 11,
      birthdate: '2015-05-12',
      firstLessonDate: '2026-03-01',
      lastReservationDate: '2026-08-20', // 1ヶ月以上前
      concern: 'サッカーでの体幹ブレ・走力向上',
      target: 'トレセン選出・ブレない軸作り',
      memo: '右足首捻挫の既往歴あり。兄。',
      customMemo1: '【特記事項】アップ時に股関節周りの可動域チェックを念入りに行う。',
      customMemo2: '【食事面】練習後のプロテイン摂取と炭水化物の補給を意識させる。',
      customMemo3: '【自主練】週末のランニングフォーム動画をLINEで提出予定。',
      physicalHistory: [
        {
          id: 'm-1',
          date: '2026-06-01',
          weight: 37.5,
          fat: 16.0,
          muscle: 29.5,
          note: '初回3ヶ月測定',
          posturePhotos: { front: null, side: null, back: null },
          testPhotos: []
        },
        {
          id: 'm-2',
          date: '2026-09-01',
          weight: 38.7,
          fat: 15.2,
          muscle: 30.8,
          note: '2回目3ヶ月測定',
          posturePhotos: { front: null, side: null, back: null },
          testPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-101', date: '2026-10-05', staff: 'TAKA', content: 'フィジカルテスト＆スプリントフォームチェック', homework: '体幹キープ 1分×3セット', photo: null }
      ]
    },
    {
      id: 's-002',
      parentId: 'p-101',
      name: '藤田 翔',
      kana: 'フジタ ショウ',
      age: 8,
      birthdate: '2018-09-20',
      firstLessonDate: '2026-04-10',
      lastReservationDate: '2026-09-01', // 2週間以上前
      concern: '運動神経向上・ボール感覚',
      target: 'アジリティUP',
      memo: '弟。リズムトレーニングを好む。',
      customMemo1: '【特記事項】集中力が切れやすいので、前半に楽しいリズム系を挟む。',
      customMemo2: '【食事面】好き嫌いが多く野菜を少しずつ克服中。',
      customMemo3: '【自主練】おうちでコーディネーショントレーニング5分。',
      physicalHistory: [
        {
          id: 'm-3',
          date: '2026-07-01',
          weight: 25.0,
          fat: 14.5,
          muscle: 18.0,
          note: '初回計測',
          posturePhotos: { front: null, side: null, back: null },
          testPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-201', date: '2026-10-02', staff: 'NANA', content: 'ピラティス＆ストレッチ', homework: '長座体前屈', photo: null }
      ]
    }
  ]);

  // UI状態
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-001');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'nearby' | 'edit_info'>('carte');

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent.parentId) || parents[0];
  const siblingStudents = students.filter(s => s.parentId === currentParent.id);

  // 比較用データステート
  const physicalDates = currentStudent.physicalHistory.map(m => m.date);
  const [beforeDate, setBeforeDate] = useState<string>(physicalDates[0] || '2026-06-01');
  const [afterDate, setAfterDate] = useState<string>(physicalDates[physicalDates.length - 1] || '2026-09-01');

  const beforePhysical = currentStudent.physicalHistory.find(m => m.date === beforeDate) || currentStudent.physicalHistory[0];
  const afterPhysical = currentStudent.physicalHistory.find(m => m.date === afterDate) || currentStudent.physicalHistory[currentStudent.physicalHistory.length - 1];

  const [newMeasureDate, setNewMeasureDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // セッションフィルター＆新規フォーム
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [newSessionDate, setNewSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSessionStaff, setNewSessionStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionHomework, setNewSessionHomework] = useState<string>('');
  const [useTicket, setUseTicket] = useState<boolean>(true);

  // 編集用ステート
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionContent, setEditSessionContent] = useState<string>('');
  const [editSessionHomework, setEditSessionHomework] = useState<string>('');

  // 近隣情報追加・編集用ステート
  const [newNearbyTitle, setNewNearbyTitle] = useState('');
  const [newNearbyCategory, setNewNearbyCategory] = useState<'大会・イベント' | '近隣施設' | 'その他'>('大会・イベント');
  const [newNearbyDate, setNewNearbyDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNearbyLocation, setNewNearbyLocation] = useState('');
  const [newNearbyDesc, setNewNearbyDesc] = useState('');
  const [editingNearbyId, setEditingNearbyId] = useState<string | null>(null);
  const [editNearbyTitle, setEditNearbyTitle] = useState('');
  const [editNearbyDesc, setEditNearbyDesc] = useState('');

  // 3つのメモ欄編集用ステート
  const [editCustomMemo1, setEditCustomMemo1] = useState(currentStudent.customMemo1);
  const [editCustomMemo2, setEditCustomMemo2] = useState(currentStudent.customMemo2);
  const [editCustomMemo3, setEditCustomMemo3] = useState(currentStudent.customMemo3);

  const [editForm, setEditForm] = useState({
    name: currentStudent.name,
    kana: currentStudent.kana,
    phone: currentParent.phone,
    concern: currentStudent.concern,
    target: currentStudent.target,
    memo: currentStudent.memo
  });

  // ---------------------------------------------------------------------------
  // 自動アラート判定ロジック
  // ---------------------------------------------------------------------------
  const getAlertBadges = (student: Student, parent: Parent) => {
    const alerts: { text: string; type: 'warning' | 'danger' }[] = [];
    const today = new Date();

    if (student.lastReservationDate) {
      const lastRes = new Date(student.lastReservationDate);
      const diffDays = Math.floor((today.getTime() - lastRes.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 30) {
        alerts.push({ text: `🚨 1ヶ月未予約 (${diffDays}日前)`, type: 'danger' });
      } else if (diffDays >= 14) {
        alerts.push({ text: `⚠️ 最終予約から2週間未予約 (${diffDays}日前)`, type: 'warning' });
      }
    }

    if (student.firstLessonDate) {
      const firstDate = new Date(student.firstLessonDate);
      const diffMonths = (today.getFullYear() - firstDate.getFullYear()) * 12 + (today.getMonth() - firstDate.getMonth());
      if (diffMonths >= 0 && diffMonths % 3 === 0) {
        alerts.push({ text: `⚠️ 3ヶ月測定の時期です`, type: 'warning' });
      }
    }

    if (parent.ticketRemaining <= 1) {
      alerts.push({ text: `🎫 回数券残り ${parent.ticketRemaining} 回`, type: 'danger' });
    }

    return alerts;
  };

  const currentAlerts = getAlertBadges(currentStudent, currentParent);

  // ---------------------------------------------------------------------------
  // ハンドラー類
  // ---------------------------------------------------------------------------
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const target = students.find(s => s.id === id);
    if (target) {
      setEditForm({
        name: target.name,
        kana: target.kana,
        phone: parents.find(p => p.id === target.parentId)?.phone || '',
        concern: target.concern,
        target: target.target,
        memo: target.memo
      });
      setEditCustomMemo1(target.customMemo1);
      setEditCustomMemo2(target.customMemo2);
      setEditCustomMemo3(target.customMemo3);
      if (target.physicalHistory.length > 0) {
        setBeforeDate(target.physicalHistory[0].date);
        setAfterDate(target.physicalHistory[target.physicalHistory.length - 1].date);
      }
    }
  };

  const handleAddSession = () => {
    if (!newSessionContent) return;
    const newSession: Session = {
      id: `ses-${Date.now()}`,
      date: newSessionDate,
      staff: newSessionStaff,
      content: newSessionContent,
      homework: newSessionHomework,
      photo: null
    };

    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, sessions: [newSession, ...s.sessions], lastReservationDate: newSessionDate } : s))
    );

    if (useTicket) {
      setParents(prev =>
        prev.map(p => (p.id === currentParent.id ? { ...p, ticketRemaining: Math.max(0, p.ticketRemaining - 1) } : p))
      );
    }

    setNewSessionContent('');
    setNewSessionHomework('');
    alert('セッションを登録しました！');
  };

  const handleSaveEditSession = (sessionId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        return {
          ...s,
          sessions: s.sessions.map(ses => (ses.id === sessionId ? { ...ses, content: editSessionContent, homework: editSessionHomework } : ses))
        };
      })
    );
    setEditingSessionId(null);
    alert('セッション記録を更新しました');
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!confirm('このセッション記録を削除しますか？')) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        return {
          ...s,
          sessions: s.sessions.filter(ses => ses.id !== sessionId)
        };
      })
    );
  };

  const handleAddNewMeasureDate = () => {
    if (!newMeasureDate) return;
    if (currentStudent.physicalHistory.some(m => m.date === newMeasureDate)) {
      alert('すでに登録されている計測日です。');
      return;
    }

    const newPh: PhysicalData = {
      id: `m-${Date.now()}`,
      date: newMeasureDate,
      weight: 0,
      fat: 0,
      muscle: 0,
      note: '定期計測',
      posturePhotos: { front: null, side: null, back: null },
      testPhotos: []
    };

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updated = [...s.physicalHistory, newPh].sort((a, b) => a.date.localeCompare(b.date));
        return { ...s, physicalHistory: updated };
      })
    );
    setAfterDate(newMeasureDate);
    alert(`計測日 (${newMeasureDate}) を追加しました！`);
  };

  const handleDeleteMeasureDate = (targetDate: string) => {
    if (currentStudent.physicalHistory.length <= 1) {
      alert('これ以上削除できません（最低1件の計測データが必要です）。');
      return;
    }
    if (!confirm(`${targetDate} の計測データを削除しますか？`)) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updated = s.physicalHistory.filter(m => m.date !== targetDate);
        return { ...s, physicalHistory: updated };
      })
    );
    const remaining = currentStudent.physicalHistory.filter(m => m.date !== targetDate);
    if (remaining.length > 0) {
      setBeforeDate(remaining[0].date);
      setAfterDate(remaining[remaining.length - 1].date);
    }
  };

  const handleUpdatePhysicalValue = (targetDate: string, field: keyof PhysicalData, val: any) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updated = s.physicalHistory.map(m => (m.date === targetDate ? { ...m, [field]: val } : m));
        return { ...s, physicalHistory: updated };
      })
    );
  };

  // 3つのメモ欄の保存処理
  const handleSaveCustomMemos = () => {
    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, customMemo1: editCustomMemo1, customMemo2: editCustomMemo2, customMemo3: editCustomMemo3 } : s))
    );
    alert('3つのメモ欄を更新しました！');
  };

  // 近隣情報・イベント追加・削除・編集ハンドラー
  const handleAddNearby = () => {
    if (!newNearbyTitle || !newNearbyLocation) {
      alert('タイトルと場所を入力してください。');
      return;
    }
    const newItem: NearbyInfo = {
      id: `nb-${Date.now()}`,
      title: newNearbyTitle,
      category: newNearbyCategory,
      date: newNearbyDate,
      location: newNearbyLocation,
      description: newNearbyDesc
    };
    setNearbyInfos([newItem, ...nearbyInfos]);
    setNewNearbyTitle('');
    setNewNearbyLocation('');
    setNewNearbyDesc('');
    alert('近隣情報・イベントを追加しました！');
  };

  const handleDeleteNearby = (id: string) => {
    if (!confirm('この近隣情報を削除しますか？')) return;
    setNearbyInfos(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveEditNearby = (id: string) => {
    setNearbyInfos(prev =>
      prev.map(item => (item.id === id ? { ...item, title: editNearbyTitle, description: editNearbyDesc } : item))
    );
    setEditingNearbyId(null);
    alert('近隣情報を更新しました！');
  };

  const handleSaveInfo = () => {
    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, name: editForm.name, kana: editForm.kana, concern: editForm.concern, target: editForm.target, memo: editForm.memo } : s))
    );
    setParents(prev =>
      prev.map(p => (p.id === currentParent.id ? { ...p, phone: editForm.phone } : p))
    );
    alert('基本情報を更新しました');
  };

  const availableYears = Array.from(new Set(currentStudent.sessions.map(s => s.date.substring(0, 4)))).sort().reverse();
  const availableMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const filteredSessions = currentStudent.sessions.filter(s => {
    const [y, m] = s.date.split('-');
    const matchYear = selectedYear === 'ALL' || y === selectedYear;
    const matchMonth = selectedMonth === 'ALL' || m === selectedMonth;
    return matchYear && matchMonth;
  });

  const filteredStudents = students.filter(s => {
    const parent = parents.find(p => p.id === s.parentId);
    const query = searchKeyword.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.kana.toLowerCase().includes(query) ||
      s.concern.toLowerCase().includes(query) ||
      s.memo.toLowerCase().includes(query) ||
      (parent && parent.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* 左カラム：受講生選択 */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1"><span>🔍</span> キーワード検索</label>
              <input
                type="text"
                placeholder="名前、悩み、メモで検索..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#5e9bc4] outline-none"
              />
            </div>

            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">受講生一覧 ({filteredStudents.length}名)</h3>

            <div className="space-y-2.5">
              {filteredStudents.map(student => {
                const parent = parents.find(p => p.id === student.parentId);
                const isSelected = selectedStudentId === student.id;
                const badges = getAlertBadges(student, parent || parents[0]);

                return (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                      isSelected ? 'bg-sky-50/80 border-[#5e9bc4] ring-2 ring-[#5e9bc4]/20' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-bold ${isSelected ? 'text-[#5e9bc4]' : 'text-slate-800'}`}>{student.name}</span>
                      <span className="text-xs font-semibold text-[#5e9bc4] bg-sky-100/60 px-2 py-0.5 rounded-full">{student.age}歳</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">保護者: {parent?.name}</p>
                    
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {badges.map((b, i) => (
                          <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${b.type === 'danger' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                            {b.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右カラム：メインコンテンツ */}
          <div className="md:col-span-3 space-y-5">
            {/* 顧客基本情報ヘッダー */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">{currentStudent.kana}</span>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mt-0.5">
                    {currentStudent.name}
                    <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{currentStudent.age}歳</span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                      保護者: {currentParent.name} 様 ({currentParent.phone})
                    </span>
                    <span className="bg-sky-50 text-[#5e9bc4] border border-sky-200 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span>🎟️</span> 回数券 残数: <strong className="text-sm">{currentParent.ticketRemaining}</strong> 回
                    </span>
                  </div>
                </div>

                {currentAlerts.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {currentAlerts.map((alt, idx) => (
                      <div key={idx} className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${alt.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        <span>{alt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 兄弟リンク */}
              {siblingStudents.length > 1 && (
                <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-amber-900 font-bold">👨‍👩‍👧‍👦 ご兄弟アカウント</span>
                  <div className="flex gap-1.5">
                    {siblingStudents.map(sib => (
                      <button
                        key={sib.id}
                        onClick={() => handleSelectStudent(sib.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${sib.id === currentStudent.id ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'}`}
                      >
                        {sib.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* タブ切り替え */}
              <div className="flex flex-wrap border-b border-slate-200 pt-2 gap-6 text-xs font-bold">
                <button onClick={() => setActiveTab('carte')} className={`pb-3 border-b-2 transition ${activeTab === 'carte' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  📋 カルテ (セッション & 計測)
                </button>
                <button onClick={() => setActiveTab('tickets')} className={`pb-3 border-b-2 transition ${activeTab === 'tickets' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  🎟️ チケット・Square
                </button>
                <button onClick={() => setActiveTab('nearby')} className={`pb-3 border-b-2 transition ${activeTab === 'nearby' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  📍 近隣情報・イベント
                </button>
                <button onClick={() => setActiveTab('edit_info')} className={`pb-3 border-b-2 transition ${activeTab === 'edit_info' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  ✏️ 基本情報・3つのメモ
                </button>
              </div>
            </div>

            {/* TAB 1: カルテ */}
            {activeTab === 'carte' && (
              <div className="space-y-6">
                {/* 新規セッション記録の追加 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>✍️</span> 新規セッション記録の追加</h3>
                    <label className="flex items-center gap-1 font-semibold text-slate-600 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={useTicket}
                        onChange={e => setUseTicket(e.target.checked)}
                        className="rounded text-[#5e9bc4]"
                      />
                      回数券を1回消化する
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">日時</label>
                      <input type="date" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">担当トレーナー</label>
                      <select value={newSessionStaff} onChange={e => setNewSessionStaff(e.target.value as 'TAKA' | 'NANA')} className="w-full border border-slate-300 rounded-lg p-2 font-bold text-[#5e9bc4] outline-none">
                        <option value="TAKA">TAKA (藤田 渉仁)</option>
                        <option value="NANA">NANA (藤田 奈々)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-500 mb-1 font-semibold">セッション内容</label>
                      <input type="text" placeholder="例: 体幹バランストレーニング" value={newSessionContent} onChange={e => setNewSessionContent(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block text-slate-500 mb-1 font-semibold">宿題・自主トレ指示</label>
                    <input type="text" placeholder="例: 片足ドローイン 1分×2" value={newSessionHomework} onChange={e => setNewSessionHomework(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 outline-none" />
                  </div>
                  <button onClick={handleAddSession} className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm">
                    セッションを登録する {useTicket ? '(回数券1回消化)' : ''}
                  </button>
                </div>

                {/* 時系列セッション履歴 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>📅</span> 時系列セッション履歴</h3>
                    <div className="flex items-center gap-2 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded p-1 font-bold text-[#5e9bc4]">
                        <option value="ALL">全年度</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}年</option>)}
                      </select>
                      <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded p-1 font-bold text-[#5e9bc4]">
                        <option value="ALL">全月</option>
                        {availableMonths.map(m => <option key={m} value={m}>{parseInt(m, 10)}月</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredSessions.length > 0 ? (
                      filteredSessions.map(session => (
                        <div key={session.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                          <div className="flex justify-between items-center font-bold text-slate-700">
                            <span>{session.date} <span className="text-[#5e9bc4] ml-2 bg-sky-100 px-2 py-0.5 rounded">担当: {session.staff}</span></span>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingSessionId(session.id); setEditSessionContent(session.content); setEditSessionHomework(session.homework); }} className="text-xs text-sky-600 hover:underline">編集</button>
                              <button onClick={() => handleDeleteSession(session.id)} className="text-xs text-rose-500 hover:underline">削除</button>
                            </div>
                          </div>

                          {editingSessionId === session.id ? (
                            <div className="space-y-2 pt-2 border-t">
                              <input type="text" value={editSessionContent} onChange={e => setEditSessionContent(e.target.value)} className="w-full border rounded p-1 bg-white" placeholder="内容" />
                              <input type="text" value={editSessionHomework} onChange={e => setEditSessionHomework(e.target.value)} className="w-full border rounded p-1 bg-white" placeholder="宿題" />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => handleSaveEditSession(session.id)} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold">保存</button>
                                <button onClick={() => setEditingSessionId(null)} className="bg-slate-300 px-3 py-1 rounded">キャンセル</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-slate-800 font-medium">{session.content}</p>
                              {session.homework && <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-100"><strong>宿題:</strong> {session.homework}</p>}
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">セッション記録はありません</p>
                    )}
                  </div>
                </div>

                {/* 計測データ管理 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="border-b pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>📊</span> 身体測定・数値履歴</h3>
                    <div className="flex items-center gap-2">
                      <input type="date" value={newMeasureDate} onChange={e => setNewMeasureDate(e.target.value)} className="border rounded px-2.5 py-1 text-xs" />
                      <button onClick={handleAddNewMeasureDate} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition">
                        ＋ 計測日追加
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentStudent.physicalHistory.map(m => (
                      <div key={m.id} className="p-3 bg-slate-50 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="font-bold text-slate-700 flex items-center gap-2">
                          <span>{m.date}</span>
                          <button onClick={() => handleDeleteMeasureDate(m.date)} className="text-[10px] text-rose-500 hover:underline bg-rose-50 px-2 py-0.5 rounded border border-rose-200">削除</button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <span className="text-slate-400 text-[10px] block">体重</span>
                            <input type="number" step="0.1" value={m.weight} onChange={e => handleUpdatePhysicalValue(m.date, 'weight', parseFloat(e.target.value))} className="w-16 border rounded p-1 font-bold text-center" /> kg
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">体脂肪率</span>
                            <input type="number" step="0.1" value={m.fat} onChange={e => handleUpdatePhysicalValue(m.date, 'fat', parseFloat(e.target.value))} className="w-16 border rounded p-1 font-bold text-center" /> %
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">筋肉量</span>
                            <input type="number" step="0.1" value={m.muscle} onChange={e => handleUpdatePhysicalValue(m.date, 'muscle', parseFloat(e.target.value))} className="w-16 border rounded p-1 font-bold text-center" /> kg
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: チケット・Square */}
            {activeTab === 'tickets' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">🎟️ チケット購入・決済履歴 (Square連携)</h3>
                <div className="space-y-3">
                  {currentParent.ticketsHistory.map(th => (
                    <div key={th.id} className="p-4 bg-slate-50 border rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{th.title} ({th.count}回券)</span>
                        <span className="text-emerald-600">有効期限: {th.expire}</span>
                      </div>
                      <p className="text-slate-500">購入日: {th.date} / Square決済ID: <code className="bg-slate-200 px-1 py-0.5 rounded">{th.squarePaymentId}</code></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: 近隣情報・イベント（修正・削除対応） */}
            {activeTab === 'nearby' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>📍</span> 近隣情報・イベント管理</h3>
                  <p className="text-xs text-slate-400 mt-0.5">周辺の競技場、大会スケジュール、施設情報を登録・編集・削除できます。</p>
                </div>

                {/* 新規追加フォーム */}
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 space-y-3 text-xs">
                  <h4 className="font-bold text-[#5e9bc4]">＋ 新規イベント・情報の追加</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" placeholder="タイトル（例: 区民大会）" value={newNearbyTitle} onChange={e => setNewNearbyTitle(e.target.value)} className="border rounded p-2 bg-white" />
                    <select value={newNearbyCategory} onChange={e => setNewNearbyCategory(e.target.value as any)} className="border rounded p-2 bg-white font-bold text-slate-700">
                      <option value="大会・イベント">大会・イベント</option>
                      <option value="近隣施設">近隣施設</option>
                      <option value="その他">その他</option>
                    </select>
                    <input type="date" value={newNearbyDate} onChange={e => setNewNearbyDate(e.target.value)} className="border rounded p-2 bg-white" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="場所（例: 練馬総合グラウンド）" value={newNearbyLocation} onChange={e => setNewNearbyLocation(e.target.value)} className="border rounded p-2 bg-white" />
                    <input type="text" placeholder="詳細メモ・説明" value={newNearbyDesc} onChange={e => setNewNearbyDesc(e.target.value)} className="border rounded p-2 bg-white" />
                  </div>
                  <button onClick={handleAddNearby} className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold px-4 py-2 rounded shadow-sm transition">
                    登録する
                  </button>
                </div>

                {/* 一覧・編集・削除 */}
                <div className="space-y-3">
                  {nearbyInfos.map(item => (
                    <div key={item.id} className="p-4 bg-slate-50 border rounded-xl text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${item.category === '大会・イベント' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-[#5e9bc4]'}`}>
                            {item.category}
                          </span>
                          <span className="font-bold text-slate-700">{item.date}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingNearbyId(item.id); setEditNearbyTitle(item.title); setEditNearbyDesc(item.description); }} className="text-sky-600 hover:underline">編集</button>
                          <button onClick={() => handleDeleteNearby(item.id)} className="text-rose-500 hover:underline">削除</button>
                        </div>
                      </div>

                      {editingNearbyId === item.id ? (
                        <div className="space-y-2 pt-2 border-t">
                          <input type="text" value={editNearbyTitle} onChange={e => setEditNearbyTitle(e.target.value)} className="w-full border rounded p-1 bg-white" placeholder="タイトル" />
                          <input type="text" value={editNearbyDesc} onChange={e => setEditNearbyDesc(e.target.value)} className="w-full border rounded p-1 bg-white" placeholder="説明文" />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleSaveEditNearby(item.id)} className="bg-emerald-600 text-white px-3 py-1 rounded font-bold">保存</button>
                            <button onClick={() => setEditingNearbyId(null)} className="bg-slate-300 px-3 py-1 rounded">キャンセル</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{item.title}</h4>
                          <p className="text-slate-500">📍 {item.location}</p>
                          {item.description && <p className="text-slate-700 bg-white p-2 rounded border mt-1">{item.description}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: 基本情報編集 ＆ メモ欄3つ */}
            {activeTab === 'edit_info' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-sm">✏️ 基本情報・3つのメモ欄の編集</h3>
                  <p className="text-xs text-slate-400 mt-0.5">受講生のプロフィール情報と、独立した3つのメモ欄を自由に編集できます。</p>
                </div>

                {/* 基本情報フォーム */}
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-[#5e9bc4]">■ 基本プロフィール</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">氏名</label>
                      <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">フリガナ</label>
                      <input type="text" value={editForm.kana} onChange={e => setEditForm({ ...editForm, kana: e.target.value })} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">保護者連絡先</label>
                      <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">お悩み・課題</label>
                      <input type="text" value={editForm.concern} onChange={e => setEditForm({ ...editForm, concern: e.target.value })} className="w-full border rounded p-2" />
                    </div>
                  </div>
                  <button onClick={handleSaveInfo} className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold px-4 py-2 rounded shadow-sm transition">
                    基本情報を保存する
                  </button>
                </div>

                <hr />

                {/* 3つのメモ欄 */}
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-emerald-700">■ 独立した3つのメモ欄（指導方針・特記事項など）</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">メモ欄 ①（例: トレーニング特記事項・既往歴）</label>
                      <textarea rows={3} value={editCustomMemo1} onChange={e => setEditCustomMemo1(e.target.value)} className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">メモ欄 ②（例: 食事・栄養・生活習慣アドバイス）</label>
                      <textarea rows={3} value={editCustomMemo2} onChange={e => setEditCustomMemo2(e.target.value)} className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">メモ欄 ③（例: 自主トレ・保護者との共有事項）</label>
                      <textarea rows={3} value={editCustomMemo3} onChange={e => setEditCustomMemo3(e.target.value)} className="w-full border rounded p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>

                  <button onClick={handleSaveCustomMemos} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded shadow-sm transition">
                    3つのメモを保存する
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
