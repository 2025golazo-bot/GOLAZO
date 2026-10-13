
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type MediaItem = {
  id: string;
  storage_path: string;
  file_name: string;
  media_type: 'image' | 'video';
  category: string;
  taken_date: string | null;
  created_at: string;
};

type DisplayItem = MediaItem & {
  url: string;
};

export default function ClientMediaManager({
  clientId,
  onEnable,
}: {
  clientId?: string;
  onEnable?: () => Promise<string>;
}) {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [enabling, setEnabling] = useState(false);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!clientId || files.length === 0 || uploading) return;

    setUploading(true);
    setError('');
    setUploadMessage('');

    const supabase = createClient();
    let completed = 0;

    try {
      const { data: auth, error: authError } =
        await supabase.auth.getUser();

      if (authError || !auth.user) {
        throw new Error('ログイン情報を確認できません');
      }

      for (const file of files) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
          throw new Error('写真・動画以外のファイルは登録できません');
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${clientId}/${crypto.randomUUID()}-${safeName}`;

        const { error: storageError } = await supabase.storage
          .from('client-media')
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
          });

        if (storageError) throw storageError;

        const { error: dbError } = await supabase
          .from('client_media')
          .insert({
            client_id: clientId,
            storage_path: path,
            file_name: file.name,
            media_type: isImage ? 'image' : 'video',
            category: 'session',
          });

        if (dbError) {
          await supabase.storage.from('client-media').remove([path]);
          throw dbError;
        }

        completed++;
      }

      setUploadMessage(`${completed}件の写真・動画を保存しました`);
    } catch (err) {
      setError(
        `${completed}件保存済み。` +
        (err instanceof Error ? err.message : 'アップロードに失敗しました')
      );
    } finally {
      setUploading(false);
      setRefreshKey(value => value + 1);
    }
  }, [clientId, uploading]);

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
        const { data, error: listError } = await supabase
          .from('client_media')
          .select(
            'id, storage_path, file_name, media_type, category, taken_date, created_at'
          )
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (listError) throw listError;

        const records: DisplayItem[] = [];

        for (const item of (data || []) as MediaItem[]) {
          const { data: signed, error: urlError } =
            await supabase.storage
              .from('client-media')
              .createSignedUrl(item.storage_path, 3600);

          if (urlError || !signed?.signedUrl) {
            throw urlError || new Error('閲覧URLを取得できません');
          }

          records.push({
            ...item,
            url: signed.signedUrl,
          });
        }

        if (!cancelled) setItems(records);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : '読み込みに失敗しました'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [clientId, refreshKey]);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">
        📷 写真・動画管理
      </h3>

      {clientId && (
        <div className="space-y-2">
          <label className="inline-block cursor-pointer rounded-lg bg-[#5e9bc4] px-4 py-2 text-sm font-bold text-white">
            {uploading ? 'アップロード中...' : '＋ 写真・動画を追加'}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={event => {
                const selectedFiles = event.target.files;
                if (!selectedFiles?.length) return;

                const files = Array.from(selectedFiles);
                event.target.value = '';
                void uploadFiles(files);
              }}
            />
          </label>
          {uploadMessage && (
            <p className="text-xs text-green-700">{uploadMessage}</p>
          )}
        </div>
      )}

      {!clientId ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            写真・動画の保存を始めるには、顧客情報の確認が必要です。
          </p>
          {onEnable && (
            <button
              type="button"
              disabled={enabling}
              onClick={async () => {
                setEnabling(true);
                setError('');
                try {
                  await onEnable();
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : '有効化に失敗しました'
                  );
                } finally {
                  setEnabling(false);
                }
              }}
              className="rounded-lg border border-[#5e9bc4] px-3 py-1.5 text-xs font-semibold text-[#5e9bc4] disabled:opacity-50"
            >
              {enabling ? '確認中...' : '写真・動画を有効化'}
            </button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      ) : loading ? (
        <p className="text-xs text-slate-500">読み込み中...</p>
      ) : error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-500">
          まだ写真・動画は登録されていません。
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.map(item => (
            <div key={item.id} className="space-y-1">
              {item.media_type === 'video' ? (
                <video
                  src={item.url}
                  controls
                  preload="metadata"
                  className="w-full rounded-lg"
                />
              ) : (
                <a href={item.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.file_name}
                    className="w-full h-28 object-cover rounded-lg"
                  />
                </a>
              )}
              <p className="text-[11px] text-slate-600 truncate">
                {item.file_name}
              </p>
              <p className="text-[10px] text-slate-400">
                {item.taken_date || item.created_at.slice(0, 10)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
