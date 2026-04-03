// lib/supabase/server.ts
// Server Components / Server Actions / Route Handlers で使用する Supabase クライアント
// @supabase/ssr の createServerClient を使用し、Cookie を Next.js の cookies() で管理する

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * サーバー用 Supabase クライアントを生成して返す
 * Server Components・Server Actions・Route Handlers で使用する
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components から呼ばれた場合は Cookie を設定できないため無視
            // セッションの更新は middleware.ts で行われる
          }
        },
      },
    }
  );
}
