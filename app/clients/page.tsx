'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

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
  earAcupuncturePhotos?: {
    beforeRight?: string | null;
    afterRight?: string | null;
    beforeLeft?: string | null;
    afterLeft?: string | null;
  };
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

interface SquarePurchaseHistory {
  id: string;
  date: string;
  title: string;
  category: '回数券' | 'セッション' | '物販' | 'その他';
  quantity: number;
  amount: number;
  squarePaymentId: string;
  squareOrderId?: string;
  receiptUrl?: string;
  ticketCount?: number;
}

interface Parent {
  id: string;
  squareCustomerId?: string; // Square 連携用ID
  name: string;
  kana: string;
  phone: string;
  email?: string;
  birthday?: string;
  squareUpdatedAt?: string;
  ticketRemaining: number;
  ticketsHistory: TicketHistory[];
  squarePurchaseHistory?: SquarePurchaseHistory[];
  squareTicketAppliedOrderIds?: string[];
  squareTicketSyncInitialized?: boolean;
  squareTicketSyncCustomerId?: string;
  groupLinked?: boolean;
}

interface Student {
  id: string;
  parentId: string;
  supabaseClientId?: string; // Supabase clients.id
  squareCustomerId?: string; // Square顧客ID（受講生一覧への同期用） // 1:N 構造（代表者ID）
  isRepresentative?: boolean; // 代表者本人のカルテ
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


const GOLAZO_DB_NAME = 'golazo-clients-db';
const GOLAZO_DB_VERSION = 1;
const GOLAZO_STUDENTS_STORE = 'students';

const openGolazoClientDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(GOLAZO_DB_NAME, GOLAZO_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(GOLAZO_STUDENTS_STORE)) {
        db.createObjectStore(GOLAZO_STUDENTS_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const loadStudentsFromIndexedDB = async (): Promise<Student[] | null> => {
  try {
    const db = await openGolazoClientDB();

    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(GOLAZO_STUDENTS_STORE, 'readonly');
      const request = transaction.objectStore(GOLAZO_STUDENTS_STORE).get('all');

      request.onsuccess = () => resolve((request.result as Student[] | undefined) || null);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => db.close();
      transaction.onerror = () => db.close();
      transaction.onabort = () => db.close();
    });
  } catch (error) {
    console.error('IndexedDBから顧客データを読み込めませんでした:', error);
    return null;
  }
};

const saveStudentsToIndexedDB = async (students: Student[]): Promise<void> => {
  const db = await openGolazoClientDB();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(GOLAZO_STUDENTS_STORE, 'readwrite');
    transaction.objectStore(GOLAZO_STUDENTS_STORE).put(students, 'all');

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

export default function ClientsPage() {
  // 代表者データ
  const [parents, setParents] = useState<Parent[]>([
    {
      id: 'p-101',
      squareCustomerId: 'CUS_TEST_001', // Square連携用ID
      groupLinked: true,
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
      groupLinked: true,
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

  const router = useRouter();
  const supabase = createClient();

  // UI状態
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s-001');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [alertFilter, setAlertFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'carte' | 'tickets' | 'edit_info'>('carte');
  const [isSyncing, setIsSyncing] = useState<boolean>(false); // Square同期中のローディング状態
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [squareCustomers, setSquareCustomers] = useState<any[]>([]);
  const [squareCustomerSearch, setSquareCustomerSearch] = useState('');
  const [isGroupLinkModalOpen, setIsGroupLinkModalOpen] = useState(false);
  const [groupLinkMode, setGroupLinkMode] = useState<'new' | 'existing'>('new');
  const [groupRepName, setGroupRepName] = useState('');
  const [groupRepPhone, setGroupRepPhone] = useState('');
  const [groupRepSquareId, setGroupRepSquareId] = useState('');
  const [groupLinkParentId, setGroupLinkParentId] = useState('');

  const [isParentChildModalOpen, setIsParentChildModalOpen] = useState(false);
  const [isChildFormOpen, setIsChildFormOpen] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [childFormParentId, setChildFormParentId] = useState('');
  const [childFormName, setChildFormName] = useState('');
  const [childFormKana, setChildFormKana] = useState('');
  const [childFormBirthdate, setChildFormBirthdate] = useState('');
  const [childFormMemo, setChildFormMemo] = useState('');

  // 顧客カルテのデータをブラウザに保存します。
  // 写真を含む受講生データはlocalStorageではなくIndexedDBへ保存します。
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const { data: supabaseClients, error: supabaseClientsError } = await supabase
          .from('clients')
          .select('id, parent_name, child_name, birth_date, first_session_date, next_reservation_date, concerns_and_goals, ticket_total, ticket_used, memo')
          .order('created_at', { ascending: true });

        if (supabaseClientsError) {
          console.error('Supabase顧客データの読み込み確認に失敗しました:', supabaseClientsError);
        } else {
          console.log('Supabase clients 読み込み成功:', supabaseClients?.length ?? 0, '件');
        }

        const savedParents = localStorage.getItem('golazo-clients-parents-v2');
        if (savedParents) {
          setParents(JSON.parse(savedParents));
        }

        const indexedStudents = await loadStudentsFromIndexedDB();

        if (cancelled) return;

        if (indexedStudents) {
          const linkedStudents = indexedStudents.map(student => {
            const matchedClient = supabaseClients?.find(client =>
              client.child_name === student.name &&
              client.birth_date === student.birthdate
            );

            console.log(
              '顧客照合確認:',
              'studentName=', student.name,
              'studentBirthdate=', student.birthdate,
              'supabaseName=', supabaseClients?.[0]?.child_name,
              'supabaseBirthdate=', supabaseClients?.[0]?.birth_date,
              'matchedClientId=', matchedClient?.id || null
            );

            if (!matchedClient) return student;

            const parts = (matchedClient.concerns_and_goals || "").split("。");
            const concern = parts[0] || "";
            const target = parts.slice(1).join("。").replace(/^\s+/, "");

            return {
              ...student,
              supabaseClientId: matchedClient.id,
              name: matchedClient.child_name,
              concern,
              target,
              memo: matchedClient.memo || ""
            };
          });

          const existingStudentKeys = new Set(
            linkedStudents.map(student => `${student.name}__${student.birthdate}`)
          );

          const newSupabaseStudents = (supabaseClients || [])
            .filter(client => {
              const key = `${client.child_name}__${client.birth_date}`;
              return !existingStudentKeys.has(key);
            })
            .map((client, index): Student | null => {
              const parent = parents.find(parent => parent.name === client.parent_name);

              if (!parent) {
                console.warn(
                  '代表者カルテが見つからないため受講生を追加できません:',
                  client.parent_name,
                  client.child_name
                );
                return null;
              }

              const parts = (client.concerns_and_goals || "").split("。");
              const concern = parts[0] || "";
              const target = parts.slice(1).join("。").replace(/^\s+/, "");

              const birthDate = client.birth_date || "";
              const birth = birthDate ? new Date(`${birthDate}T00:00:00`) : null;
              const today = new Date();
              const age = birth
                ? Math.max(
                    0,
                    today.getFullYear() -
                      birth.getFullYear() -
                      (
                        today.getMonth() < birth.getMonth() ||
                        (
                          today.getMonth() === birth.getMonth() &&
                          today.getDate() < birth.getDate()
                        )
                          ? 1
                          : 0
                      )
                  )
                : 0;

              return {
                id: `s-${Date.now()}-${index}`,
                parentId: parent.id,
                supabaseClientId: client.id,
                name: client.child_name,
                kana: "",
                age,
                birthdate: birthDate,
                firstLessonDate: client.first_session_date || "",
                lastReservationDate: "",
                concern,
                target,
                memo: client.memo || "",
                physicalHistory: [],
                sessions: []
              };
            })
            .filter((student): student is Student => student !== null) as Student[];

          const validNewSupabaseStudents = newSupabaseStudents.filter(
            (student): student is Student => student !== null
          );

          if (validNewSupabaseStudents.length > 0) {
            console.log(
              'Supabaseから受講生カルテを追加:',
              validNewSupabaseStudents.map(student => student.name)
            );
          }

          setStudents([...linkedStudents, ...validNewSupabaseStudents]);
        } else {
          // 旧localStorageデータがあれば初回だけIndexedDBへ移行
          const savedStudents = localStorage.getItem('golazo-clients-students-v2');

          if (savedStudents) {
            const parsedStudents = JSON.parse(savedStudents) as Student[];

            const linkedStudents = parsedStudents.map(student => {
              const matchedClient = supabaseClients?.find(client =>
                client.child_name === student.name &&
                client.birth_date === student.birthdate
              );

              if (!matchedClient) return student;

              const parts = (matchedClient.concerns_and_goals || "").split("。");
              const concern = parts[0] || "";
              const target = parts.slice(1).join("。").replace(/^\s+/, "");

              return {
                ...student,
                supabaseClientId: matchedClient.id,
                name: matchedClient.child_name,
                concern,
                target,
                memo: matchedClient.memo || ""
              };
            });

            setStudents(linkedStudents);

            try {
              await saveStudentsToIndexedDB(linkedStudents);
              localStorage.removeItem('golazo-clients-students-v2');
              console.log('顧客データをIndexedDBへ移行しました');
            } catch (migrationError) {
              console.error('IndexedDBへの初回移行に失敗しました:', migrationError);
            }
          }
        }
      } catch (error) {
        console.error('顧客カルテデータの読み込みに失敗しました:', error);
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // 受講生データ（写真を含む）はIndexedDBへ保存
    saveStudentsToIndexedDB(students).catch(error => {
      console.error('顧客カルテデータの保存に失敗しました:', error);
    });

    // 代表者データは従来どおりlocalStorageへ保存
    try {
      localStorage.setItem('golazo-clients-parents-v2', JSON.stringify(parents));
    } catch (error) {
      console.error('代表者データの保存に失敗しました:', error);
    }
  }, [students, parents, isLoaded]);

  // URLの ?student=顧客ID が指定されている場合、その顧客のカルテを表示
  useEffect(() => {
    if (!isLoaded) return;

    const studentIdFromUrl = new URLSearchParams(window.location.search).get('student');
    if (!studentIdFromUrl) return;

    const targetStudent = students.find(student => student.id === studentIdFromUrl);
    if (!targetStudent) return;

    setSelectedStudentId(targetStudent.id);
    setSelectedParentId(targetStudent.parentId || null);

    // 検索結果から顧客を選択したら、カルテまで自動スクロール
    requestAnimationFrame(() => {
      document.getElementById('client-carte')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }, [isLoaded, students]);

  const EMPTY_STUDENT: Student = {
    id: '',
    parentId: '',
    name: '',
    kana: '',
    age: 0,
    birthdate: '',
    firstLessonDate: '',
    lastReservationDate: '',
    concern: '',
    target: '',
    memo: '',
    physicalHistory: [],
    sessions: [],
  };

  const EMPTY_PARENT: Parent = {
    id: '',
    name: '',
    kana: '',
    phone: '',
    ticketRemaining: 0,
    ticketsHistory: [],
    groupLinked: false,
  };

  const currentStudent =
    students.find(s => s.id === selectedStudentId) || students[0] || EMPTY_STUDENT;

  const currentParent =
    parents.find(p => p.id === currentStudent.parentId) || parents[0] || EMPTY_PARENT;
  const selectedParent = selectedParentId ? parents.find(p => p.id === selectedParentId) : null;
  const isParentOnlySelected = !!selectedParent;
  const siblingStudents = currentParent.groupLinked ? students.filter(s => s.parentId === currentParent.id) : [currentStudent];

  // 比較用データステート
  const physicalDates = currentStudent.physicalHistory.map(m => m.date);
  const [beforeDate, setBeforeDate] = useState<string>(physicalDates[0] || '2026-06-01');
  const [afterDate, setAfterDate] = useState<string>(physicalDates[physicalDates.length - 1] || '2026-09-01');

  const beforePhysical = currentStudent.physicalHistory.find(m => m.date === beforeDate) || currentStudent.physicalHistory[0];
  const afterPhysical = currentStudent.physicalHistory.find(m => m.date === afterDate) || currentStudent.physicalHistory[currentStudent.physicalHistory.length - 1];

  // 顧客を切り替えたとき、Before / Afterの測定日をその顧客の履歴へ自動追従させる
  useEffect(() => {
    const dates = currentStudent?.physicalHistory.map(m => m.date) || [];

    if (dates.length === 0) {
      setBeforeDate('');
      setAfterDate('');
      return;
    }

    setBeforeDate(prev => dates.includes(prev) ? prev : dates[0]);
    setAfterDate(prev => dates.includes(prev) ? prev : dates[dates.length - 1]);
  }, [currentStudent.id]);

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
  const [isEditingTicketRemaining, setIsEditingTicketRemaining] = useState(false);
  const [ticketRemainingInput, setTicketRemainingInput] = useState('');

  const startEditTicketRemaining = () => {
    setTicketRemainingInput(String(currentParent.ticketRemaining));
    setIsEditingTicketRemaining(true);
  };

  const cancelEditTicketRemaining = () => {
    setIsEditingTicketRemaining(false);
    setTicketRemainingInput('');
  };

  const saveTicketRemaining = () => {
    const value = Number(ticketRemainingInput);

    if (!Number.isInteger(value) || value < 0) {
      alert('回数券残数は0以上の整数で入力してください。');
      return;
    }

    setParents(prev =>
      prev.map(parent =>
        parent.id === currentParent.id
          ? { ...parent, ticketRemaining: value }
          : parent
      )
    );

    setIsEditingTicketRemaining(false);
    setTicketRemainingInput('');
  };

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

  // Supabase読み込み後、基本情報編集フォームを最新の顧客情報に同期
  useEffect(() => {
    if (!isLoaded || activeTab !== 'edit_info') return;

    setEditForm({
      name: currentStudent.name,
      kana: currentStudent.kana,
      phone: currentParent.phone,
      concern: currentStudent.concern,
      target: currentStudent.target,
      memo: currentStudent.memo
    });
  }, [
    isLoaded,
    activeTab,
    currentStudent.id,
    currentStudent.name,
    currentStudent.kana,
    currentStudent.concern,
    currentStudent.target,
    currentStudent.memo,
    currentParent.id,
    currentParent.phone
  ]);

  // ---------------------------------------------------------------------------
  // Square顧客情報自動同期（Square顧客IDを主キー）
  // ---------------------------------------------------------------------------
  const syncSquareCustomers = async (showAlert = false) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync/square-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Square顧客情報の同期に失敗しました。');
      }

      // APIの戻り値は customers 配列を正とし、万一別キーでも配列なら受け取る
      const customers = Array.isArray(data.customers)
        ? data.customers
        : Array.isArray(data.data)
          ? data.data
          : [];
      setSquareCustomers(customers);

      // 1回のsetStateで全Square顧客を受講生一覧へ反映します。
      // 顧客ごとにsetStateを繰り返さないため、Reactのバッチ処理に左右されません。
      let createdStudents = 0;
      let updatedStudents = 0;
      let createdParents = 0;
      let updatedParents = 0;

      const today = new Date().toISOString().split('T')[0];

      setParents(prevParents => {
        const nextParents = [...prevParents];
        const bySquareId = new Map<string, Parent>();
        nextParents.forEach(parent => {
          if (parent.squareCustomerId) {
            bySquareId.set(String(parent.squareCustomerId), parent);
          }
        });

        for (const customer of customers) {
          const squareId = String(customer?.id || '').trim();
          if (!squareId) continue;

          const fullName = String(
            customer?.full_name ||
            [customer?.family_name, customer?.given_name].filter(Boolean).join(' ')
          ).trim();
          const kana = String(customer?.kana || '').trim();
          const phone = String(customer?.phone_number || '').trim();
          const email = String(customer?.email_address || '').trim();
          const birthday = String(customer?.birthday || '').trim();
          const updatedAt = String(customer?.updated_at || '').trim();

          const existing = bySquareId.get(squareId);
          if (existing) {
            const next = {
              ...existing,
              name: fullName || existing.name,
              kana: kana || existing.kana,
              phone: phone || existing.phone,
              email: email || existing.email,
              birthday: birthday || existing.birthday,
              squareUpdatedAt: updatedAt || existing.squareUpdatedAt,
            };
            const index = nextParents.findIndex(p => p.id === existing.id);
            if (index >= 0) nextParents[index] = next;
            updatedParents += 1;
          } else {
            const parent: Parent = {
              id: `p-square-${squareId}`,
              squareCustomerId: squareId,
              name: fullName || `Square顧客 ${squareId.slice(0, 8)}`,
              kana,
              phone,
              email: email || undefined,
              birthday: birthday || undefined,
              squareUpdatedAt: updatedAt || undefined,
              ticketRemaining: 0,
              ticketsHistory: [],
              groupLinked: false,
            };
            nextParents.push(parent);
            bySquareId.set(squareId, parent);
            createdParents += 1;
          }
        }
        return nextParents;
      });

      // Square顧客は代表者（Parent）として管理し、
      // Square同期では代表者本人をStudentとして新規作成しません。
      // 既存のStudentデータは削除・変更しません。
      if (showAlert) {
        alert(
          `Square顧客情報を受講生一覧へ同期しました。\n取得: ${customers.length}名\n受講生一覧へ反映しました。`
        );
      }
    } catch (error) {
      console.error('Square顧客情報同期エラー:', error);
      if (showAlert) {
        alert(
          `Square顧客情報の同期に失敗しました。\n${
            error instanceof Error ? error.message : '通信エラー'
          }`
        );
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isLoaded) void syncSquareCustomers(false);
  }, [isLoaded]);

  // ---------------------------------------------------------------------------
  // Squareデータ同期ハンドラー
  // ---------------------------------------------------------------------------
  const handleSquareSync = async () => {
    setIsSyncing(true);

    try {
      // ① Square顧客情報を全体更新
      await syncSquareCustomers(false);

      // ② Square売上データを取得
      //    square-sales API側で既存データとの差分・更新を処理する
      const today = new Date();
      const endDate = today.toISOString().slice(0, 10);
      const start = new Date(today);
      start.setMonth(start.getMonth() - 12);
      const startDate = start.toISOString().slice(0, 10);

      const response = await fetch('/api/sync/square-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(`同期に失敗しました: ${data.error || 'Square同期エラー'}`);
        return;
      }

      const sales = Array.isArray(data.sales) ? data.sales : [];

      // Square顧客ID → 購入履歴
      const purchasesByCustomer = new Map<
        string,
        SquarePurchaseHistory[]
      >();

      sales.forEach(
        (sale: {
          id: number | string;
          customerId?: string;
          date: string;
          category: string;
          amount: number;
          squareOrderId?: string;
          squarePaymentId?: string;
          productName?: string;
          productNames?: string[];
        }) => {
          const squareCustomerId = String(sale.customerId || '').trim();

          if (!squareCustomerId) return;

          const productTitle =
            sale.productNames?.filter(Boolean).join(' / ') ||
            sale.productName ||
            'Square購入';

          const normalizedTitle = productTitle.replace(/\s+/g, '');
          const normalizedTicketTitle =
            normalizedTitle.normalize('NFKC');

          const ticketMatch =
            normalizedTicketTitle.match(/(\d+)回券/) ||
            normalizedTicketTitle.match(/回数券(\d+)回/) ||
            normalizedTicketTitle.match(/(\d+)回チケット/);

          const ticketCount = ticketMatch
            ? Number(ticketMatch[1])
            : 0;

          let category: SquarePurchaseHistory['category'];

          if (ticketCount > 0 || sale.category === '回数券') {
            category = '回数券';
          } else if (
            normalizedTitle.includes('パーソナル') ||
            normalizedTitle.includes('トレーニング') ||
            normalizedTitle.includes('セッション') ||
            normalizedTitle.includes('レッスン')
          ) {
            category = 'セッション';
          } else if (
            normalizedTitle.includes('プロテイン') ||
            normalizedTitle.includes('サプリ') ||
            normalizedTitle.includes('ウェア') ||
            normalizedTitle.includes('グッズ') ||
            normalizedTitle.includes('物販')
          ) {
            category = '物販';
          } else {
            category = 'その他';
          }

          const purchase: SquarePurchaseHistory = {
            id: String(sale.squareOrderId || sale.id),
            date: sale.date,
            title: productTitle,
            category,
            quantity: 1,
            amount: Number(sale.amount) || 0,
            squarePaymentId: sale.squarePaymentId || '',
            squareOrderId: sale.squareOrderId,
            ticketCount:
              ticketCount > 0 ? ticketCount : undefined,
          };

          const current =
            purchasesByCustomer.get(squareCustomerId) || [];

          current.push(purchase);
          purchasesByCustomer.set(squareCustomerId, current);
        }
      );

      // ③ 全代表者の購入履歴を一括更新
      let updatedCustomers = 0;
      let addedTicketCountTotal = 0;

      setParents(prev =>
        prev.map(parent => {
          const squareCustomerId =
            String(parent.squareCustomerId || '').trim();

          if (!squareCustomerId) return parent;

          const purchaseHistory =
            purchasesByCustomer.get(squareCustomerId);

          if (!purchaseHistory) return parent;

          const sameSquareCustomer =
            parent.squareTicketSyncCustomerId ===
            squareCustomerId;

          const appliedOrderIds = sameSquareCustomer
            ? parent.squareTicketAppliedOrderIds || []
            : [];

          const ticketPurchases = purchaseHistory.filter(
            purchase =>
              purchase.category === '回数券' &&
              (purchase.ticketCount || 0) > 0 &&
              Boolean(purchase.squareOrderId)
          );

          // まだ回数券残数に加算していない注文だけを対象にする
          const newTicketOrders = ticketPurchases.filter(
            purchase =>
              purchase.squareOrderId &&
              !appliedOrderIds.includes(purchase.squareOrderId)
          );

          const addedTicketCount = newTicketOrders.reduce(
            (sum, purchase) =>
              sum + (purchase.ticketCount || 0),
            0
          );

          const newAppliedOrderIds = Array.from(
            new Set([
              ...appliedOrderIds,
              ...ticketPurchases
                .map(purchase => purchase.squareOrderId)
                .filter(
                  (id: string | undefined): id is string =>
                    Boolean(id)
                ),
            ])
          );

          updatedCustomers += 1;
          addedTicketCountTotal += addedTicketCount;

          return {
            ...parent,
            squarePurchaseHistory: purchaseHistory,
            ticketsHistory: ticketPurchases.map(purchase => ({
              id: purchase.id,
              date: purchase.date,
              title: purchase.title,
              count: purchase.ticketCount || 0,
              expire: '購入日から6ヶ月',
              squarePaymentId: purchase.squarePaymentId,
              squareOrderId: purchase.squareOrderId,
              amount: purchase.amount,
            })),
            ticketRemaining:
              parent.ticketRemaining + addedTicketCount,
            squareTicketAppliedOrderIds:
              newAppliedOrderIds,
            squareTicketSyncInitialized: true,
            squareTicketSyncCustomerId:
              squareCustomerId,
          };
        })
      );

      alert(
        `Square情報の更新が完了しました！\n` +
        `更新した顧客: ${updatedCustomers}人\n` +
        `今回追加した回数券: ${addedTicketCountTotal}回`
      );
    } catch (err) {
      console.error('Square一括同期エラー:', err);
      alert('Square情報の更新中に通信エラーが発生しました。');
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
    setSelectedParentId(null);
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

  const openGroupLink = () => {
    setGroupLinkMode(currentParent.groupLinked ? 'existing' : 'new');
    setGroupRepName(currentParent.name || '');
    setGroupRepPhone(currentParent.phone || '');
    setGroupRepSquareId(currentParent.squareCustomerId || '');
    const linkedParent = parents.find(p => p.groupLinked && p.id === currentStudent.parentId);
    setGroupLinkParentId(linkedParent?.id || '');
    setIsGroupLinkModalOpen(true);
  };

  const handleSaveGroupLink = () => {
    if (groupLinkMode === 'existing') {
      if (!groupLinkParentId) {
        alert('既存グループを選択してください。');
        return;
      }
      setStudents(prev =>
        prev.map(student =>
          student.id === currentStudent.id
            ? { ...student, parentId: groupLinkParentId }
            : student
        )
      );
      setIsGroupLinkModalOpen(false);
      alert('受講生をグループに紐付けました。');
      return;
    }

    const name = groupRepName.trim();
    if (!name) {
      alert('代表者名を入力してください。');
      return;
    }

    const newParentId = `p-group-${Date.now()}`;
    const newParent: Parent = {
      id: newParentId,
      squareCustomerId: groupRepSquareId.trim() || undefined,
      name,
      kana: '',
      phone: groupRepPhone.trim(),
      ticketRemaining: 0,
      ticketsHistory: [],
      groupLinked: true
    };

    setParents(prev => [...prev, newParent]);
    setStudents(prev =>
      prev.map(student =>
        student.id === currentStudent.id
          ? { ...student, parentId: newParentId }
          : student
      )
    );
    setIsGroupLinkModalOpen(false);
    alert('新しいグループを作成し、受講生を紐付けました。');
  };

  const openAddChild = (parentId: string) => { setEditingChildId(null); setChildFormParentId(parentId); setChildFormName(''); setChildFormKana(''); setChildFormBirthdate(''); setChildFormMemo(''); setIsChildFormOpen(true); };
  const openEditChild = (student: Student) => { setEditingChildId(student.id); setChildFormParentId(student.parentId); setChildFormName(student.name); setChildFormKana(student.kana); setChildFormBirthdate(student.birthdate); setChildFormMemo(student.memo); setIsChildFormOpen(true); };
  const handleSaveChild = () => {
    const name = childFormName.trim(); if (!name) return alert('受講生のお名前を入力してください。'); if (!childFormParentId) return alert('代表者を選択してください。');
    if (editingChildId) setStudents(prev => prev.map(s => s.id === editingChildId ? { ...s, parentId: childFormParentId, name, kana: childFormKana.trim(), birthdate: childFormBirthdate, memo: childFormMemo } : s));
    else { const s: Student = { id: `s-${Date.now()}`, parentId: childFormParentId, name, kana: childFormKana.trim(), age: childFormBirthdate ? Math.max(0, new Date().getFullYear() - new Date(childFormBirthdate).getFullYear()) : 0, birthdate: childFormBirthdate, firstLessonDate: new Date().toISOString().split('T')[0], lastReservationDate: '', concern: '', target: '', memo: childFormMemo, physicalHistory: [], sessions: [] }; setStudents(prev => [...prev, s]); setSelectedStudentId(s.id); setSelectedParentId(null); }
    setIsChildFormOpen(false); alert(editingChildId ? '受講生情報を更新しました。' : '受講生を追加しました。');
  };
  const handleDeleteParent = (parentId: string) => {
    const target = parents.find(p => p.id === parentId);
    if (!target) return;

    const memberCount = students.filter(s => s.parentId === parentId).length;
    const memberMessage = memberCount > 0
      ? `\nこの顧客に紐づくグループメンバー${memberCount}名も削除されます。`
      : '';

    if (!confirm(`「${target.name}」様を削除しますか？${memberMessage}\n\nGOLAZO内の顧客・カルテデータが削除されます。\nSquare上の顧客情報は削除されません。`)) {
      return;
    }

    setStudents(prev => prev.filter(student => student.parentId !== parentId));
    setParents(prev => prev.filter(parent => parent.id !== parentId));

    if (selectedParentId === parentId) {
      setSelectedParentId(null);
      setSelectedStudentId('');
    }

    alert('顧客を削除しました。');
  };

  const handleDeleteChild = (studentId: string) => { const target = students.find(s => s.id === studentId); if (!target || !confirm(`「${target.name}」を削除しますか？\nこの受講生のカルテ・測定・セッション記録も削除されます。`)) return; const remaining = students.filter(s => s.id !== studentId); setStudents(remaining); if (remaining.length) setSelectedStudentId(remaining[0].id); alert('受講生を削除しました。'); };

  const handleAddSession = () => {
    if (!newSessionContent) return;

    if (useTicket && currentParent.ticketRemaining <= 0) {
      alert('🎫 回数券残数がありません。回数券を追加購入してから登録してください。');
      return;
    }
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

  const handleUpdateEarAcupuncturePhoto = (targetDate: string, keyName: 'beforeRight' | 'afterRight' | 'beforeLeft' | 'afterLeft', dataUrl: string | null) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== currentStudent.id) return s;
        const updatedHistory = s.physicalHistory.map(m => {
          if (m.date !== targetDate) return m;
          return {
            ...m,
            earAcupuncturePhotos: {
              ...(m.earAcupuncturePhotos || {}),
              [keyName]: dataUrl
            }
          };
        });
        return { ...s, physicalHistory: updatedHistory };
      })
    );
  };

