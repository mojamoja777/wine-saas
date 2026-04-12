-- ============================================================
-- Mise ステータス簡略化 マイグレーション
-- 作成日: 2026-04-12
-- 目的: orders.status から shipped / delivered を削除し、
--       pending / confirmed / cancelled の3値に整理する
-- 前提: migration.sql が先に実行されていること
-- ============================================================

-- 既存の shipped / delivered を confirmed に移行
UPDATE public.orders
SET status = 'confirmed'
WHERE status IN ('shipped', 'delivered');

-- CHECK 制約を更新
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled'));

-- COMMENT を更新
COMMENT ON COLUMN public.orders.status IS
  'pending=受付中 / confirmed=受付完了 / cancelled=キャンセル';

-- ============================================================
-- 完了確認
-- ============================================================
-- 以下のクエリで整理結果を確認できる：
--   SELECT status, COUNT(*) FROM public.orders GROUP BY status;
-- ============================================================
