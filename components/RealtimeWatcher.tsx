"use client";

import { useRealtimeRefresh } from "@/lib/useRealtimeRefresh";

export default function RealtimeWatcher({ tables }: { tables: string[] }) {
  useRealtimeRefresh(tables);
  return null;
}
