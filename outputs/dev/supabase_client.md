# Supabase クライアント初期化コード

作成日: 2026-04-02

---

## `lib/supabase/client.ts` — ブラウザ用クライアント

Client Components（`"use client"` ディレクティブのあるコンポーネント）から使用する。

```typescript
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
```

---

## `lib/supabase/server.ts` — Server Components 用クライアント

Server Components・Server Actions・Route Handlers から使用する。
Cookie の読み書きに Next.js の `cookies()` を利用する。

```typescript
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
```

---

## `types/database.ts` — DB 型定義（スケルトン）

```typescript
// types/database.ts
// Supabase データベースの型定義
// supabase gen types typescript --project-id <project-id> で自動生成可能

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: "admin" | "buyer";
          company_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: "admin" | "buyer";
          company_name?: string | null;
          created_at?: string;
        };
        Update: {
          role?: "admin" | "buyer";
          company_name?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          vintage: number | null;
          producer: string | null;
          region: string | null;
          grape_variety: string | null;
          price: number;
          stock: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          status: "pending" | "confirmed" | "shipped" | "delivered";
          note: string | null;
          ordered_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "ordered_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
```
