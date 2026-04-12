-- ============================================================
-- Mise users.is_active 追加 マイグレーション
-- 作成日: 2026-04-12
-- 目的:
--   - 無効化された buyer を管理画面で扱うための is_active フラグを追加
--   - 既存ユーザーは全て有効（true）で初期化
-- 前提: migration_users_extend.sql が先に実行されていること
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.users.is_active IS
  'false にすると buyer は無効化され、管理画面では「無効」表示。Supabase Auth 側でも ban する運用';

CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users (is_active);
