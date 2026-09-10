'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// 型定義
// ==========================================
interface Child {
  id: string;
  name: string;
  kana: string;
  birthDate: string; // 2015-05-12
  concerns: string;
  goal: string;
  ticketCount: number;
  initialLessonDate: string; // 初回レッスン日 (YYYY-MM-DD)
  postureImages: string[];   // 姿勢写真URL 3枚
  sessions: SessionRecord[];
  testResults: TestResult[];
}

interface Parent {
  id: string;
  name: string;
  phone: string;
  relation: string;
  children: Child[];
}

interface SessionRecord {
  id: string;
  date: string; // 2026-09-10
  trainer: string;
  content: string;
  homework: string;
  memo: string;
}

interface TestResult {
  id: string;
  date: string;
  type: 'kegazero' | 'physical';
  score: string;
  memo: string;
}

export default function ClientsPage() {
  // 顧客データ（サンプル）
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 'p1',
      name: '藤田 奈々',
      phone: '090-1111-2222',
      relation: '母親',
      children: [
        {
          id: 'c1',
          name: '藤田 陸',
          kana: 'フジタ リク',
          birthDate: '2015-05-12',
          concerns: 'サッカーでの体幹ブレ・走力向上',
          goal: 'トレセン選出・ブレない軸作り',
          ticketCount: 1,
          initialLessonDate: '2026-03-01',
          postureImages: ['', '', ''],
          sessions: [
            {
              id: 's1',
              date: '2026-10-05',
              trainer: 'TAKA',
              content: 'フィジカルテスト＆スプリントフォームチェック',
              homework: '体幹キープ 1分×3セット',
              memo: '前回よりブレが少なくなってきた。'
            },
            {
              id: 's2',
              date: '2026-09-15',
              trainer: 'NANA',
              content: '股関節の可動域向上ストレッチ',
              homework: '股関節回し 左右各20回',
              memo: '硬さが取れてきた様子。'
            }
          ],
          testResults: [
            { id: 't1', date: '2026-06-01', type: 'physical', score: 'A判定', memo: 'バランス能力向上' }
          ]
        }
      ]
    },
    {
      id: 'p2',
      name: '山田 太郎',
      phone: '090-3333-4444',
      relation: '父親',
      children: [
        {
          id: 'c2',
          name: '山田 花子',
          kana: 'ヤマダ ハナコ',
          birthDate: '2017-08-20',
          concerns: '姿勢改善・柔軟性向上',
          goal: '猫背解消とブリッジができるようになる',
          ticketCount: 4,
          initialLessonDate: '2026-04-10',
          postureImages: ['', '', ''],
          sessions: [],
          testResults: []
        }
      ]
    }
  ]);

  // 選択中の受講生ID（初期値：藤田陸）
  const [selectedChildId, setSelectedChildId] = useState<string>('c1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'karte' | 'tickets' | 'info' | 'history' | '3month'>('karte');

  // 新規セッション入力用フォーム state
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTrainer, setNewTrainer] = useState<string>('TAKA');
  const [newContent, setNewContent] = useState<string>('');
  const [newHomework, setNewHomework] = useState<string>('');
  const [newMemo, setNewMemo] = useState<string>('');

  // ----------------------------------------------------
  // 自動計算・判定ロジック
  // ----------------------------------------------------
  // 現在選択されている子供と親のオブジェクトを取得
  let selectedChild: Child | null = null;
  let selectedParent: Parent | null = null;

  for (const parent of parents) {
    const found = parent.children.find(c => c.id === selectedChildId);
    if (found) {
      selectedChild = found;
      selectedParent = parent;
      break;
    }
  }

  // 年齢の自動計算
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return '';
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age}歳`;
  };

  // 3ヶ月測定判定（初回レッスン日を基準に3ヶ月ごとの対象月）
  const check3MonthMeasurement = (initialDateStr: string) => {
    if (!initialDateStr) return { isTarget: false, targetMonthsText: '-' };
    const initialDate = new Date(initialDateStr);
    const today = new Date();
    
    // 初回レッスン月を起点として、3ヶ月、6ヶ月、9ヶ月、12ヶ月後...を算出
    const initMonth = initialDate.getMonth(); // 0-11
    const currentMonth = today.getMonth(); // 0-11
    
    // 何ヶ月経過したか
    const diffMonths = (today.getFullYear() - initialDate.getFullYear()) * 12 + (currentMonth - initMonth);
    
    // 3の倍数月（0ヶ月目含む、または経過月が3の倍数）かどうか
    const isTarget = diffMonths >= 0 && diffMonths % 3 === 0;
    
    // 次回の測定対象月を計算（例: 1月初回なら 4, 7, 10月）
    const targetMonths = [
      (initMonth + 3) % 12 || 12,
      (initMonth + 6) % 12 || 12,
      (initMonth + 9) % 12 || 12,
      (initMonth + 12) % 12 || 12,
    ];

    return {
      isTarget,
      targetMonthsText: `${targetMonths.join('・')}月が測定月です`
    };
  };

  const measurementInfo = selectedChild ? check3MonthMeasurement(selectedChild.initialLessonDate) : { isTarget: false, targetMonthsText: '' };

  // ----------------------------------------------------
  // セッション追加ハンドラー
  // ----------------------------------------------------
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId || !newContent) return;

    const newSession: SessionRecord = {
      id: 's_' + Date.now(),
      date: newDate,
      trainer: newTrainer,
      content: newContent,
      homework: newHomework,
      memo: newMemo
    };

    setParents(parents.map(parent => ({
      ...parent,
      children: parent.children.map(child => {
        if (child.id === selectedChildId) {
          return {
            ...child,
            ticketCount: Math.max(0, child.ticketCount - 1), // チケット自動消化
            sessions: [newSession, ...child.sessions]
          };
        }
        return child;
      })
    })));

    // フォームリセット
    setNewContent('');
    setNewHomework('');
    setNewMemo('');
    alert('セッションを登録し、チケットを1回消費しました！');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ヘッダー */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded text-lg">G</span>
          <div>
            <h1 className="text-lg font-bold tracking-wider">パーソナルジム GOLAZO</h1>
            <p className="text-xs text-slate-400">マネジメントシステム</p>
          </div>
        </div>
        <nav className="flex space-x-4 text-sm">
          <button className="text-slate-300 hover:text-white">売上管理</button>
          <button className="text-white font-bold border-b-2 border-emerald-400 pb-1">顧客リスト</button>
          <button className="text-slate-300 hover:text-white">タスク・議事録</button>
          <button className="text-slate-300 hover:text-white">近隣情報</button>
          <button className="text-slate-300 hover:text-white">マシン・薬剤一覧</button>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左サイドバー：受講生一覧 */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-slate-700 flex items-center gap-1">
                <span>👥</span> 受講生一覧
              </h2>
              <button className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded shadow hover:bg-blue-700">
                Square同期
              </button>
            </div>
            <input
              type="text"
              placeholder="名前・保護者・お悩みで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {parents.map(parent => 
              parent.children
                .filter(child => 
                  child.name.includes(searchQuery) || 
                  parent.name.includes(searchQuery) || 
                  child.concerns.includes(searchQuery)
                )
                .map(child => {
                  const isSelected = child.id === selectedChildId;
                  const ageStr = calculateAge(child.birthDate);
                  const isAlert = check3MonthMeasurement(child.initialLessonDate).isTarget;

                  return (
                    <div
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-400 shadow-sm' 
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900">{child.name}</span>
                        <span className="text-xs text-slate-500">{ageStr}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">保護者: {parent.name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded truncate max-w-[160px]">
                          💡 {child.concerns}
                        </span>
                        {isAlert && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                            要確認
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </aside>

        {/* メインコンテンツ：顧客カルテ詳細 */}
        <main className="flex-1 bg-slate-50 overflow-y-auto p-6">
          {selectedChild && selectedParent ? (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* トップ基本情報カード */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-900">{selectedChild.name}</h2>
                      <span className="text-sm text-slate-500">({selectedChild.kana})</span>
                      <span className="text-sm font-semibold bg-slate-100 px-2.5 py-0.5 rounded text-slate-700">
                        {calculateAge(selectedChild.birthDate)} ({selectedChild.birthDate}生)
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span>👤 保護者: {selectedParent.name} ({selectedParent.relation} / {selectedParent.phone})</span>
                      <span className="text-blue-600 font-bold">🎫 チケット残: {selectedChild.ticketCount} 回</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      初回レッスン: {selectedChild.initialLessonDate}
                    </div>
                  </div>

                  {/* タブ切り替えボタン群 */}
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setActiveTab('karte')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'karte' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      カルテ・比較
                    </button>
                    <button 
                      onClick={() => setActiveTab('tickets')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'tickets' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      チケット履歴
                    </button>
                    <button 
                      onClick={() => setActiveTab('3month')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${activeTab === '3month' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      3ヶ月測定詳細
                    </button>
                    <button 
                      onClick={() => setActiveTab('info')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${activeTab === 'info' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      基本情報編集
                    </button>
                  </div>
                </div>

                {/* 3ヶ月測定アラートバッジ（条件合致時のみ表示） */}
                {measurementInfo.isTarget && (
                  <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r flex items-center gap-2">
                    <span className="text-amber-500 font-bold">⚠️</span>
                    <span className="text-sm font-bold text-amber-900">3ヶ月測定の時期です ({measurementInfo.targetMonthsText})</span>
                  </div>
                )}
              </div>

              {/* タブごとの表示内容 */}
              {activeTab === 'karte' && (
                <div className="space-y-6">
                  {/* お悩み＆目標カード */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">🎯 お悩み・課題</h3>
                      <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedChild.concerns}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">🏆 目標</h3>
                      <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedChild.goal}</p>
                    </div>
                  </div>

                  {/* 新規セッション・レッスン記録の追加フォーム */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <span>📝</span> 新規セッション・レッスン記録の追加
                    </h3>
                    <form onSubmit={handleAddSession} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">実施日</label>
                          <input 
                            type="date" 
                            value={newDate} 
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">担当トレーナー</label>
                          <select 
                            value={newTrainer} 
                            onChange={(e) => setNewTrainer(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="TAKA">TAKA</option>
                            <option value="NANA">NANA</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">レッスン内容・フィジカルメモ</label>
                        <textarea 
                          rows={3}
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          placeholder="本日の指導内容や気づきを記入..."
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">宿題・自主トレ</label>
                        <input 
                          type="text" 
                          value={newHomework}
                          onChange={(e) => setNewHomework(e.target.value)}
                          placeholder="例：体幹キープ 1分×3セット"
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button 
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg shadow transition text-sm"
                        >
                          セッション記録を登録する
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* 過去のセッション履歴 */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-md font-bold text-slate-800 mb-4">📖 過去のセッション履歴</h3>
                    <div className="space-y-4">
                      {selectedChild.sessions.length > 0 ? (
                        selectedChild.sessions.map((session) => (
                          <div key={session.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-bold text-blue-600">{session.date}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">担当: {session.trainer}</span>
                                <button className="text-xs text-slate-400 hover:text-blue-600">編集</button>
                                <button className="text-xs text-slate-400 hover:text-red-600">削除</button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-800">{session.content}</p>
                            {session.homework && (
                              <p className="text-xs text-emerald-700 mt-1 font-medium">📌 宿題・自主トレ: {session.homework}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-4">まだセッション履歴はありません。</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-md font-bold text-slate-800 mb-4">🎫 チケット残高・消化履歴</h3>
                  <p className="text-sm text-slate-600 mb-4">現在の残チケット: <strong className="text-blue-600 text-lg">{selectedChild.ticketCount} 回</strong></p>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <th className="p-3">日付</th>
                          <th className="p-3">内容</th>
                          <th className="p-3">増減</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="p-3">2026-10-05</td>
                          <td className="p-3">通常セッション消化</td>
                          <td className="p-3 text-red-600 font-bold">-1回</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === '3month' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h3 className="text-md font-bold text-slate-800">📊 3ヶ月測定詳細・ハイライト</h3>
                  <p className="text-sm text-slate-600">
                    初回レッスン日 ({selectedChild.initialLessonDate}) を基準とした3ヶ月ごとの測定スケジュール管理および数値の推移を確認できます。
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-bold text-blue-900">判定状況: {measurementInfo.targetMonthsText}</p>
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-md font-bold text-slate-800 mb-4">⚙️ 基本情報の編集</h3>
                  <p className="text-sm text-slate-600">受講生および保護者様の基本情報・初回レッスン日の変更を行います。</p>
                </div>
              )}

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              受講生を選択してください
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
