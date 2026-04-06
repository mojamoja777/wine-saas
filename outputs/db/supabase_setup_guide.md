# Supabase 新規プロジェクト作成手順

作成日: 2026-04-02
担当: db エージェント
対象者: しょーたさん（手動での初期セットアップ）

---

## 概要

このガイドでは、ワイン発注管理SaaSのSupabaseプロジェクトをゼロから作成し、
マイグレーションSQLを適用するまでの手順を説明します。

所要時間の目安: 約15〜20分

---

## 手順1：Supabaseアカウントの準備

1. ブラウザで https://supabase.com を開く
2. 右上の「Start your project」または「Sign in」をクリック
3. GitHub アカウントでログイン（推奨）またはメールアドレスで登録

---

## 手順2：新規プロジェクトの作成

1. ダッシュボードにログイン後、「New project」ボタンをクリック

2. 以下を入力する：

   | 項目 | 入力値 |
   |------|--------|
   | Organization | 個人アカウントまたは会社名 |
   | Project name | `wine-saas` （任意） |
   | Database Password | **強いパスワードを設定してメモしておく** |
   | Region | `Northeast Asia (Tokyo)` を選択 |
   | Pricing Plan | `Free` でOK（MVP段階） |

3. 「Create new project」をクリック

4. プロジェクトの初期化に1〜2分かかる（緑色のランプが点灯するまで待つ）

---

## 手順3：プロジェクトの API キーを確認・メモ

1. 左メニューの「Project Settings」（歯車アイコン）をクリック
2. 「API」タブを開く
3. 以下をメモしておく（後で Next.js の環境変数に使用）：

   | 項目 | 説明 |
   |------|------|
   | Project URL | `https://xxxxxx.supabase.co` |
   | anon / public key | フロントエンド用の公開キー |
   | service_role key | **サーバー専用・絶対に公開しないこと** |

---

## 手順4：マイグレーション SQL の実行

1. 左メニューの「SQL Editor」をクリック
2. 「New query」をクリック（または「+ 」ボタン）
3. `migration.sql` ファイルの内容をすべてコピーして貼り付ける
4. 右上の「Run」ボタン（または `Ctrl + Enter`）をクリック
5. 画面下部に「Success. No rows returned」と表示されれば成功

**エラーが出た場合：**
- `already exists` エラー → すでに実行済みの可能性。ダッシュボードでテーブルを確認する
- `permission denied` エラー → service_role でのログインが必要。Supabaseサポートに問い合わせ

---

## 手順5：テーブルが正しく作成されたか確認

1. 左メニューの「Table Editor」をクリック
2. 以下の4テーブルが表示されることを確認：
   - `users`
   - `products`
   - `orders`
   - `order_items`

---

## 手順6：RLS（行レベルセキュリティ）の確認

1. 左メニューの「Authentication」→「Policies」をクリック
2. 各テーブルに以下のポリシーが設定されていることを確認：

   | テーブル | ポリシー数の目安 |
   |---------|----------------|
   | users | 5件 |
   | products | 2件 |
   | orders | 6件 |
   | order_items | 5件 |

3. 各ポリシーの「Enabled」がオンになっていることを確認

---

## 手順7：Storage バケットの作成（商品画像用）

1. 左メニューの「Storage」をクリック
2. 「New bucket」をクリック
3. 以下を入力：

   | 項目 | 入力値 |
   |------|--------|
   | Bucket name | `product-images` |
   | Public bucket | オンにする（商品画像は公開URLで表示するため） |

4. 「Create bucket」をクリック

---

## 手順8：Next.js プロジェクトへの環境変数設定

プロジェクトのルートに `.env.local` ファイルを作成し、以下を記入：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...（anon/public key）
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...（service_role key ※サーバー専用）
```

> **注意**: `.env.local` は `.gitignore` に含まれていることを確認する。絶対にGitにコミットしない。

---

## 手順9：初期 admin ユーザーの作成

MVPでは admin ユーザーを手動で1件作成します。

### 9-1. Authentication でユーザーを招待

1. 左メニューの「Authentication」→「Users」をクリック
2. 「Invite user」をクリック
3. しょーたさんのメールアドレスを入力して「Send invitation」
4. メールに届いたリンクからパスワードを設定する

### 9-2. admin ロールを付与

招待後、SQL Editor で以下を実行（`your-email@example.com` を実際のメールに変更）：

```sql
-- admin ユーザーのプロファイルを作成
INSERT INTO public.users (id, role, company_name)
SELECT
  id,
  'admin',
  'ワインショップ〇〇'  -- 実際の酒屋名に変更
FROM auth.users
WHERE email = 'your-email@example.com';
```

---

## 完了チェックリスト

- [ ] Supabase プロジェクトを作成した
- [ ] Project URL と API キーをメモした
- [ ] `migration.sql` を実行してテーブルが4つ作成された
- [ ] RLS ポリシーが設定されている
- [ ] Storage バケット `product-images` を作成した
- [ ] `.env.local` に環境変数を設定した
- [ ] admin ユーザーを作成した

---

## 困ったときは

- **Supabase 公式ドキュメント**: https://supabase.com/docs
- **Next.js + Supabase の公式ガイド**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **エラーが解消しない場合**: db エージェントに SQL エラーメッセージを共有してください
