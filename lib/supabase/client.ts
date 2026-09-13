import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// 環境変数が未設定のビルド時でもクラッシュしないようにフォールバックを設定
const supabaseUrl = 'https://amgbfmaxvfrsjzfcpcll.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseKey);
}
