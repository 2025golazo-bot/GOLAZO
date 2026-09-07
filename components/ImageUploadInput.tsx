"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadInputProps {
  label: string;
  bucket?: string;
  folder: string;
  onUploaded: (publicUrl: string) => void;
}

export default function ImageUploadInput({
  label,
  bucket = "gym-media",
  folder,
  onUploaded,
}: ImageUploadInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onUploaded(data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ink/60">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={label}
            className="h-14 w-14 rounded-lg object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="text-xs text-ink/60 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-dark"
        />
        {uploading && <span className="text-xs text-ink/40">アップロード中...</span>}
      </div>
    </div>
  );
}
