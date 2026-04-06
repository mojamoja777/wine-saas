# dev エージェントへの指示：F0-3 / F0-4

作成日: 2026-04-02
依頼元: PM

---

## 依頼概要

ワイン発注管理SaaS（MVP）のNext.jsプロジェクト初期設定と、Supabase接続・Auth設定コードを作成してください。

**実際のファイル作成はしません。コードとファイル構成を成果物として出力してください。**

---

## Supabase プロジェクト情報

- URL: `https://itcrnvjpwheetpokbegp.supabase.co`
- anon key: `sb_publishable_rZtIAPcfXkQR0ngBYivnnw_b809aWxO`

---

## 技術スタック

- Next.js 14（App Router）
- TypeScript
- Supabase（Auth + DB）
- Tailwind CSS
- Vercel デプロイ前提

---

## 成果物として作成してほしいもの

### 1. `project_structure.md`
推奨ディレクトリ構成（ファイルツリー形式）

### 2. `setup_commands.md`
プロジェクト初期化から起動までのコマンド手順

### 3. `supabase_client.ts`
Supabase クライアント初期化コード
- `lib/supabase/client.ts`（ブラウザ用）
- `lib/supabase/server.ts`（Server Components用）

### 4. `auth_implementation.md`
以下のAuth実装コードとその説明：
- ログイン画面（`app/(auth)/login/page.tsx`）
- ログインのサーバーアクション（`app/(auth)/login/actions.ts`）
- ミドルウェアによるロール別リダイレクト（`middleware.ts`）
  - admin → `/admin`
  - buyer → `/buyer`
- ログアウト処理

### 5. `env_example.md`
必要な環境変数一覧（`.env.local` のテンプレート）

---

## 重要な要件

- コメントは日本語で書く
- Supabase Auth の `user_metadata` または `app_metadata` でロール管理
- ミドルウェアで未認証ユーザーを `/login` にリダイレクト
- TypeScript の型は適切に定義する
- `@supabase/ssr` パッケージを使用（`@supabase/auth-helpers-nextjs` は非推奨）

成果物は `/Users/sagawashouta/wine-saas/outputs/dev/` に置いてください。