  const handleEarAcupuncturePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, targetDate: string, keyName: 'beforeRight' | 'afterRight' | 'beforeLeft' | 'afterLeft') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('耳ツボ写真は画像ファイルを選択してください。');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (dataUrl) handleUpdateEarAcupuncturePhoto(targetDate, keyName, dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteEarAcupuncturePhoto = (targetDate: string, keyName: 'beforeRight' | 'afterRight' | 'beforeLeft' | 'afterLeft') => {
    if (!confirm('この耳ツボ写真を削除しますか？')) return;
    handleUpdateEarAcupuncturePhoto(targetDate, keyName, null);
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

  const handleSavePhysicalMeasurements = () => {
    alert('測定内容を保存しました。');
  };

  const handleDeleteSelectedPhysicalMeasurement = () => {
    if (!afterDate) return;

    if (currentStudent.physicalHistory.length <= 1) {
      alert('測定データが1件しかないため削除できません。');
      return;
    }

    if (!confirm(
      `測定日 ${afterDate} の測定データを削除しますか？\n体重・体脂肪率・筋肉量・測定結果写真なども削除されます。`
    )) {
      return;
    }

    setStudents(prev =>
      prev.map(s =>
        s.id === currentStudent.id
          ? {
              ...s,
              physicalHistory: s.physicalHistory.filter(
                m => m.date !== afterDate
              )
            }
          : s
      )
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

  const handleSaveInfo = async () => {
    const supabaseClientId = currentStudent.supabaseClientId;
    if (supabaseClientId) {
      const concernsAndGoals = [editForm.concern.trim(), editForm.target.trim()].filter(Boolean).join('。');
      const { error } = await supabase.from('clients').update({ child_name: editForm.name.trim(), concerns_and_goals: concernsAndGoals || null, memo: editForm.memo.trim() || null }).eq('id', supabaseClientId);
      if (error) {
        console.error('Supabase基本情報の保存に失敗しました:', error);
        alert('Supabaseへの保存に失敗しました。入力内容は画面上に反映しませんでした。');
        return;
      }
    }
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

  const filteredClientStudents = students.filter(student => {
    const parent = parents.find(p => p.id === student.parentId);
    if (!parent) return false;

    const query = searchKeyword.trim().toLowerCase();

    const matchesSearch =
      query === '' ||
      student.name.toLowerCase().includes(query) ||
      student.kana.toLowerCase().includes(query) ||
      parent.name.toLowerCase().includes(query) ||
      parent.kana.toLowerCase().includes(query);

    const alerts = getAlertBadges(student, parent);

    const matchesAlert =
      alertFilter === 'all' ||
      (alertFilter === 'alert' && alerts.length > 0) ||
      alerts.some(alert => {
        if (alertFilter === 'no-reservation-30') {
          return alert.text.startsWith('🚨 1ヶ月未予約');
        }
        if (alertFilter === 'no-reservation-14') {
          return alert.text.startsWith('⚠️ 最終予約から2週間未予約');
        }
        if (alertFilter === 'measurement') {
          return alert.text === '⚠️ 3ヶ月測定の時期です';
        }
        if (alertFilter === 'ticket') {
          return alert.text.startsWith('🎫 回数券残り');
        }
        return false;
      });

    return matchesSearch && matchesAlert;
  });

  const filteredClientParents = parents.filter(parent => {
    const query = searchKeyword.trim().toLowerCase();

    const hasMember = students.some(student => student.parentId === parent.id);

    const matchesSearch =
      query === '' ||
      parent.name.toLowerCase().includes(query) ||
      parent.kana.toLowerCase().includes(query);

    const matchesAlert =
      alertFilter === 'all' ||
      (alertFilter === 'ticket' && parent.ticketRemaining <= 1) ||
      (alertFilter === 'alert' && parent.ticketRemaining <= 1);

    return matchesSearch && matchesAlert;
  });

  const shouldShowParentResults =
    searchKeyword.trim() !== '' || alertFilter !== 'all';

  const handleSelectParent = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId);
    if (!parent) return;

    const parentMembers = students.filter(s => s.parentId === parentId);
    const query = searchKeyword.trim().toLowerCase();

    const matchedMember = query
      ? parentMembers.find(member =>
          !member.isRepresentative &&
          (
            member.name.toLowerCase().includes(query) ||
            member.kana.toLowerCase().includes(query)
          )
        )
      : undefined;

    if (matchedMember) {
      setSelectedStudentId(matchedMember.id);
      setSelectedParentId(null);

      requestAnimationFrame(() => {
        document.getElementById('client-carte')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
      return;
    }

    // Square代表者本人のカルテを優先して表示
    let representative = parentMembers.find(student => student.isRepresentative);

    // 既存データでisRepresentativeが付いていない場合、
    // 代表者名・カナが一致するStudentを代表者本人として再利用する。
    if (!representative) {
      representative = parentMembers.find(student =>
        student.name === parent.name &&
        (student.kana || '') === (parent.kana || '')
      );

      if (representative) {
        const representativeId = representative.id;
        setStudents(prev =>
          prev.map(student =>
            student.id === representativeId
              ? {
                  ...student,
                  isRepresentative: true,
                  squareCustomerId: parent.squareCustomerId || student.squareCustomerId
                }
              : student
          )
        );
      }
    }

    if (representative) {
      setSelectedStudentId(representative.id);
      setSelectedParentId(null);

      requestAnimationFrame(() => {
        document.getElementById('client-carte')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
      return;
    }

    // 代表者本人用Studentがまだ存在しない場合のみ新規作成
    const newStudent: Student = {
      id: `s-${Date.now()}`,
      parentId: parent.id,
      squareCustomerId: parent.squareCustomerId,
      isRepresentative: true,
      name: parent.name,
      kana: parent.kana || '',
      age: parent.birthday
        ? Math.max(0, new Date().getFullYear() - new Date(parent.birthday).getFullYear())
        : 0,
      birthdate: parent.birthday || '',
      firstLessonDate: new Date().toISOString().split('T')[0],
      lastReservationDate: '',
      concern: '',
      target: '',
      memo: '',
      physicalHistory: [],
      sessions: []
    };

    setStudents(prev => [...prev, newStudent]);
    setSelectedStudentId(newStudent.id);
    setSelectedParentId(null);

    requestAnimationFrame(() => {
      document.getElementById('client-carte')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <span>🔍</span> キーワード検索
            </label>
            <input
              type="text"
              placeholder="代表者名、メンバー名で検索..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#5e9bc4] outline-none"
            />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <span>🔽</span> 条件で絞り込み
            </label>
            <select
              value={alertFilter}
              onChange={e => setAlertFilter(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-[#5e9bc4] outline-none bg-white"
            >
              <option value="">選択してください</option>
              <option value="all">👥 全顧客を表示</option>
              <option value="alert">🚨 アラートあり</option>
              <option value="no-reservation-30">🚨 1ヶ月未予約</option>
              <option value="no-reservation-14">⚠️ 2週間未予約</option>
              <option value="measurement">⚠️ 3ヶ月測定の時期</option>
              <option value="ticket">🎫 回数券残り1回以下</option>
            </select>
          </div>

        </div>

        {shouldShowParentResults && (
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">
              検索結果 ({filteredClientStudents.length + filteredClientParents.length}名)
            </h3>

            {filteredClientStudents.length === 0 && filteredClientParents.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-sm text-slate-500">
                条件に一致する受講者はいません。
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredClientStudents.map(student => {
                  const parent = parents.find(p => p.id === student.parentId);
                  if (!parent) return null;

                  const isSelected = student.id === selectedStudentId;
                  const badges = getAlertBadges(student, parent);

                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setSelectedParentId(null);

                        requestAnimationFrame(() => {
                          document.getElementById('client-carte')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                          });
                        });
                      }}
                      className={`w-full text-left p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                        isSelected
                          ? 'bg-sky-50/80 border-[#5e9bc4] ring-2 ring-[#5e9bc4]/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-bold ${
                          isSelected ? 'text-[#5e9bc4]' : 'text-slate-800'
                        }`}>
                          {student.name}
                        </span>

                        {isSelected && (
                          <span className="text-[10px] font-bold bg-[#5e9bc4] text-white px-2 py-0.5 rounded-full">
                            表示中
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1">
                        代表者：{parent.name}
                      </p>

                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {badges.map((b, i) => (
                            <span
                              key={i}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                b.type === 'danger'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {b.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="space-y-5">

        {filteredClientParents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredClientParents.map(parent => (
              <div
                key={`parent-${parent.id}`}
                onClick={() => handleSelectParent(parent.id)}
                className="w-full text-left p-4 rounded-xl border bg-white border-slate-200 shadow-sm cursor-pointer hover:border-[#5e9bc4] hover:bg-sky-50/30 transition"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-800">
                    👤 {parent.name}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    メンバー未登録
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Square代表者
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Square顧客ID: {parent.squareCustomerId || '未連携'}
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openAddChild(parent.id);
                  }}
                  className="mt-3 w-full bg-[#5e9bc4] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#4d85ab]"
                >
                  ＋ グループメンバーを追加
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteParent(parent.id);
                  }}
                  className="mt-2 w-full bg-rose-50 text-rose-500 border border-rose-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-rose-100"
                >
                  🗑 顧客を削除
                </button>
              </div>
            ))}
          </div>
        )}

          {/* メインコンテンツ：カルテ全面表示 */}
          <div id="client-carte" className="space-y-5">
            {isParentOnlySelected && selectedParent && (
              <div className="bg-white p-5 rounded-xl border border-sky-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#5e9bc4]">👤 Square代表者カルテ</p>
                    <h2 className="text-2xl font-bold text-slate-800 mt-1">
                      {selectedParent.name}
                    </h2>
                    {selectedParent.kana && (
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedParent.kana}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openAddChild(selectedParent.id)}
                    className="bg-[#5e9bc4] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#4d85ab] shrink-0"
                  >
                    ＋ グループメンバーを追加
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
                    <p className="text-[11px] text-slate-500 font-semibold">
                      回数券残数
                    </p>
                    <p className="text-xl font-bold text-[#5e9bc4] mt-1">
                      🎫 {selectedParent.ticketRemaining}回
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Square顧客ID
                    </p>
                    <p className="text-xs font-mono text-slate-600 mt-1 break-all">
                      {selectedParent.squareCustomerId || '未連携'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-400 font-semibold mb-2">
                    グループメンバー
                  </p>
                  <p className="text-sm text-slate-500">
                    現在、グループメンバーは登録されていません。
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsParentChildModalOpen(true)}
                className="bg-white border border-sky-200 text-[#5e9bc4] hover:bg-sky-50 font-bold text-xs px-3 py-2.5 rounded-lg shadow-sm transition"
              >
                👥 グループ管理
              </button>
            </div>
            <div className={isParentOnlySelected ? "hidden" : ""}>
            {/* 顧客基本情報ヘッダー */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">

              {/* 上段：受講者情報 ＋ アラート */}
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] gap-4 items-start">

                {/* 受講者情報 */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    {currentStudent.name}
                    <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {currentStudent.age}歳
                    </span>
                  </h2>

                  <div className="mt-2">
                    <span className="bg-sky-50 text-[#5e9bc4] border border-sky-200 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 w-fit text-xs">
                      <span>🎟️</span> 回数券 残数:
                      {isEditingTicketRemaining ? (
                        <>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={ticketRemainingInput}
                            onChange={e => setTicketRemainingInput(e.target.value)}
                            className="w-16 bg-white border border-sky-300 rounded px-1.5 py-0.5 text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
                            autoFocus
                          />
                          <span>回</span>
                          <button
                            type="button"
                            onClick={saveTicketRemaining}
                            className="bg-[#5e9bc4] text-white px-2 py-0.5 rounded-md hover:bg-[#4d85ab]"
                          >
                            保存
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditTicketRemaining}
                            className="bg-white text-slate-600 border border-slate-300 px-2 py-0.5 rounded-md hover:bg-slate-50"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <>
                          <strong className="text-sm">{currentParent.ticketRemaining}</strong> 回
                          <button
                            type="button"
                            onClick={startEditTicketRemaining}
                            className="ml-1 bg-white text-[#5e9bc4] border border-sky-200 px-2 py-0.5 rounded-md hover:bg-sky-50"
                          >
                            ✏️変更
                          </button>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* アラート */}
                {currentAlerts.length > 0 && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-xs text-slate-400 font-semibold mb-1.5">
                      ⚠️ 注意・確認事項
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {currentAlerts.map((alt, idx) => (
                        <div
                          key={idx}
                          className={`text-xs font-bold px-3 py-2 rounded-lg border flex items-center gap-1.5 ${
                            alt.type === 'danger'
                              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          <span>{alt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* 下段：代表者 ＋ グループ */}
              <div className="border-t border-slate-100 pt-3">
                <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-3 items-start">

                  {/* 代表者 */}
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1">
                      代表者
                    </div>
                    <div className="font-bold text-slate-700 text-sm">
                      {currentParent.name} 様
                    </div>
                  </div>

                  {/* グループ */}
                  <div>
                    <div className="text-xs text-slate-400 font-semibold mb-1.5">
                      グループメンバー
                    </div>

                    {currentParent.groupLinked && siblingStudents.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {siblingStudents.map(member => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleSelectStudent(member.id)}
                            className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold border transition ${
                              member.id === currentStudent.id
                                ? 'bg-[#5e9bc4] text-white border-[#5e9bc4]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-200'
                            }`}
                          >
                            {member.kana ? `${member.kana} ` : ''}{member.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={openGroupLink}
                        className="bg-sky-50 text-[#5e9bc4] border border-sky-200 hover:bg-sky-100 font-bold px-3 py-1.5 rounded-md transition text-xs"
                      >
                        👥 グループに紐付け
                      </button>

                      {currentParent.groupLinked && (
                        <button
                          type="button"
                          onClick={() => setIsParentChildModalOpen(true)}
                          className="bg-white text-[#5e9bc4] border border-sky-200 hover:bg-sky-50 font-bold px-3 py-1.5 rounded-md transition text-xs"
                        >
                          👥 グループを管理
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Square情報を一括更新 */}
              <div className="border-t border-slate-100 pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleSquareSync()}
                  disabled={isSyncing}
                  className="bg-sky-50 text-[#5e9bc4] border border-sky-200 hover:bg-sky-100 font-bold text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  🔄 {isSyncing ? 'Square情報を更新中...' : 'Square情報を更新'}
                </button>
              </div>

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

                  {/* 耳ツボ写真：左右ごとに施術前・施術後を保存し、比較日でBefore / After比較 */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 text-xs">
                      👂 耳ツボ写真（右・左／施術前・施術後）
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {[
                        {
                          side: '右',
                          beforeKey: 'beforeRight' as const,
                          afterKey: 'afterRight' as const
                        },
                        {
                          side: '左',
                          beforeKey: 'beforeLeft' as const,
                          afterKey: 'afterLeft' as const
                        }
                      ].map(side => (

                        <div key={side.side} className="border rounded-xl p-3 bg-slate-50">

                          <div className="font-bold text-slate-700 text-xs mb-3">
                            👂 {side.side}耳
                          </div>

                          <div className="grid grid-cols-2 gap-2">

                            {/* Before：比較開始日 */}
                            <div className="border rounded-lg p-2 bg-white">
                              <div className="text-[9px] font-bold text-slate-500 mb-1">
                                Before・施術前
                              </div>
                              <div className="text-[9px] text-slate-400 mb-1">
                                {beforeDate}
                              </div>

                              {beforePhysical?.earAcupuncturePhotos?.[side.beforeKey] ? (
                                <img
                                  src={beforePhysical.earAcupuncturePhotos[side.beforeKey] || ''}
                                  alt={`Before ${side.side}耳 施術前`}
                                  className="w-full h-28 object-contain rounded border bg-white"
                                />
                              ) : (
                                <div className="h-28 flex items-center justify-center text-[9px] text-slate-400 border border-dashed rounded bg-slate-50">
                                  未登録
                                </div>
                              )}

                              <label className="mt-1 block text-center bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-[9px] px-1.5 py-1 rounded cursor-pointer">
                                {beforePhysical?.earAcupuncturePhotos?.[side.beforeKey] ? '写真を差し替え' : '写真を追加'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleEarAcupuncturePhotoUpload(e, beforeDate, side.beforeKey)}
                                />
                              </label>

                              {beforePhysical?.earAcupuncturePhotos?.[side.beforeKey] && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEarAcupuncturePhoto(beforeDate, side.beforeKey)}
                                  className="w-full mt-1 text-[9px] text-rose-500 hover:underline"
                                >
                                  削除
                                </button>
                              )}
                            </div>

                            {/* Before：施術後 */}
                            <div className="border rounded-lg p-2 bg-white">
                              <div className="text-[9px] font-bold text-slate-500 mb-1">
                                Before・施術後
                              </div>
                              <div className="text-[9px] text-slate-400 mb-1">
                                {beforeDate}
                              </div>

                              {beforePhysical?.earAcupuncturePhotos?.[side.afterKey] ? (
                                <img
                                  src={beforePhysical.earAcupuncturePhotos[side.afterKey] || ''}
                                  alt={`Before ${side.side}耳 施術後`}
                                  className="w-full h-28 object-contain rounded border bg-white"
                                />
                              ) : (
                                <div className="h-28 flex items-center justify-center text-[9px] text-slate-400 border border-dashed rounded bg-slate-50">
                                  未登録
                                </div>
                              )}

                              <label className="mt-1 block text-center bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-[9px] px-1.5 py-1 rounded cursor-pointer">
                                {beforePhysical?.earAcupuncturePhotos?.[side.afterKey] ? '写真を差し替え' : '写真を追加'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleEarAcupuncturePhotoUpload(e, beforeDate, side.afterKey)}
                                />
                              </label>

                              {beforePhysical?.earAcupuncturePhotos?.[side.afterKey] && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEarAcupuncturePhoto(beforeDate, side.afterKey)}
                                  className="w-full mt-1 text-[9px] text-rose-500 hover:underline"
                                >
                                  削除
                                </button>
                              )}
                            </div>

                            {/* After：施術前 */}
                            <div className="border rounded-lg p-2 bg-white">
                              <div className="text-[9px] font-bold text-[#5e9bc4] mb-1">
                                After・施術前
                              </div>
                              <div className="text-[9px] text-slate-400 mb-1">
                                {afterDate}
                              </div>

                              {afterPhysical?.earAcupuncturePhotos?.[side.beforeKey] ? (
                                <img
                                  src={afterPhysical.earAcupuncturePhotos[side.beforeKey] || ''}
                                  alt={`After ${side.side}耳 施術前`}
                                  className="w-full h-28 object-contain rounded border bg-white"
                                />
                              ) : (
                                <div className="h-28 flex items-center justify-center text-[9px] text-slate-400 border border-dashed rounded bg-slate-50">
                                  未登録
                                </div>
                              )}

                              <label className="mt-1 block text-center bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-[9px] px-1.5 py-1 rounded cursor-pointer">
                                {afterPhysical?.earAcupuncturePhotos?.[side.beforeKey] ? '写真を差し替え' : '写真を追加'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleEarAcupuncturePhotoUpload(e, afterDate, side.beforeKey)}
                                />
                              </label>

                              {afterPhysical?.earAcupuncturePhotos?.[side.beforeKey] && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEarAcupuncturePhoto(afterDate, side.beforeKey)}
                                  className="w-full mt-1 text-[9px] text-rose-500 hover:underline"
                                >
                                  削除
                                </button>
                              )}
                            </div>

                            {/* After：施術後 */}
                            <div className="border rounded-lg p-2 bg-white">
                              <div className="text-[9px] font-bold text-[#5e9bc4] mb-1">
                                After・施術後
                              </div>
                              <div className="text-[9px] text-slate-400 mb-1">
                                {afterDate}
                              </div>

                              {afterPhysical?.earAcupuncturePhotos?.[side.afterKey] ? (
                                <img
                                  src={afterPhysical.earAcupuncturePhotos[side.afterKey] || ''}
                                  alt={`After ${side.side}耳 施術後`}
                                  className="w-full h-28 object-contain rounded border bg-white"
                                />
                              ) : (
                                <div className="h-28 flex items-center justify-center text-[9px] text-slate-400 border border-dashed rounded bg-slate-50">
                                  未登録
                                </div>
                              )}

                              <label className="mt-1 block text-center bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-[9px] px-1.5 py-1 rounded cursor-pointer">
                                {afterPhysical?.earAcupuncturePhotos?.[side.afterKey] ? '写真を差し替え' : '写真を追加'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleEarAcupuncturePhotoUpload(e, afterDate, side.afterKey)}
                                />
                              </label>

                              {afterPhysical?.earAcupuncturePhotos?.[side.afterKey] && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEarAcupuncturePhoto(afterDate, side.afterKey)}
                                  className="w-full mt-1 text-[9px] text-rose-500 hover:underline"
                                >
                                  削除
                                </button>
                              )}
                            </div>

                          </div>
                        </div>

                      ))}

                    </div>
                  </div>

                  {/* 測定結果ファイル：Before / After比較 */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-700 text-xs">
                    📄 測定結果ファイル（Before / After比較）
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        type: 'physicalCheck' as const,
                        title: 'フィジカルチェック',
                        beforeFiles: beforePhysical?.physicalCheckFiles || [],
                        afterFiles: afterPhysical?.physicalCheckFiles || []
                      },
                      {
                        type: 'injuryZero' as const,
                        title: 'ケガゼロプロジェクト',
                        beforeFiles: beforePhysical?.injuryZeroFiles || [],
                        afterFiles: afterPhysical?.injuryZeroFiles || []
                      }
                    ].map(section => (
                      <div key={section.type} className="border rounded-xl p-4 bg-white">
                        <h5 className="font-bold text-xs text-slate-700 mb-3">
                          {section.title}
                        </h5>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Before */}
                          <div className="border rounded-lg p-2 bg-slate-50">
                            <div className="text-[10px] font-bold text-slate-500 mb-2">
                              Before
                              {beforeDate && (
                                <span className="block text-[9px] font-normal text-slate-400">
                                  {beforeDate}
                                </span>
                              )}
                            </div>

                            {section.beforeFiles.length > 0 ? (
                              <div className="space-y-2">
                                {section.beforeFiles.map(file => (
                                  <div key={file.id} className="border rounded-lg bg-white overflow-hidden">
                                    {(
                                      file.type?.startsWith('image/') ||
                                      /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file.name || '')
                                    ) ? (
                                      <a href={file.dataUrl} target="_blank" rel="noopener noreferrer" title={file.name}>
                                        <img src={file.dataUrl} alt={file.name} className="w-full h-36 object-contain bg-slate-100" />
                                      </a>
                                    ) : (
                                      <a href={file.dataUrl} target="_blank" rel="noopener noreferrer" className="block p-3 text-[10px] text-[#5e9bc4] font-bold hover:underline break-all">
                                        📄 {file.name}
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMeasurementFile(beforeDate, section.type, file.id)}
                                      className="w-full text-[10px] text-rose-500 hover:underline py-1.5 border-t"
                                    >
                                      削除
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-36 flex items-center justify-center border border-dashed rounded-lg text-[10px] text-slate-400 bg-white">
                                未登録
                              </div>
                            )}

                            <label className="mt-2 block text-center bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-[10px] px-2 py-1.5 rounded cursor-pointer">
                              ＋ Beforeファイルを追加
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                className="hidden"
                                onChange={e => handleFileUpload(e, beforeDate, section.type)}
                              />
                            </label>
                          </div>

                          {/* After */}
                          <div className="border rounded-lg p-2 bg-slate-50">
                            <div className="text-[10px] font-bold text-slate-500 mb-2">
                              After
                              {afterDate && (
                                <span className="block text-[9px] font-normal text-slate-400">
                                  {afterDate}
                                </span>
                              )}
                            </div>

                            {section.afterFiles.length > 0 ? (
                              <div className="space-y-2">
                                {section.afterFiles.map(file => (
                                  <div key={file.id} className="border rounded-lg bg-white overflow-hidden">
                                    {(
                                      file.type?.startsWith('image/') ||
                                      /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(file.name || '')
                                    ) ? (
                                      <a href={file.dataUrl} target="_blank" rel="noopener noreferrer" title={file.name}>
                                        <img src={file.dataUrl} alt={file.name} className="w-full h-36 object-contain bg-slate-100" />
                                      </a>
                                    ) : (
                                      <a href={file.dataUrl} target="_blank" rel="noopener noreferrer" className="block p-3 text-[10px] text-[#5e9bc4] font-bold hover:underline break-all">
                                        📄 {file.name}
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMeasurementFile(afterDate, section.type, file.id)}
                                      className="w-full text-[10px] text-rose-500 hover:underline py-1.5 border-t"
                                    >
                                      削除
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-36 flex items-center justify-center border border-dashed rounded-lg text-[10px] text-slate-400 bg-white">
                                未登録
                              </div>
                            )}

                            <label className="mt-2 block text-center bg-[#5e9bc4] hover:bg-sky-600 text-white font-bold text-[10px] px-2 py-1.5 rounded cursor-pointer">
                              ＋ Afterファイルを追加
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                multiple
                                className="hidden"
                                onChange={e => handleFileUpload(e, afterDate, section.type)}
                              />
                            </label>
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-400 mt-2">
                          Before / Afterの測定結果を左右に並べて比較できます。
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400">
                    ※ 選択したBefore測定日とAfter測定日の測定結果を左右に並べて比較します。
                  </p>
                </div>

                {/* 測定内容の保存・削除 */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSavePhysicalMeasurements}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition"
                    >
                      💾 測定内容を保存
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteSelectedPhysicalMeasurement}
                      disabled={!afterDate || currentStudent.physicalHistory.length <= 1}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      🗑 この測定を削除
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: Square購入・決済履歴 */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <span>💳</span> Square 購入・決済履歴
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        この顧客に紐づく購入・決済履歴を表示しています
                      </p>
                    </div>


                  </div>

                  <div className="space-y-3">
                    {(currentParent.squarePurchaseHistory || []).length > 0 ? (
                      [...(currentParent.squarePurchaseHistory || [])]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map(purchase => (
                          <div
                            key={purchase.id}
                            className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <span className="font-bold text-slate-800 text-sm">
                                  {purchase.title}
                                </span>

                                <span className="ml-2 bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                                  {purchase.category}
                                </span>

                                {purchase.category === '回数券' &&
                                  purchase.ticketCount &&
                                  purchase.ticketCount > 0 && (
                                    <span className="ml-2 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                      付与回数: {purchase.ticketCount}回
                                    </span>
                                  )}
                              </div>

                              <div className="text-slate-500 font-medium">
                                購入日: {purchase.date}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-slate-200 gap-2">
                              <div className="text-slate-500 font-mono text-[11px]">
                                Square決済ID:{' '}
                                <span className="text-slate-700">
                                  {purchase.squarePaymentId}
                                </span>

                                <span className="ml-3 font-bold text-slate-700">
                                  ¥{purchase.amount.toLocaleString()}
                                </span>

                                {purchase.quantity > 1 && (
                                  <span className="ml-3 text-slate-500">
                                    数量: {purchase.quantity}
                                  </span>
                                )}
                              </div>

                              {purchase.receiptUrl ? (
                                <a
                                  href={purchase.receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#5e9bc4] hover:underline font-bold flex items-center gap-1"
                                >
                                  <span>📄</span> Square領収書を見る
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[11px]">
                                  レシートURLなし
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">
                        Square購入履歴はありません。「Squareデータ同期」ボタンを押してデータを取得してください。
                      </p>
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
                    <label className="block text-slate-500 font-semibold mb-1">Square 顧客ID</label>
                    <input
                      type="text"
                      value={currentStudent.squareCustomerId || ''}
                      onChange={e => {
                        const newId = e.target.value;
                        setStudents(prev => prev.map(s => s.id === currentStudent.id ? { ...s, squareCustomerId: newId } : s));
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
        </div>
        {isParentChildModalOpen && (<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"><div className="p-5 border-b flex justify-between items-center"><div><h3 className="font-bold text-slate-800">👥 グループ管理</h3><p className="text-[11px] text-slate-400 mt-1">Squareに登録されたお客様は受講生一覧へ同期します。受講生カルテから、必要な方だけグループへ紐付けます。</p></div><div className="flex gap-2"><button type="button" onClick={() => void syncSquareCustomers(true)} className="bg-sky-50 text-[#5e9bc4] border border-sky-200 px-3 py-1.5 rounded-lg text-xs font-bold">🔄 Square同期</button><button type="button" onClick={() => setIsParentChildModalOpen(false)} className="text-slate-400 text-xl">×</button></div></div><div className="p-5 overflow-y-auto max-h-[75vh] space-y-5">
<div className="border border-sky-200 bg-sky-50/50 rounded-xl p-4">
  <div className="font-bold text-sm text-slate-800">👤 Square顧客 → GOLAZO受講生</div>
  <p className="text-[11px] text-slate-500 mt-1">
    Squareに登録されたお客様は、Square同期時にそのままGOLAZOの受講生一覧へ登録・更新されます。
    Squareのお客様を個別に選択する必要はありません。
  </p>
  <p className="text-[11px] text-slate-500 mt-2">
    受講生カルテから「👥 グループに紐付け」を使い、必要な方だけグループとして管理します。
  </p>
</div>
<div className="font-bold text-sm text-slate-700">登録済みグループ</div>
{parents.filter(parent => parent.groupLinked).map(parent => { const children=students.filter(s=>s.parentId===parent.id); return <div key={parent.id} className="border border-slate-200 rounded-xl p-4"><div className="flex justify-between items-center gap-3"><div><div className="font-bold text-slate-800">{parent.name} 様</div><div className="text-[10px] text-slate-400 font-mono mt-1">Square顧客ID: {parent.squareCustomerId || '未連携'}</div></div><button type="button" onClick={()=>openAddChild(parent.id)} className="bg-[#5e9bc4] text-white px-3 py-2 rounded-lg text-xs font-bold">＋ グループメンバーを追加</button></div><div className="mt-3 space-y-2">{children.map(child=><div key={child.id} className="bg-slate-50 rounded-lg p-3 flex justify-between items-center"><div><div className="font-bold text-xs">{child.name}</div><div className="text-[10px] text-slate-400">{child.kana || 'フリガナ未登録'} {child.birthdate && ` / ${child.birthdate}`}</div></div><div className="flex gap-2"><button type="button" onClick={()=>openEditChild(child)} className="text-xs text-sky-600">編集</button><button type="button" onClick={()=>handleDeleteChild(child.id)} className="text-xs text-rose-500">削除</button></div></div>)}{!children.length && <div className="text-[10px] text-slate-400">受講生はまだ登録されていません。</div>}</div></div>})}</div></div></div>)}
        {isGroupLinkModalOpen && (
          <div className="fixed inset-0 z-[55] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5">
              <h3 className="font-bold text-sm border-b pb-3">👥 グループに紐付け</h3>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setGroupLinkMode('new')} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border ${groupLinkMode === 'new' ? 'bg-sky-50 border-sky-300 text-[#5e9bc4]' : 'bg-white border-slate-200 text-slate-500'}`}>新しいグループを作成</button>
                <button type="button" onClick={() => setGroupLinkMode('existing')} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border ${groupLinkMode === 'existing' ? 'bg-sky-50 border-sky-300 text-[#5e9bc4]' : 'bg-white border-slate-200 text-slate-500'}`}>既存グループへ追加</button>
              </div>
              <div className="space-y-3 pt-4 text-xs">
                {groupLinkMode === 'new' ? (
                  <>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">代表者名（決済者）</label>
                      <input value={groupRepName} onChange={e => setGroupRepName(e.target.value)} className="w-full border rounded-lg p-2.5" placeholder="例：藤田 奈々" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Square顧客ID</label>
                      <input value={groupRepSquareId} onChange={e => setGroupRepSquareId(e.target.value)} className="w-full border rounded-lg p-2.5 font-mono" placeholder="任意" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">既存グループ</label>
                    <select value={groupLinkParentId} onChange={e => setGroupLinkParentId(e.target.value)} className="w-full border rounded-lg p-2.5">
                      <option value="">選択してください</option>
                      {parents.filter(p => p.groupLinked).map(p => (
                        <option key={p.id} value={p.id}>{p.name} 様（決済者）</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsGroupLinkModalOpen(false)} className="bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold">キャンセル</button>
                <button type="button" onClick={handleSaveGroupLink} className="bg-[#5e9bc4] text-white px-4 py-2 rounded-lg text-xs font-bold">💾 保存</button>
              </div>
            </div>
          </div>
        )}

        {isChildFormOpen && (<div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5"><h3 className="font-bold text-sm border-b pb-3">{editingChildId ? '✏️ グループメンバー情報を編集' : '＋ グループメンバーを追加'}</h3><div className="space-y-3 pt-4 text-xs"><div><label className="block text-slate-500 font-semibold mb-1">代表者</label><select value={childFormParentId} onChange={e=>setChildFormParentId(e.target.value)} className="w-full border rounded-lg p-2.5">{parents.map(p=><option key={p.id} value={p.id}>{p.name} 様</option>)}</select></div><div><label className="block text-slate-500 font-semibold mb-1">名前</label><input value={childFormName} onChange={e=>setChildFormName(e.target.value)} className="w-full border rounded-lg p-2.5" /></div><div><label className="block text-slate-500 font-semibold mb-1">フリガナ</label><input value={childFormKana} onChange={e=>setChildFormKana(e.target.value)} className="w-full border rounded-lg p-2.5" /></div><div><label className="block text-slate-500 font-semibold mb-1">生年月日</label><input type="date" value={childFormBirthdate} onChange={e=>setChildFormBirthdate(e.target.value)} className="w-full border rounded-lg p-2.5" /></div><div><label className="block text-slate-500 font-semibold mb-1">メモ</label><textarea value={childFormMemo} onChange={e=>setChildFormMemo(e.target.value)} className="w-full border rounded-lg p-2.5 h-20" /></div></div><div className="flex justify-end gap-2 pt-4"><button type="button" onClick={()=>setIsChildFormOpen(false)} className="bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold">キャンセル</button><button type="button" onClick={handleSaveChild} className="bg-[#5e9bc4] text-white px-4 py-2 rounded-lg text-xs font-bold">💾 保存</button></div></div></div>)}
      </main>
    </div>
  );
}
