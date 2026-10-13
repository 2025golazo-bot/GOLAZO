
'use client';

import { useEffect, useState } from 'react';
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
}: {
  clientId?: string;
}) {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
  }, [clientId]);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-800 text-sm">
        📷 写真・動画管理
      </h3>

      {!clientId ? (
        <p className="text-xs text-slate-500">
          Supabaseに登録された顧客の写真・動画を管理できます。
        </p>
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
