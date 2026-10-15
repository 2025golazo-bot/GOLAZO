"use client";

import { useEffect, useState } from "react";
import { heicTo } from "heic-to";

type Preview = {
  name: string;
  url: string;
  error?: string;
};

export default function SessionPhotoPreview({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (index: number) => void;
}) {
  const [previews, setPreviews] = useState<Preview[]>([]);

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    async function load() {
      const results: Preview[] = [];

      for (const file of files) {
        if (cancelled) break;

        try {
          const isHeic =
            /\\.(heic|heif)$/i.test(file.name) ||
            ["image/heic", "image/heif"].includes(file.type);

          let source: Blob = file;

          if (isHeic) {
            const converted = await heicTo({
              blob: file,
              type: "image/jpeg",
              quality: 0.8,
            });
            if (!(converted instanceof Blob)) {
              throw new Error("HEIC写真を表示できません");
            }
            source = converted;
          }

          if (cancelled) break;

          const url = URL.createObjectURL(source);
          urls.push(url);
          results.push({ name: file.name, url });
        } catch {
          results.push({
            name: file.name,
            url: "",
            error: "プレビューできません。別の写真を選択してください。",
          });
        }
      }

      if (!cancelled) setPreviews(results);
    }

    setPreviews([]);
    void load();

    return () => {
      cancelled = true;
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-700">
        選択した写真（{files.length}枚）
      </p>
      <div className="grid grid-cols-2 gap-3">
        {files.map((file, index) => {
          const item = previews[index];
          return (
            <div key={`${index}-${file.name}`} className="rounded-lg border bg-white p-2">
              {item?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={`選択写真 ${index + 1}`}
                  className="h-32 w-full rounded object-contain"
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded bg-slate-100 p-2 text-center text-xs text-slate-500">
                  {item?.error || "プレビュー準備中..."}
                </div>
              )}
              <p className="mt-1 truncate text-xs text-slate-600">{file.name}</p>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-2 text-xs font-semibold text-red-600"
              >
                この写真を選択解除
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
