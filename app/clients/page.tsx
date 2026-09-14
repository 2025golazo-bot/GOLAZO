'use client';

import React, { useEffect, useState } from 'react';
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

interface MeasurementAttachment {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
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
  // フィジカルチェック／ケガゼロは測定元ファイルをそのまま添付保存
  physicalCheckFiles?: MeasurementAttachment[];
  injuryZeroFiles?: MeasurementAttachment[];
  // 旧データ互換用
  testPhotos?: string[];
}

interface TicketHistory {
  id: string;
  date: string;
  title: string;
  count: number;
  expire: string;
  squarePaymentId: string;
  squareOrderId?: string;
  receiptUrl?: string;
  amount?: number;
}

interface Parent {
  id: string;
  squareCustomerId?: string; // Square 連携用ID
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
  lastReservationDate: string; // 最終予約日（アラート判定用）
  concern: string;
  target: string;
  memo: string;
  physicalHistory: PhysicalData[];
  sessions: Session[];
}

export default function ClientsPage() {
  // 保護者データ
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 'p-101',
      squareCustomerId: 'CUS_TEST_001', // Square連携用ID
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
      squareCustomerId: 'CUS_TEST_002', // Square連携用ID
      name: '山田 太郎',
      kana: 'ヤマダ タロウ',
      phone: '090-1234-5678',
      ticketRemaining: 5,
      ticketsHistory: [
        { id: 'th-2', date: '2026-08-01', title: '5回券', count: 5, expire: '2027-02-01', squarePaymentId: 'sq_pay_772200' }
      ]
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
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');
  const [isSyncing, setIsSyncing] = useState<boolean>(false); // Square同期中のローディング状態
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 顧客カルテのデータをブラウザに保存します。
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('golazo-clients-students-v2');
      const savedParents = localStorage.getItem('golazo-clients-parents-v2');
      if (savedStudents) setStudents(JSON.parse(savedStudents));
      if (savedParents) setParents(JSON.parse(savedParents));
    } catch (error) {
      console.error('顧客カルテデータの読み込みに失敗しました:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('golazo-clients-students-v2', JSON.stringify(students));
      localStorage.setItem('golazo-clients-parents-v2', JSON.stringify(parents));
    } catch (error) {
      console.error('顧客カルテデータの保存に失敗しました:', error);
      alert('保存容量を超えた可能性があります。写真・PDFの枚数やサイズを減らしてください。');
    }
  }, [students, parents, isLoaded]);

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

  // 測定履歴編集用ステート
  const [editingMeasureId, setEditingMeasureId] = useState<string | null>(null);
  const [editMeasureDate, setEditMeasureDate] = useState<string>('');
  const [editMeasureNote, setEditMeasureNote] = useState<string>('');

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

  const [editForm, setEditForm] = useState({
    name: currentStudent.name,
    kana: currentStudent.kana,
    phone: currentParent.phone,
    concern: currentStudent.concern,
    target: currentStudent.target,
    memo: currentStudent.memo
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Squareデータ同期ハンドラー
  // ---------------------------------------------------------------------------
  const handleSquareSync = async () => {
    if (!currentParent.squareCustomerId) {
      alert('この保護者にSquare顧客IDが設定されていません。');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squareCustomerId: currentParent.squareCustomerId }),
      });

      const data = await response.json();

      if (data.success) {
        setParents(prev =>
          prev.map(p => (p.id === currentParent.id ? { ...p, ticketsHistory: data.ticketsHistory } : p))
        );
        alert('Squareから最新の購入履歴を同期しました！');
      } else {
        alert(`同期に失敗しました: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Square同期中に通信エラーが発生しました。');
    } finally {
      setIsSyncing(false);
    }
  };

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
      physicalCheckFiles: [],
      injuryZeroFiles: [],
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

  const handleStartEditMeasure = (measure: PhysicalData) => {
    setEditingMeasureId(measure.id);
    setEditMeasureDate(measure.date);
    setEditMeasureNote(measure.note || '');
  };

  const handleCancelEditMeasure = () => {
    setEditingMeasureId(null);
    setEditMeasureDate('');
    setEditMeasureNote('');
  };

  const handleSaveEditMeasure = (measureId: string) => {
    if (!editMeasureDate) {
      alert('測定日を入力してください。');
      return;
    }

    const duplicate = currentStudent.physicalHistory.some(
      m => m.id !== measureId && m.date === editMeasureDate
    );
    if (duplicate) {
      alert('その測定日はすでに登録されています。別の日付を指定してください。');
      return;
    }

    const targetMeasure = currentStudent.physicalHistory.find(m => m.id === measureId);
    if (!targetMeasure) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updated = s.physicalHistory
          .map(m =>
            m.id === measureId
              ? { ...m, date: editMeasureDate, note: editMeasureNote }
              : m
          )
          .sort((a, b) => a.date.localeCompare(b.date));
        return { ...s, physicalHistory: updated };
      })
    );

    // 日付を変更した場合も比較対象を新しい日付へ追従させる
    if (beforeDate === targetMeasure.date) setBeforeDate(editMeasureDate);
    if (afterDate === targetMeasure.date) setAfterDate(editMeasureDate);

    handleCancelEditMeasure();
    alert(`測定結果（${editMeasureDate}）を更新しました。`);
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

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetDate: string,
    type: 'posture' | 'physicalCheck' | 'injuryZero',
    keyName?: 'front' | 'side' | 'back'
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        if (!dataUrl) return;

        setStudents(prev =>
          prev.map(s => {
            if (s.id !== currentStudent.id) return s;

            const updatedHistory = s.physicalHistory.map(m => {
              if (m.date !== targetDate) return m;

              if (type === 'posture' && keyName) {
                return {
                  ...m,
                  posturePhotos: {
                    ...(m.posturePhotos || { front: null, side: null, back: null }),
                    [keyName]: dataUrl
                  }
                };
              }

              const attachment: MeasurementAttachment = {
                id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                name: file.name,
                type: file.type || 'application/octet-stream',
                dataUrl
              };

              if (type === 'physicalCheck') {
                return {
                  ...m,
                  physicalCheckFiles: [...(m.physicalCheckFiles || []), attachment]
                };
              }

              return {
                ...m,
                injuryZeroFiles: [...(m.injuryZeroFiles || []), attachment]
              };
            });

            return { ...s, physicalHistory: updatedHistory };
          })
        );
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleDeletePosturePhoto = (targetDate: string, keyName: 'front' | 'side' | 'back') => {
    if (!confirm('この姿勢写真を削除しますか？')) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updatedHistory = s.physicalHistory.map(m => {
          if (m.date !== targetDate) return m;
          const currentPhotos = m.posturePhotos || { front: null, side: null, back: null };
          return {
            ...m,
            posturePhotos: { ...currentPhotos, [keyName]: null }
          };
        });
        return { ...s, physicalHistory: updatedHistory };
      })
    );
  };

  const handleDeleteMeasurementFile = (
    targetDate: string,
    type: 'physicalCheck' | 'injuryZero',
    fileId: string
  ) => {
    if (!confirm('この測定結果ファイルを削除しますか？')) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;

        const updatedHistory = s.physicalHistory.map(m => {
          if (m.date !== targetDate) return m;

          if (type === 'physicalCheck') {
            return {
              ...m,
              physicalCheckFiles: (m.physicalCheckFiles || []).filter(file => file.id !== fileId)
            };
          }

          return {
            ...m,
            injuryZeroFiles: (m.injuryZeroFiles || []).filter(file => file.id !== fileId)
          };
        });

        return { ...s, physicalHistory: updatedHistory };
      })
    );
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

  const calcDiff = (afterVal: number, beforeVal: number, unit: string, isImprovementWhenIncrease: boolean = true) => {
    if (afterVal === undefined || beforeVal === undefined) return null;
    const diff = Number((afterVal - beforeVal).toFixed(1));
    if (diff === 0) return <span className="text-slate-400 font-normal">±0{unit}</span>;
    const formattedStr = diff > 0 ? `+${diff}${unit}` : `${diff}${unit}`;
    let colorClass = isImprovementWhenIncrease ? (diff > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800') : (diff < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800');
    return <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>{formattedStr}</span>;
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      {/* 共通の Header コンポーネントを使用 */}
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

                {/* アラートバッジ群 */}
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

              {/* タブ */}
              <div className="flex border-b border-slate-200 pt-2 gap-6 text-xs font-bold">
                <button onClick={() => setActiveTab('carte')} className={`pb-3 border-b-2 transition ${activeTab === 'carte' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  📋 カルテ (セッション & 計測・写真比較)
                </button>
                <button onClick={() => setActiveTab('tickets')} className={`pb-3 border-b-2 transition ${activeTab === 'tickets' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  🎟️ チケット購入履歴 & Square
                </button>
                <button onClick={() => setActiveTab('edit_info')} className={`pb-3 border-b-2 transition ${activeTab === 'edit_info' ? 'border-[#5e9bc4] text-[#5e9bc4]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                  ✏️ 基本情報編集・削除
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
                    <div className="flex items-center gap-2 text-xs">
                      <label className="flex items-center gap-1 font-semibold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useTicket}
                          onChange={e => setUseTicket(e.target.checked)}
                          className="rounded text-[#5e9bc4]"
                        />
                        回数券を1回消化する
                      </label>
                    </div>
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
                    セッションを登録する {useTicket ? '(回数券1回消化)' : '(都度・回数券なし)'}
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

                {/* 3ヶ月定期計測・写真比較 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><span>📊</span> 3ヶ月定期計測・姿勢 & 測定シート比較</h3>
                      <p className="text-[11px] text-slate-400">計測データの追加・数値編集・写真の差し替えおよび削除が可能</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="date" value={newMeasureDate} onChange={e => setNewMeasureDate(e.target.value)} className="border rounded px-2.5 py-1 text-xs" />
                      <button onClick={handleAddNewMeasureDate} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition whitespace-nowrap">
                        ＋ 新規計測日を追加
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-sky-50/50 p-3.5 rounded-xl border border-sky-100 text-xs">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="font-bold text-slate-600 bg-slate-200 px-2 py-1 rounded">Before</span>
                        <select value={beforeDate} onChange={e => setBeforeDate(e.target.value)} className="border rounded p-1.5 font-bold text-[#5e9bc4] bg-white flex-1">
                          {physicalDates.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <span className="font-bold text-slate-400">vs</span>
                      <div className="flex items-center gap-1 flex-1">
                        <span className="font-bold text-white bg-[#5e9bc4] px-2 py-1 rounded">After</span>
                        <select value={afterDate} onChange={e => setAfterDate(e.target.value)} className="border rounded p-1.5 font-bold text-[#5e9bc4] bg-white flex-1">
                          {physicalDates.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 比較テーブル・計測データ */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b">
                          <th className="p-2.5 font-semibold">測定項目</th>
                          <th className="p-2.5 font-semibold">Before ({beforeDate})</th>
                          <th className="p-2.5 font-semibold">After ({afterDate})</th>
                          <th className="p-2.5 font-semibold">増減・変化</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2.5 font-bold text-slate-700">体重 (kg)</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.1"
                              value={beforePhysical?.weight === 0 ? '' : beforePhysical?.weight ?? ''}
                              onChange={e => handleUpdatePhysicalValue(beforeDate, 'weight', e.target.value === '' ? 0 : Number(e.target.value))}
                              className="w-20 border rounded p-1"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.1"
                              value={afterPhysical?.weight === 0 ? '' : afterPhysical?.weight ?? ''}
                              onChange={e => handleUpdatePhysicalValue(afterDate, 'weight', e.target.value === '' ? 0 : Number(e.target.value))}
                              className="w-20 border rounded p-1"
                            />
                          </td>
                          <td className="p-2.5">{calcDiff(afterPhysical?.weight, beforePhysical?.weight, 'kg', false)}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-700">体脂肪率 (%)</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.1"
                              value={beforePhysical?.fat === 0 ? '' : beforePhysical?.fat ?? ''}
                              onChange={e => handleUpdatePhysicalValue(beforeDate, 'fat', e.target.value === '' ? 0 : Number(e.target.value))}
                              className="w-20 border rounded p-1"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.1"
                              value={afterPhysical?.fat === 0 ? '' : afterPhysical?.fat ?? ''}
                              onChange={e => handleUpdatePhysicalValue(afterDate, 'fat', e.target.value === '' ? 0 : Number(e.target.value))}
                              className="w-20 border rounded p-1"
                            />
                          </td>
                          <td className="p-2.5">{calcDiff(afterPhysical?.fat, beforePhysical?.fat, '%', false)}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-700">筋肉量 (kg)</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.1"
                              value={beforePhysical?.muscle === 0 ? '' : beforePhysical?.muscle ?? ''}
                              onChange={e => handleUpdatePhysicalValue(beforeDate, 'muscle', e.target.value === '' ? 0 : Number(e.target.value))}
                              className="w-20 border rounded p-1"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.1"
                              value={afterPhysical?.muscle === 0 ? '' : afterPhysical?.muscle ?? ''}
                              onChange={e => handleUpdatePhysicalValue(afterDate, 'muscle', e.target.value === '' ? 0 : Number(e.target.value))}
                              className="w-20 border rounded p-1"
                            />
                          </td>
                          <td className="p-2.5">{calcDiff(afterPhysical?.muscle, beforePhysical?.muscle, 'kg', true)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 姿勢写真：Before / Afterを正面・側面・背面で個別保存 */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 text-xs">📸 姿勢写真（正面・側面・背面）</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { key: 'front' as const, label: '正面 (Front)' },
                        { key: 'side' as const, label: '側面 (Side)' },
                        { key: 'back' as const, label: '背面 (Back)' }
                      ].map(({ key, label }) => (
                        <div key={key} className="border rounded-xl p-3 bg-slate-50">
                          <div className="font-bold text-xs text-slate-600 mb-2">{label}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { title: 'Before', date: beforeDate, data: beforePhysical?.posturePhotos?.[key] },
                              { title: 'After', date: afterDate, data: afterPhysical?.posturePhotos?.[key] }
                            ].map(item => (
                              <div key={`${key}-${item.title}`} className="bg-white rounded-lg border p-2">
                                <div className="text-[10px] font-bold text-slate-500 mb-1">{item.title}</div>
                                {item.data ? (
                                  <div className="relative">
                                    <img src={item.data} alt={`${label} ${item.title}`} className="w-full h-28 object-cover rounded border" />
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePosturePhoto(item.date, key)}
                                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-5 h-5 text-xs"
                                    >×</button>
                                  </div>
                                ) : (
                                  <div className="h-28 flex items-center justify-center text-[10px] text-slate-400 border border-dashed rounded">未登録</div>
                                )}
                                <label className="mt-2 block text-center bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-[10px] px-2 py-1.5 rounded cursor-pointer">
                                  {item.data ? '写真を差し替え' : '写真を追加'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleFileUpload(e, item.date, 'posture', key)}
                                  />
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 測定結果ファイル：フィジカルチェックとケガゼロを分離 */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 text-xs">📄 測定結果ファイル</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          type: 'physicalCheck' as const,
                          title: 'フィジカルチェック',
                          files: afterPhysical?.physicalCheckFiles || []
                        },
                        {
                          type: 'injuryZero' as const,
                          title: 'ケガゼロプロジェクト',
                          files: afterPhysical?.injuryZeroFiles || []
                        }
                      ].map(section => (
                        <div key={section.type} className="border rounded-xl p-4 bg-white">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <h5 className="font-bold text-xs text-slate-700">{section.title}</h5>
                            <label className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap">
                              ＋ PDF / 写真を追加
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                multiple
                                className="hidden"
                                onChange={e => handleFileUpload(e, afterDate, section.type)}
                              />
                            </label>
                          </div>
                          {section.files.length > 0 ? (
                            <div className="space-y-2">
                              {section.files.map(file => (
                                <div key={file.id} className="flex items-center justify-between gap-2 bg-slate-50 border rounded-lg p-2">
                                  <a
                                    href={file.dataUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-[#5e9bc4] font-bold hover:underline truncate"
                                    title={file.name}
                                  >
                                    {file.type === 'application/pdf' ? '📄' : '🖼️'} {file.name}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMeasurementFile(afterDate, section.type, file.id)}
                                    className="text-[10px] text-rose-500 hover:underline whitespace-nowrap"
                                  >
                                    削除
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 py-3 text-center border border-dashed rounded-lg">
                              測定結果のPDFまたは写真を登録してください
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      ※ 測定結果そのものは別ファイルで作成し、GOLAZOにはPDFまたは写真を記録として添付します。
                    </p>
                  </div>

                  {/* 測定履歴の修正・削除 */}
                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-700 text-xs">📝 測定履歴の修正・削除</h4>
                      <p className="text-[10px] text-slate-400 mt-1">過去の測定日やメモを後から修正できます。数値は上の表から直接修正できます。</p>
                    </div>

                    <div className="space-y-2">
                      {[...currentStudent.physicalHistory].sort((a, b) => a.date.localeCompare(b.date)).map(measure => (
                        <div key={measure.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          {editingMeasureId === measure.id ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">測定日</label>
                                  <input
                                    type="date"
                                    value={editMeasureDate}
                                    onChange={e => setEditMeasureDate(e.target.value)}
                                    className="w-full border border-slate-300 rounded p-2 text-xs bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">メモ</label>
                                  <input
                                    type="text"
                                    value={editMeasureNote}
                                    onChange={e => setEditMeasureNote(e.target.value)}
                                    className="w-full border border-slate-300 rounded p-2 text-xs bg-white"
                                    placeholder="例：3ヶ月定期測定"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelEditMeasure}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded text-[10px] font-bold"
                                >
                                  キャンセル
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditMeasure(measure.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-[10px] font-bold"
                                >
                                  保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div>
                                <span className="font-bold text-xs text-slate-700">📅 {measure.date}</span>
                                {measure.note && <span className="ml-2 text-[10px] text-slate-400">{measure.note}</span>}
                              </div>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditMeasure(measure)}
                                  className="text-[10px] text-sky-600 hover:underline font-bold"
                                >
                                  ✏️ 編集
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMeasureDate(measure.date)}
                                  disabled={currentStudent.physicalHistory.length <= 1}
                                  className="text-[10px] text-rose-500 hover:underline font-bold disabled:text-slate-300 disabled:no-underline"
                                >
                                  🗑️ 削除
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: チケット購入履歴 & Square */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <span>🎟️</span> Square 決済・回数券購入履歴
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Squareアカウント（顧客ID: {currentParent.squareCustomerId || '未連携'}）と紐づく購入履歴です
                      </p>
                    </div>
                    {/* Square同期ボタン */}
                    <button
                      onClick={handleSquareSync}
                      disabled={isSyncing}
                      className="bg-sky-50 text-[#5e9bc4] border border-sky-200 hover:bg-sky-100 font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 disabled:opacity-50 shadow-sm"
                    >
                      <span>🔄</span> {isSyncing ? '同期中...' : 'Squareデータ同期'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentParent.ticketsHistory.length > 0 ? (
                      currentParent.ticketsHistory.map(ticket => (
                        <div key={ticket.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <span className="font-bold text-slate-800 text-sm">{ticket.title}</span>
                              <span className="ml-2 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                付与回数: {ticket.count}回
                              </span>
                            </div>
                            <div className="text-slate-500 font-medium">
                              購入日: {ticket.date} （有効期限: {ticket.expire}）
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-slate-200 gap-2">
                            <div className="text-slate-500 font-mono text-[11px]">
                              Square決済ID: <span className="text-slate-700">{ticket.squarePaymentId}</span>
                              {ticket.amount && <span className="ml-3 font-bold text-slate-700">¥{ticket.amount.toLocaleString()}</span>}
                            </div>
                            {ticket.receiptUrl ? (
                              <a
                                href={ticket.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#5e9bc4] hover:underline font-bold flex items-center gap-1"
                              >
                                <span>📄</span> Square領収書を見る
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[11px]">レシートURLなし</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">チケット購入履歴はありません。「Squareデータ同期」ボタンを押してデータを取得してください。</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: 基本情報編集・削除 */}
            {activeTab === 'edit_info' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-3">✏️ 基本情報の編集</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">受講生のお名前</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">フリガナ</label>
                    <input
                      type="text"
                      value={editForm.kana}
                      onChange={e => setEditForm({ ...editForm, kana: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">保護者電話番号</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Square 顧客ID</label>
                    <input
                      type="text"
                      value={currentParent.squareCustomerId || ''}
                      onChange={e => {
                        const newId = e.target.value;
                        setParents(prev => prev.map(p => p.id === currentParent.id ? { ...p, squareCustomerId: newId } : p));
                      }}
                      placeholder="cus_xxxxxx"
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none font-mono text-slate-700 bg-slate-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">お悩み・課題</label>
                    <input
                      type="text"
                      value={editForm.concern}
                      onChange={e => setEditForm({ ...editForm, concern: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">目標</label>
                    <input
                      type="text"
                      value={editForm.target}
                      onChange={e => setEditForm({ ...editForm, target: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">メモ</label>
                    <textarea
                      value={editForm.memo}
                      onChange={e => setEditForm({ ...editForm, memo: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none h-20"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={handleSaveInfo} className="bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-lg transition shadow-sm">
                    基本情報を保存する
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
