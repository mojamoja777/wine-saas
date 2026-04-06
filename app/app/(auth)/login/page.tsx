// app/(auth)/login/page.tsx
// ログイン画面
// メールアドレスとパスワードで Supabase Auth にサインイン

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-[#FDF4F6] px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍷</div>
          <h1 className="text-lg font-semibold text-[#3B0A1E] tracking-wide">
            Wine Order
          </h1>
          <p className="text-sm text-gray-600 mt-1">ワイン発注管理</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form action={handleSubmit} className="space-y-5">
            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="example@restaurant.jp"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
              />
            </div>

            {/* パスワード */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B1A35] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#9B2D50] active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
