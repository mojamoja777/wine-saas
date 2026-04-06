// proxy.ts
// 全ルートで実行されるプロキシ
// 認証状態の確認・セッションの更新・ロール別リダイレクトを行う

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ログインページ・トップ：認証済みならロール別ページにリダイレクト
  if (pathname === "/login" || pathname === "/") {
    if (user) {
      const role = user.app_metadata?.role as "admin" | "buyer" | undefined;
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (role === "buyer") {
        return NextResponse.redirect(new URL("/buyer", request.url));
      }
    }
    return supabaseResponse;
  }

  // 管理者ページのアクセス制御
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user.app_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/buyer", request.url));
    }
  }

  // 発注者ページのアクセス制御
  if (pathname.startsWith("/buyer")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user.app_metadata?.role !== "buyer") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
