# ER図 - ワイン発注管理SaaS（MVP）

作成日: 2026-04-02
担当: db エージェント

---

## Mermaid ER 図

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        text email
        timestamptz created_at
    }

    USERS {
        uuid id PK
        text role
        text company_name
        timestamptz created_at
    }

    PRODUCTS {
        uuid id PK
        text name
        int vintage
        text producer
        text region
        text grape_variety
        numeric price
        int stock
        text image_url
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    ORDERS {
        uuid id PK
        uuid buyer_id FK
        text status
        text note
        timestamptz ordered_at
        timestamptz updated_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        numeric unit_price
    }

    AUTH_USERS ||--|| USERS : "1:1 (auth拡張)"
    USERS ||--o{ ORDERS : "1人の買い手が複数発注"
    ORDERS ||--|{ ORDER_ITEMS : "1発注に複数明細"
    PRODUCTS ||--o{ ORDER_ITEMS : "1商品が複数明細に含まれる"
```

---

## テーブル説明

### auth.users（Supabase Auth 管理）
Supabase が自動で管理する認証ユーザーテーブル。直接操作はしない。

### public.users（プロファイル）
- `auth.users` の `id` を PK かつ FK として参照
- `role` が `'admin'` = 酒屋管理者、`'buyer'` = 飲食店
- RLS でロールごとにアクセス範囲を制御

### public.products（ワイン商品）
- 酒屋（admin）が登録・編集・削除
- `is_active = true` の商品のみ飲食店（buyer）から参照可能
- `updated_at` はトリガーで自動更新

### public.orders（発注ヘッダ）
- 飲食店（buyer）が作成。1回の発注につき1レコード
- `status` の遷移: `pending` → `confirmed` → `shipped` → `delivered`
- `updated_at` はトリガーで自動更新

### public.order_items（発注明細）
- `orders` に紐づく明細行
- `unit_price` は発注時の単価スナップショット（後から商品価格が変わっても保持）

---

## ステータス遷移図（orders.status）

```
pending（発注済み）
    ↓  admin が確認
confirmed（確認済み）
    ↓  admin が出荷
shipped（出荷済み）
    ↓  配達完了
delivered（配達済み）
```
