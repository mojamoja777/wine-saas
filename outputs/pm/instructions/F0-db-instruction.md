# db エージェントへの指示：F0-1 / F0-2

作成日: 2026-04-02
依頼元: PM

---

## 依頼概要

ワイン発注管理SaaS（MVP）のDBスキーマ設計とマイグレーションSQLを作成してください。

---

## 前提条件

- Supabase は**新規プロジェクト作成から**スタート
- Next.js App Router からの利用を想定
- MVP スコープに絞った設計（シンプルさ優先）

---

## MVP スコープで必要なテーブル

### 1. users（ユーザー）
Supabase Auth の `auth.users` を拡張するプロファイルテーブル。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK, FK→auth.users) | Auth と紐付け |
| role | text | 'admin'（酒屋）/ 'buyer'（飲食店） |
| company_name | text | 店舗名・会社名 |
| created_at | timestamptz | 作成日時 |

### 2. products（商品）
酒屋が登録するワイン商品。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| name | text | ワイン名 |
| vintage | int | ヴィンテージ（年） |
| producer | text | 生産者 |
| region | text | 産地 |
| grape_variety | text | 品種 |
| price | numeric | 単価（税抜） |
| stock | int | 在庫数 |
| image_url | text | 商品画像URL |
| is_active | boolean | 表示フラグ |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 3. orders（発注ヘッダ）
飲食店の1回の発注単位。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| buyer_id | uuid (FK→users.id) | 発注者 |
| status | text | 'pending' / 'confirmed' / 'shipped' / 'delivered' |
| note | text | 備考 |
| ordered_at | timestamptz | 発注日時 |
| updated_at | timestamptz | |

### 4. order_items（発注明細）
1発注の中の各商品。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid (PK) | |
| order_id | uuid (FK→orders.id) | |
| product_id | uuid (FK→products.id) | |
| quantity | int | 数量 |
| unit_price | numeric | 発注時単価（スナップショット） |

---

## RLS 要件

| テーブル | admin | buyer |
|---------|-------|-------|
| users | 全件読み取り・更新 | 自分のみ読み取り・更新 |
| products | CRUD | is_active=true のみ読み取り |
| orders | 全件読み取り・ステータス更新 | 自分のみ CRUD |
| order_items | 全件読み取り | 自分の order のみ CRUD |

---

## 成果物として作成してほしいもの

1. **ER図**（テキスト形式またはMermaid記法）
2. **マイグレーションSQL**（テーブル作成 + RLS + インデックス）
3. **Supabase新規プロジェクト作成手順**（しょーたさん向けの手動手順）

成果物は `/Users/sagawashouta/wine-saas/outputs/db/` に置いてください。

---

## 注意事項

- 将来的に割り当て制発注・請求機能を追加する可能性あり（今は設計しない）
- `updated_at` は trigger で自動更新する形にしてください
- SQLには必ずコメントを付けてください
