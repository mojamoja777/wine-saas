# プロジェクト初期化コマンド手順

作成日: 2026-04-02

---

## 1. Next.js プロジェクト作成

```bash
# Next.js 14 プロジェクトを TypeScript・Tailwind・App Router で作成
npx create-next-app@14 wine-saas \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd wine-saas
```

## 2. 必要パッケージのインストール

```bash
# Supabase SSR クライアント（@supabase/auth-helpers-nextjs は非推奨のため使わない）
npm install @supabase/supabase-js @supabase/ssr
```

## 3. ディレクトリ構成の作成

```bash
mkdir -p lib/supabase types
mkdir -p "app/(auth)/login"
mkdir -p "app/(admin)/admin/orders" "app/(admin)/admin/products" "app/(admin)/admin/buyers"
mkdir -p "app/(buyer)/buyer/orders/new" "app/(buyer)/buyer/products"
mkdir -p components/ui components/admin components/buyer
mkdir -p app/api/auth/callback
```

## 4. 環境変数の設定

```bash
# .env.local を作成（値は env_example.md を参照）
```

## 5. 開発サーバーの起動

```bash
npm run dev
# http://localhost:3000 でアクセス可能
```

## 6. ビルド確認

```bash
npm run build
```

## 7. Vercel デプロイ

```bash
# Vercel CLI のインストール（未インストールの場合）
npm install -g vercel

# デプロイ（初回は対話形式でプロジェクト設定）
vercel

# 本番デプロイ
vercel --prod
```

> **注意**: Vercel の環境変数設定画面（Settings > Environment Variables）でも
> `.env.local` と同じ環境変数を登録すること。
