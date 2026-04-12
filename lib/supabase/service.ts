// lib/supabase/service.ts
// Service Role を用いた Supabase クライアント
// Cron ジョブなど、認証ユーザーを介さずに DB を操作する場面で使用する
// RLS をバイパスするため、取扱注意（絶対にクライアントに露出させないこと）

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY または NEXT_PUBLIC_SUPABASE_URL が未設定です"
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
