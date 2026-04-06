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
    return {
      error: "アカウントのロールが設定されていません。管理者にお問い合わせください。",
    };
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
