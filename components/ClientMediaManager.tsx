'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type SessionOption = { id: string; date: string; staff: string; content: string };
type MediaItem = {
  id: string;
  storage_path: string;
  file_name: string;
  media_type: 'image' | 'video';
  category: string;
  taken_date: string | null;
  session_id: string | null;
  created_at: string;
};
type DisplayItem = MediaItem & { url: string };

export default function ClientMediaManager({
  clientId,
  onEnable,
  sessions = [],
}: {
  clientId?: string;
  onEnable?: () => Promise<string>;
  sessions?: SessionOption[];
}) {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [enabling, setEnabling] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const orderedSessions = [...sessions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const sessionLabel = (session: SessionOption) =>
    `${session.date} / ${session.staff} / ${session.content.slice(0, 35)}`;

  const uploadFiles = useCallback(async (files: File[], sessionId: string) => {
    if (!clientId || files.length === 0 || uploading) return;
    setUploading(true);
    setError('');
    setUploadMessage('');
    const supabase = createClient();
    let completed = 0;
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('登録済みセッションを選択してください');
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error('ログイン情報を確認できません');
      for (const file of files) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (!isImage && !isVideo) throw new Error('写真・動画以外のファイルは登録できません');
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${clientId}/${crypto.randomUUID()}-${safeName}`;
        const { error: storageError } = await supabase.storage
          .from('client-media').upload(path, file, { contentType: file.type, upsert: false });
        if (storageError) throw storageError;
        const { error: dbError } = await supabase.from('client_media').insert({
          client_id: clientId,
          storage_path: path,
          file_name: file.name,
          media_type: isImage ? 'image' : 'video',
          category: 'session',
          session_id: session.id,
          taken_date: session.date,
        });
        if (dbError) {
          await supabase.storage.from('client-media').remove([path]);
          throw dbError;
        }
        completed++;
      }
      setUploadMessage(`${completed}件の写真・動画を保存しました`);
    } catch (err) {
      setError(`${completed}件保存済み。` + (err instanceof Error ? err.message : 'アップロードに失敗しました'));
    } finally {
      setUploading(false);
      setRefreshKey(value => value + 1);
    }
  }, [clientId, uploading, sessions]);

  const saveSession = async (item: DisplayItem) => {
    if (!clientId || busyId) return;
    const session = sessions.find(s => s.id === editingSessionId);
    if (editingSessionId && !session) {
      setError('選択したセッションが見つかりません');
      return;
    }
    setBusyId(item.id);
    setError('');
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.from('client_media')
        .update({ session_id: session?.id ?? null, taken_date: session?.date ?? null })
        .eq('id', item.id).eq('client_id', clientId);
      if (updateError) throw updateError;
      setEditingId(null);
      setRefreshKey(value => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '変更に失敗しました');
    } finally {
      setBusyId(null);
    }
  };

  const deleteItem = async (item: DisplayItem) => {
    if (!clientId || busyId) return;
    if (!window.confirm(`「${item.file_name}」を削除しますか？\n削除した写真・動画は元に戻せません。`)) return;
    setBusyId(item.id);
    setError('');
    try {
      const supabase = createClient();
      // First remove the database row; storage cleanup follows. If storage removal
      // fails, the file is orphaned but no broken media record is displayed.
      const { data: deleted, error: deleteError } = await supabase.from('client_media')
        .delete().eq('id', item.id).eq('client_id', clientId).select('id');
      if (deleteError) throw deleteError;
      if (!deleted?.length) throw new Error('削除できませんでした。権限を確認してください');
      const { error: storageError } = await supabase.storage.from('client-media')
        .remove([item.storage_path]);
      if (storageError) {
        setError('一覧から削除しましたが、保存ファイルの削除に失敗しました。管理者に確認してください。');
      }
      setEditingId(null);
      setRefreshKey(value => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setItems([]);
    setError('');
    setLoading(false);
    if (!clientId) return;
    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      try {
        const { data, error: listError } = await supabase.from('client_media')
          .select('id, storage_path, file_name, media_type, category, taken_date, session_id, created_at')
          .eq('client_id', clientId).order('created_at', { ascending: false });
        if (listError) throw listError;
        const records: DisplayItem[] = [];
        for (const item of (data || []) as MediaItem[]) {
          const { data: signed, error: urlError } = await supabase.storage
            .from('client-media').createSignedUrl(item.storage_path, 3600);
          if (urlError || !signed?.signedUrl) throw urlError || new Error('閲覧URLを取得できません');
          records.push({ ...item, url: signed.signedUrl });
        }
        if (!cancelled) setItems(records);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '読み込みに失敗しました');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [clientId, refreshKey]);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">📷 写真・動画管理</h3>
      {clientId && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="写真・動画の登録先セッション"
              value={selectedSessionId}
              disabled={uploading || orderedSessions.length === 0}
              onChange={event => setSelectedSessionId(event.target.value)}
              className="max-w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            >
              <option value="">登録先セッションを選択</option>
              {orderedSessions.map(session => (
                <option key={session.id} value={session.id}>{sessionLabel(session)}</option>
              ))}
            </select>
            <label className={`inline-block rounded-lg px-4 py-2 text-sm font-bold text-white ${uploading || !selectedSessionId ? 'cursor-not-allowed bg-slate-300' : 'cursor-pointer bg-[#5e9bc4]'}`}>
              {uploading ? 'アップロード中...' : '＋ 写真・動画を追加'}
              <input
                type="file" accept="image/*,video/*" multiple
                disabled={uploading || !selectedSessionId} className="hidden"
                onChange={event => {
                  const files = Array.from(event.target.files || []);
                  event.target.value = '';
                  if (files.length) void uploadFiles(files, selectedSessionId);
                }}
              />
            </label>
          </div>
          {orderedSessions.length === 0 && (
            <p className="text-xs text-slate-500">先にセッション履歴を登録してください。</p>
          )}
          {uploadMessage && <p className="text-xs text-green-700">{uploadMessage}</p>}
        </div>
      )}
      {!clientId ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">写真・動画の保存を始めるには、顧客情報の確認が必要です。</p>
          {onEnable && (
            <button type="button" disabled={enabling}
              onClick={async () => {
                setEnabling(true);
                setError('');
                try { await onEnable(); }
                catch (err) { setError(err instanceof Error ? err.message : '有効化に失敗しました'); }
                finally { setEnabling(false); }
              }}
              className="rounded-lg border border-[#5e9bc4] px-3 py-1.5 text-xs font-semibold text-[#5e9bc4] disabled:opacity-50"
            >{enabling ? '確認中...' : '写真・動画を有効化'}</button>
          )}
        </div>
      ) : loading ? (
        <p className="text-xs text-slate-500">読み込み中...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-500">まだ写真・動画は登録されていません。</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {items.map(item => {
            const linked = sessions.find(session => session.id === item.session_id);
            return (
              <div key={item.id} className="min-w-0 space-y-1 rounded-lg border border-slate-100 p-2">
                {item.media_type === 'video' ? (
                  <video src={item.url} controls preload="metadata"
                    className="w-full h-28 object-contain rounded-lg bg-slate-50" />
                ) : (
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.file_name}
                      className="w-full h-28 object-contain rounded-lg bg-slate-50" />
                  </a>
                )}
                <p className="text-[11px] text-slate-600 truncate" title={item.file_name}>{item.file_name}</p>
                <p className="text-[10px] text-slate-500">
                  {linked ? `${linked.date} / ${linked.staff}` : item.session_id ? `セッション未確認 (${item.taken_date || '日付なし'})` : 'セッション未設定'}
                </p>
                {editingId === item.id ? (
                  <div className="space-y-1">
                    <select aria-label="紐づけ先セッションの変更" value={editingSessionId}
                      onChange={event => setEditingSessionId(event.target.value)}
                      className="w-full rounded border border-slate-300 px-1 py-1 text-xs">
                      <option value="">セッション未設定</option>
                      {orderedSessions.map(session => (
                        <option key={session.id} value={session.id}>{sessionLabel(session)}</option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={!!busyId} onClick={() => void saveSession(item)}
                        className="text-xs font-semibold text-[#4d85ab] disabled:opacity-50">保存</button>
                      <button type="button" disabled={!!busyId} onClick={() => setEditingId(null)}
                        className="text-xs text-slate-500">キャンセル</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button type="button" disabled={!!busyId} onClick={() => {
                      setEditingId(item.id);
                      setEditingSessionId(item.session_id || '');
                      setError('');
                    }} className="text-xs font-semibold text-[#4d85ab] disabled:opacity-50">修正</button>
                    <button type="button" disabled={!!busyId} onClick={() => void deleteItem(item)}
                      className="text-xs font-semibold text-red-600 disabled:opacity-50">削除</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
