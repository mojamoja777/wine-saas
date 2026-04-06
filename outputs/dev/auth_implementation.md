# Auth 実装コード

作成日: 2026-04-02

---

## `app/(auth)/login/page.tsx` — ログイン画面

```tsx
// app/(auth)/login/page.tsx
// ログイン画面
// メールアドレスとパスワードで Supabase Auth にサインイン

"use client";

import { useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // 成功時は Server Action 内で redirect() するためここには戻らない
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">ワイン発注管理</h1>
          <p className="mt-2 text-sm text-gray-600">アカウントにログイン</p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## `app/(auth)/login/actions.ts` — サーバーアクション

```typescript
// app/(auth)/login/actions.ts
// ログイン・ログアウトのサーバーアクション
// Supabase Auth の signInWithPassword を使用

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * ログイン処理
 * 成功した場合はロールに応じてリダイレクトする
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  // app_metadata からロールを取得
  const role = data.user?.app_metadata?.role as "admin" | "buyer" | undefined;

  if (role === "admin") {
    redirect("/admin");
  } else if (role === "buyer") {
    redirect("/buyer");
  } else {
    return { error: "アカウントのロールが設定されていません。管理者にお問い合わせください。" };
  }
}

/**
 * ログアウト処理
 * Supabase のセッションを破棄してログイン画面にリダイレクト
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

---

## `middleware.ts` — ロール別リダイレクト

```typescript
// middleware.ts
// 全ルートで実行されるミドルウェア
// 認証状態の確認・セッションの更新・ロール別リダイレクトを行う

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションを取得・更新
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ログインページ：認証済みならロール別ページにリダイレクト
  if (pathname === "/login" || pathname === "/") {
    if (user) {
      const role = user.app_metadata?.role as "admin" | "buyer" | undefined;
      if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
      if (role === "buyer") return NextResponse.redirect(new URL("/buyer", request.url));
    }
    return supabaseResponse;
  }

  // 管理者ページのアクセス制御
  if (pathname.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (user.app_metadata?.role !== "admin") return NextResponse.redirect(new URL("/buyer", request.url));
  }

  // 発注者ページのアクセス制御
  if (pathname.startsWith("/buyer")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (user.app_metadata?.role !== "buyer") return NextResponse.redirect(new URL("/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## `components/LogoutButton.tsx` — ログアウトボタン

```tsx
// components/LogoutButton.tsx
// ログアウトボタンコンポーネント

import { logout } from "@/app/(auth)/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="px-4 py-2 text-sm text-gray-700 hover:text-red-600"
      >
        ログアウト
      </button>
    </form>
  );
}
```

---

## ロール設定方法（Supabase SQL Editor）

ユーザーの `app_metadata` にロールを設定する。

```sql
-- admin ロールを設定
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';

-- buyer ロールを設定
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "buyer"}'::jsonb
WHERE email = 'buyer@example.com';
```
