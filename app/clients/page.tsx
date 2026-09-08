'use client';

import React, { useState } from 'react';

// --- 型定義 ---
interface Session {
  id: string;
  date: string;
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
    front: string | null;
    side: string | null;
    back: string | null;
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

interface Student {
  id: string;
  parentId: string; // 1:N 構造（保護者ID）
  name: string;
  kana: string;
  age: number;
  birthdate: string;
  firstLessonDate: string;
  lastReservationDate: string;
  concern: string;
  target: string;
  memo: string;
  alert: string | null;
  physicalHistory: PhysicalData[];
  sessions: Session[];
}

export default function ClientsPage() {
  // 保護者データ (Square連携・チケット管理)
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 'p-101',
      name: '藤田 奈々',
      kana: 'フジタ ナナ',
      phone: '090-1111-2222',
      ticketRemaining: 8,
      ticketsHistory: [
        { id: 'th-1', date: '2026-06-01', title: '10回券 (共通)', count: 10, expire: '2026-12-01', squarePaymentId: 'sq_pay_998811' }
      ]
    },
    {
      id: 'p-102',
      name: '山田 太郎',
      kana: 'ヤマダ タロウ',
      phone: '090-1234-5678',
      ticketRemaining: 3,
      ticketsHistory: [
        { id: 'th-2', date: '2026-08-01', title: '5回券', count: 5, expire: '2027-02-01', squarePaymentId: 'sq_pay_772200' }
      ]
    }
  ]);

  // 受講生（子供）データ一覧
  const [students, setStudents] = useState<Student[]>([
    {
      id: 's-001',
      parentId: 'p-101',
      name: '藤田 陸',
      kana: 'フジタ リク',
      age: 11,
      birthdate: '2015-05-12',
      firstLessonDate: '2026-03-01',
      lastReservationDate: '2026-08-22',
      concern: 'サッカーでの体幹ブレ・走力向上',
      target: 'トレセン選出・ブレない軸作り',
      memo: '右足首捻挫の既往歴あり。兄。',
      alert: '前回セッションから2週間以上空いています',
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
          weight: 38.5,
          fat: 15.2,
          muscle: 30.8,
          note: '2回目3ヶ月測定',
          posturePhotos: { front: null, side: null, back: null },
          testPhotos: []
        }
      ],
      sessions: [
        { id: 'ses-1', date: '2026-09-01', staff: 'TAKA', content: 'KOBA式体幹トレーニング＆リアクションアジリティ', homework: '片足バランス 1分×2回', photo: null },
        { id: 'ses-2', date: '2026-08-22', staff: 'NANA', content: 'フットアライメント評価・軸足強化', homework: '足指じゃんけん100回', photo: null }
      ]
    },
    {
      id: 's-002',
      parentId: 'p-101', // 同じ保護者（藤田 奈々）に紐づく弟
      name: '藤田 翔',
      kana: 'フジタ ショウ',
      age: 8,
      birthdate: '2018-09-20',
      firstLessonDate: '2026-04-10',
      lastReservationDate: '2026-08-30',
      concern: '運動神経向上・ボール感覚',
      target: 'アジリティUP',
      memo: '弟。リズムトレーニングを好む。',
      alert: null,
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
        { id: 'ses-3', date: '2026-08-30', staff: 'NANA', content: 'スポーツリズムステップ・コーディネーション', homework: 'ケンケンパ練習', photo: null }
      ]
    }
  ]);

  // UI状態
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-001');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');

  // 選択中の生徒と保護者
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentParent = parents.find(p => p.id === currentStudent.parentId) || parents[0];
  const siblingStudents = students.filter(s => s.parentId === currentParent.id);

  // 測定比較用（年月選択）
  const [selectedPhysicalDate, setSelectedPhysicalDate] = useState<string>(
    currentStudent.physicalHistory[currentStudent.physicalHistory.length - 1]?.date || '2026-09-01'
  );
  const currentPhysical = currentStudent.physicalHistory.find(m => m.date === selectedPhysicalDate) || currentStudent.physicalHistory[0];

  // セッション表示年月フィルター
  const [sessionYearMonth, setSessionYearMonth] = useState<string>('ALL');

  // 新規セッションフォーム
  const [newSessionDate, setNewSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newSessionStaff, setNewSessionStaff] = useState<'TAKA' | 'NANA'>('TAKA');
  const [newSessionContent, setNewSessionContent] = useState<string>('');
  const [newSessionHomework, setNewSessionHomework] = useState<string>('');

  // 基本情報手動編集モード
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    name: currentStudent.name,
    kana: currentStudent.kana,
    phone: currentParent.phone,
    concern: currentStudent.concern,
    target: currentStudent.target,
    memo: currentStudent.memo
  });

  // キーワード検索による絞り込み
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

  // --- ハンドラー関係 ---
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const target = students.find(s => s.id === id);
    if (target && target.physicalHistory.length > 0) {
      setSelectedPhysicalDate(target.physicalHistory[target.physicalHistory.length - 1].date);
    }
  };

  // セッション登録 (チケット自動1回消化)
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
      prev.map(s => (s.id === currentStudent.id ? { ...s, sessions: [newSession, ...s.sessions] } : s))
    );

    // 保護者の回数券を1回減算
    setParents(prev =>
      prev.map(p => (p.id === currentParent.id ? { ...p, ticketRemaining: Math.max(0, p.ticketRemaining - 1) } : p))
    );

    setNewSessionContent('');
    setNewSessionHomework('');
  };

  // 画像アップロード（ドラッグ＆ドロップ用シミュレーション）
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'posture' | 'test', keyName?: 'front' | 'side' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updatedHistory = s.physicalHistory.map(m => {
          if (m.date !== selectedPhysicalDate) return m;
          if (type === 'posture' && keyName) {
            return {
              ...m,
              posturePhotos: { ...m.posturePhotos, [keyName]: url }
            };
          } else if (type === 'test') {
            return {
              ...m,
              testPhotos: [...(m.testPhotos || []), url]
            };
          }
          return m;
        });
        return { ...s, physicalHistory: updatedHistory };
      })
    );
  };

  // 身体データ手動修正
  const handleUpdatePhysicalValue = (field: keyof PhysicalData, val: any) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updated = s.physicalHistory.map(m => {
          if (m.date === selectedPhysicalDate) {
            return { ...m, [field]: val };
          }
          return m;
        });
        return { ...s, physicalHistory: updated };
      })
    );
  };

  // 基本情報保存
  const handleSaveInfo = () => {
    setStudents(prev =>
      prev.map(s => (s.id === currentStudent.id ? { ...s, name: editForm.name, kana: editForm.kana, concern: editForm.concern, target: editForm.target, memo: editForm.memo } : s))
    );
    setParents(prev =>
      prev.map(p => (p.id === currentParent.id ? { ...p, phone: editForm.phone } : p))
    );
    setIsEditingInfo(false);
  };

  const availableYearMonths = Array.from(
    new Set(currentStudent.sessions.map(s => s.date.substring(0, 7)))
  ).sort().reverse();

  const filteredSessions = currentStudent.sessions.filter(s => {
    if (sessionYearMonth === 'ALL') return true;
    return s.date.startsWith(sessionYearMonth);
  });

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      {/* ヘッダー */}
      <header className="bg-[#5e9bc4] text-white px-6 py-3 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold tracking-wider">パーソナルジム GOLAZO 管理システム</h1>
        <nav className="flex gap-4 text-xs font-semibold">
          <span className="opacity-80 cursor-pointer hover:opacity-100">売上管理</span>
          <span className="bg-white text-[#5e9bc4] px-3 py-1 rounded shadow-sm font-bold">顧客カルテ</span>
          <span className="opacity-80 cursor-pointer hover:opacity-100">タスク・議事録</span>
        </nav>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-4">
        {/* メインレイアウト（2カラム） */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* 左カラム：受講生一覧・キーワード検索 */}
          <div className="md:col-span-1 space-y-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-600">🔍 キーワード検索</label>
              <input
                type="text"
                placeholder="名前、悩み、メモで検索..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-[#5e9bc4] outline-none"
              />
            </div>

            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">受講生一覧 ({filteredStudents.length}名)</h3>
            {filteredStudents.map(student => {
              const parent = parents.find(p => p.id === student.parentId);
              return (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition shadow-sm ${
                    selectedStudentId === student.id
                      ? 'bg-sky-50 border-[#5e9bc4] ring-2 ring-sky-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800">{student.name}</span>
                    <span className="text-xs font-semibold text-[#5e9bc4]">{student.age}歳</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">保護者: {parent?.name}</p>
                  {student.alert && (
                    <span className="inline-block mt-2 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      要確認アラートあり
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 右カラム：受講生詳細・カルテ管理 */}
          <div className="md:col-span-3 space-y-4">

            {/* 基本情報ヘッダー＆保護者・兄弟連携表示 */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-semibold">{currentStudent.kana}</span>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    {currentStudent.name} <span className="text-sm font-normal text-slate-500">({currentStudent.age}歳)</span>
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      保護者 (Square連携): {currentParent.name} 様 ({currentParent.phone})
                    </span>
                    <span className="bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                      🎟️ 家族共通共有チケット残数: {currentParent.ticketRemaining} 回
                    </span>
                  </div>
                </div>

                {/* 兄弟切り替えボタン */}
                {siblingStudents.length > 1 && (
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded text-right">
                    <span className="text-[10px] text-amber-800 font-bold block mb-1">👨‍👩‍👧‍👦 ご兄弟でのご利用</span>
                    <div className="flex gap-1">
                      {siblingStudents.map(sib => (
                        <button
                          key={sib.id}
                          onClick={() => handleSelectStudent(sib.id)}
                          className={`text-xs px-2 py-1 rounded font-bold ${
                            sib.id === currentStudent.id ? 'bg-amber-600 text-white' : 'bg-white text-amber-900 border border-amber-300'
                          }`}
                        >
                          {sib.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* タブ切り替えメニュー */}
              <div className="flex border-b border-slate-200 pt-2 gap-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('carte')}
                  className={`pb-2 border-b-2 transition ${activeTab === 'carte' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400'}`}
                >
                  📋 カルテ (セッション・3ヶ月測定・写真)
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`pb-2 border-b-2 transition ${activeTab === 'tickets' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400'}`}
                >
                  🎟️ チケット購入履歴 & Square連携
                </button>
                <button
                  onClick={() => setActiveTab('edit_info')}
                  className={`pb-2 border-b-2 transition ${activeTab === 'edit_info' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400'}`}
                >
                  ✏️ 基本情報・手動編集
                </button>
              </div>
            </div>

            {/* TAB 1: カルテ画面 */}
            {activeTab === 'carte' && (
              <div className="space-y-6">

                {/* 3ヶ月定期計測・身体データ推移 & 姿勢/テスト写真比較 */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">①〜⑤ 3ヶ月定期計測・身体データ推移 & 写真管理</h3>
                      <p className="text-[11px] text-slate-400">年度・月を選択して過去の姿勢写真やテストデータを比較表示できます</p>
                    </div>
                    {/* 年月比較フィルター */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-600">表示・比較月:</span>
                      <select
                        value={selectedPhysicalDate}
                        onChange={e => setSelectedPhysicalDate(e.target.value)}
                        className="border border-slate-300 rounded p-1 font-bold text-[#5e9bc4]"
                      >
                        {currentStudent.physicalHistory.map(m => (
                          <option key={m.id} value={m.date}>{m.date} 計測データ</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 数値データ手動編集 */}
                  {currentPhysical && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
                      <div>
                        <label className="text-slate-500 font-semibold block">体重 (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentPhysical.weight}
                          onChange={e => handleUpdatePhysicalValue('weight', parseFloat(e.target.value))}
                          className="w-full border border-slate-300 rounded p-1.5 font-bold text-[#5e9bc4]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-semibold block">体脂肪率 (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentPhysical.fat}
                          onChange={e => handleUpdatePhysicalValue('fat', parseFloat(e.target.value))}
                          className="w-full border border-slate-300 rounded p-1.5 font-bold text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-semibold block">筋肉量 (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentPhysical.muscle}
                          onChange={e => handleUpdatePhysicalValue('muscle', parseFloat(e.target.value))}
                          className="w-full border border-slate-300 rounded p-1.5 font-bold text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-semibold block">メモ</label>
                        <input
                          type="text"
                          value={currentPhysical.note || ''}
                          onChange={e => handleUpdatePhysicalValue('note', e.target.value)}
                          className="w-full border border-slate-300 rounded p-1.5 text-slate-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* 姿勢写真3枚 ドラッグ＆ドロップ保存領域 */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 mb-2">📸 姿勢写真3枚 (正面 / 側面 / 背面)</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {(['front', 'side', 'back'] as const).map(type => {
                        const labels = { front: '正面', side: '側面', back: '背面' };
                        const photoUrl = currentPhysical?.posturePhotos?.[type];
                        return (
                          <div key={type} className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50 hover:bg-slate-100 transition relative">
                            <span className="text-xs font-bold text-slate-600 block mb-1">{labels[type]}写真</span>
                            {photoUrl ? (
                              <img src={photoUrl} alt={labels[type]} className="w-full h-32 object-cover rounded" />
                            ) : (
                              <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-[10px]">
                                <span>ファイルをドラッグ＆ドロップ</span>
                                <span>またはクリックしてアップロード</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleFileUpload(e, 'posture', type)}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 測定各種テスト（ケガゼロ / フィジカルチェック）写真保存領域 */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-700 mb-2">📋 測定各種テスト (ケガゼロ / フィジカルチェック) 結果シート画像</h4>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50 relative cursor-pointer hover:bg-slate-100 transition">
                      <span className="text-xs font-bold text-[#5e9bc4]">テスト結果シートをここにドラッグ＆ドロップして保存</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'test')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {currentPhysical?.testPhotos && currentPhysical.testPhotos.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto">
                        {currentPhysical.testPhotos.map((img, idx) => (
                          <img key={idx} src={img} alt="test" className="w-20 h-20 object-cover rounded border" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 新規セッション記録の追加 (担当者 TAKA / NANA 選択) */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">新規セッション記録の追加</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">日時</label>
                      <input
                        type="date"
                        value={newSessionDate}
                        onChange={e => setNewSessionDate(e.target.value)}
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-semibold">担当トレーナー</label>
                      <select
                        value={newSessionStaff}
                        onChange={e => setNewSessionStaff(e.target.value as 'TAKA' | 'NANA')}
                        className="w-full border border-slate-300 rounded p-2 font-bold text-[#5e9bc4]"
                      >
                        <option value="TAKA">TAKA (藤田 渉仁)</option>
                        <option value="NANA">NANA (藤田 奈々)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-500 mb-1 font-semibold">セッション内容</label>
                      <input
                        type="text"
                        placeholder="例: KOBA式体幹バランストレーニング"
                        value={newSessionContent}
                        onChange={e => setNewSessionContent(e.target.value)}
                        className="w-full border border-slate-300 rounded p-2"
                      />
                    </div>
                  </div>
                  <div className="text-xs">
                    <label className="block text-slate-500 mb-1 font-semibold">宿題</label>
                    <input
                      type="text"
                      placeholder="例: 片足ドローイン 1分×2"
                      value={newSessionHomework}
                      onChange={e => setNewSessionHomework(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <button
                    onClick={handleAddSession}
                    className="w-full bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold py-2 rounded text-xs transition"
                  >
                    セッションを登録（保護者チケットを1回自動消化）
                  </button>
                </div>

                {/* 時系列セッション履歴（年月タブ選択） */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-bold text-slate-800 text-sm">時系列セッション履歴</h3>
                    <div className="flex gap-1 text-xs">
                      <button
                        onClick={() => setSessionYearMonth('ALL')}
                        className={`px-3 py-1 rounded-full font-bold transition ${sessionYearMonth === 'ALL' ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        すべて
                      </button>
                      {availableYearMonths.map(ym => (
                        <button
                          key={ym}
                          onClick={() => setSessionYearMonth(ym)}
                          className={`px-3 py-1 rounded-full font-bold transition ${sessionYearMonth === ym ? 'bg-[#5e9bc4] text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {ym.replace('-', '年')}月
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredSessions.map(session => (
                      <div key={session.id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{session.date}</span>
                          <span className="text-[#5e9bc4]">担当: {session.staff}</span>
                        </div>
                        <p className="text-slate-800">{session.content}</p>
                        {session.homework && (
                          <p className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-100">
                            <span className="font-bold">宿題:</span> {session.homework}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: チケット購入履歴 & Square連携 */}
            {activeTab === 'tickets' && (
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">🎟️ 保護者（Square連携）決済 & チケット購入履歴</h3>

                <div className="bg-sky-50 p-4 rounded-lg border border-sky-200 text-xs space-y-1">
                  <p className="font-bold text-sky-900">保護者アカウント: {currentParent.name} 様</p>
                  <p className="text-sky-800">フリガナ: {currentParent.kana} | TEL: {currentParent.phone}</p>
                  <p className="text-sky-800 font-bold">現在の共有チケット残数: {currentParent.ticketRemaining} 回</p>
                </div>

                <table className="w-full text-xs text-left text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500">
                      <th className="py-2 px-2">購入日</th>
                      <th className="py-2 px-2">名目</th>
                      <th className="py-2 px-2">回数</th>
                      <th className="py-2 px-2">有効期限</th>
                      <th className="py-2 px-2">Square決済ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentParent.ticketsHistory.map(th => (
                      <tr key={th.id} className="border-b">
                        <td className="py-2 px-2">{th.date}</td>
                        <td className="py-2 px-2 font-bold text-slate-700">{th.title}</td>
                        <td className="py-2 px-2 font-bold text-[#5e9bc4]">+{th.count} 回</td>
                        <td className="py-2 px-2">{th.expire}</td>
                        <td className="py-2 px-2 text-slate-400 font-mono">{th.squarePaymentId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 3: 基本情報・手動編集 */}
            {activeTab === 'edit_info' && (
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">✏️ 基本情報・カルテ情報手動編集</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">受講生（子供）お名前</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">フリガナ</label>
                    <input
                      type="text"
                      value={editForm.kana}
                      onChange={e => setEditForm({ ...editForm, kana: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">保護者電話番号</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">目標</label>
                    <input
                      type="text"
                      value={editForm.target}
                      onChange={e => setEditForm({ ...editForm, target: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">お悩み・課題</label>
                    <textarea
                      rows={2}
                      value={editForm.concern}
                      onChange={e => setEditForm({ ...editForm, concern: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">指導メモ・既往歴</label>
                    <textarea
                      rows={2}
                      value={editForm.memo}
                      onChange={e => setEditForm({ ...editForm, memo: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveInfo}
                  className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold px-6 py-2 rounded text-xs transition"
                >
                  編集内容を保存する
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
