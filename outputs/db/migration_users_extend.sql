-- ============================================================
-- Mise users テーブル拡張 マイグレーション
-- 作成日: 2026-04-12
-- 目的:
--   - buyer（飲食店）向けの情報を users テーブルに追加
--   - customer_code: 酒屋が手動で割り振る管理番号（tenant内で一意）
--   - postal_code / address / phone: 宛名欄の動的化用
-- 前提: migration.sql / migration_invoices.sql / migration_status_cleanup.sql
--       / migration_tenants.sql が先に実行されていること
-- ============================================================


-- ============================================================
-- 1. カラム追加（全て NULL 許容）
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS customer_code text,
  ADD COLUMN IF NOT EXISTS postal_code   text,
  ADD COLUMN IF NOT EXISTS address       text,
  ADD COLUMN IF NOT EXISTS phone         text;

COMMENT ON COLUMN public.users.customer_code IS '酒屋が飲食店ごとに手動で割り振る管理番号（例: C-0012）';
COMMENT ON COLUMN public.users.postal_code   IS '郵便番号（請求書宛名欄に表示）';
COMMENT ON COLUMN public.users.address       IS '住所（請求書宛名欄に表示）';
COMMENT ON COLUMN public.users.phone         IS '電話番号（請求書宛名欄に表示）';


-- ============================================================
-- 2. customer_code のユニーク制約（tenant 内で一意）
-- ============================================================
-- NULL は複数許容される（部分インデックス扱い）
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_customer_code
  ON public.users (tenant_id, customer_code)
  WHERE customer_code IS NOT NULL;


-- ============================================================
-- 完了確認
-- ============================================================
-- 以下のクエリで結果を確認できる：
--   SELECT id, role, company_name, tenant_id, customer_code, address, phone
--   FROM public.users;
-- ============================================================
