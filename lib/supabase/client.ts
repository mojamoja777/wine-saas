// lib/supabase/client.ts
// ブラウザ（Client Components）で使用する Supabase クライアント
// @supabase/ssr の createBrowserClient を使用

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * ブラウザ用 Supabase クライアントを生成して返す
 * Client Components 内で毎回呼び出して使用する
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
