# ワイン発注管理 SaaS

酒屋（管理者）と飲食店（発注者）をつなぐ発注管理 Web アプリケーション。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **データベース / 認証**: Supabase (PostgreSQL + Auth)
- **スタイリング**: Tailwind CSS v4
- **デプロイ**: Vercel
- **テスト**: Playwright

---

## ローカル開発

### 必要環境

- Node.js 20+
- Supabase プロジェクト（セットアップ済み）

### セットアップ手順

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.local.example .env.local
# .env.local を編集して Supabase の URL / キーを設定

# 開発サーバーの起動
npm run dev
```

### 環境変数

`.env.local` に以下を設定してください。

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon キー（公開可） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role キー（**絶対に非公開**） |

---

## Supabase セットアップ

### 1. マイグレーションの実行

`outputs/db/migration.sql` の内容を Supabase SQL Editor で実行してください。

### 2. ユーザーのロール設定

Supabase SQL Editor で以下を実行してロールを付与します。

```sql
-- 管理者ロールを設定
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@yourdomain.com';

-- 発注者ロールを設定
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "buyer"}'::jsonb
WHERE email = 'buyer@yourdomain.com';
```

---

## Vercel デプロイ

### 1. Vercel にリポジトリを接続

[Vercel ダッシュボード](https://vercel.com) でプロジェクトをインポートし、**Root Directory** を `app` に設定してください。

### 2. 環境変数の登録

Vercel の **Settings → Environment Variables** に以下を登録します。

| 変数名 | 環境 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production / Preview / Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production / Preview / Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production のみ |

### 3. デプロイ

`main` ブランチへのプッシュで自動デプロイされます。

---

## E2E テスト

### 事前準備

Supabase に以下のテスト用アカウントを作成し、ロールを設定してください。

| アカウント | メール | ロール |
|---|---|---|
| 管理者 | `admin@test.example` | admin |
| 発注者 | `buyer@test.example` | buyer |

テスト用のメールアドレスとパスワードは環境変数で変更できます。

```bash
E2E_ADMIN_EMAIL=admin@test.example
E2E_ADMIN_PASSWORD=yourpassword
E2E_BUYER_EMAIL=buyer@test.example
E2E_BUYER_PASSWORD=yourpassword
```

### テスト実行

```bash
# ヘッドレスで実行
npm run test:e2e

# UI モードで実行（デバッグに便利）
npm run test:e2e:ui

# レポートを確認
npm run test:e2e:report
```

---

## アプリケーション構成

```
app/
├── app/
│   ├── (auth)/login/        # ログイン
│   ├── (admin)/admin/       # 管理者画面
│   │   ├── page.tsx         # 発注一覧
│   │   ├── orders/[id]/     # 発注詳細・ステータス変更
│   │   └── products/        # 商品管理（CRUD）
│   └── (buyer)/buyer/       # 発注者画面
│       ├── page.tsx         # 商品一覧
│       ├── cart/            # カート・発注確認
│       └── orders/          # 発注履歴・詳細
├── components/
│   ├── admin/               # 管理者向けコンポーネント
│   └── buyer/               # 発注者向けコンポーネント
├── lib/
│   ├── supabase/            # Supabase クライアント
│   └── cart-context.tsx     # カート状態管理
├── proxy.ts                 # 認証・ロール別リダイレクト
└── e2e/                     # Playwright テスト
```

## ユーザーロール

| ロール | 画面 | 主な機能 |
|---|---|---|
| admin（酒屋） | `/admin` | 発注管理・ステータス更新・商品 CRUD |
| buyer（飲食店） | `/buyer` | 商品閲覧・カート・発注・履歴確認 |
