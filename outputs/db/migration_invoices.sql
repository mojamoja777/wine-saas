-- ============================================================
-- Mise 請求書機能 マイグレーションSQL
-- 作成日: 2026-04-12
-- 対象: Supabase (PostgreSQL)
-- 前提: migration.sql が先に実行されていること
-- ============================================================


-- ============================================================
-- 1. invoices テーブル（請求書ヘッダ）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 請求先の飲食店（users.id）
  buyer_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  -- 対象期間（月初〜月末）
  period_start date        NOT NULL,
  period_end   date        NOT NULL,
  -- 合計金額（編集時に再計算）
  total_amount numeric     NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  -- 備考（自由記述）
  note         text,
  -- ステータス：issued=発行済み / paid=支払済み（将来用）
  status       text        NOT NULL DEFAULT 'issued'
                 CHECK (status IN ('issued', 'paid')),
  -- 発行日時（Cron実行時刻）
  issued_at    timestamptz NOT NULL DEFAULT NOW(),
  -- 最終更新日時（編集で自動更新・PDFに表示して監査性を担保）
  updated_at   timestamptz NOT NULL DEFAULT NOW(),
  -- 同一buyerに同じ期間の請求書が重複しないよう制約
  UNIQUE (buyer_id, period_start, period_end)
);

COMMENT ON TABLE  public.invoices              IS '請求書ヘッダ。月次でCronが自動生成し、admin が編集可能';
COMMENT ON COLUMN public.invoices.period_start IS '対象期間の開始日（対象月の1日）';
COMMENT ON COLUMN public.invoices.period_end   IS '対象期間の終了日（対象月の末日）';
COMMENT ON COLUMN public.invoices.total_amount IS '明細の小計合計（編集時に再計算）';
COMMENT ON COLUMN public.invoices.status       IS 'issued=発行済み, paid=支払済み（将来用）';
COMMENT ON COLUMN public.invoices.updated_at   IS '最終更新日時。発行後に編集されると自動で更新される';

CREATE INDEX IF NOT EXISTS idx_invoices_buyer_id ON public.invoices (buyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON public.invoices (period_start, period_end);

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 2. invoice_items テーブル（請求書明細・スナップショット）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid    NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  -- 元注文への参照（監査用・NULL許容）
  order_id     uuid    REFERENCES public.orders(id) ON DELETE SET NULL,
  -- 商品情報はスナップショット（生成時点の値を固定）
  product_name text    NOT NULL,
  producer     text,
  region       text,
  vintage      int,
  -- 編集可能な項目
  quantity     int     NOT NULL CHECK (quantity > 0),
  unit_price   numeric NOT NULL CHECK (unit_price >= 0),
  -- 表示順序の制御用
  sort_order   int     NOT NULL DEFAULT 0
);

COMMENT ON TABLE  public.invoice_items              IS '請求書の明細行。生成時点の商品情報をスナップショットとして保持';
COMMENT ON COLUMN public.invoice_items.order_id    IS '元注文の orders.id（監査用）。注文が削除されても請求書は残る';
COMMENT ON COLUMN public.invoice_items.product_name IS '商品名のスナップショット（後から products.name が変わっても保持）';
COMMENT ON COLUMN public.invoice_items.quantity     IS '数量（admin が編集可能）';
COMMENT ON COLUMN public.invoice_items.unit_price   IS '単価（admin が編集可能）';

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items (invoice_id);


-- ============================================================
-- 3. RLS（行レベルセキュリティ）
-- ============================================================
-- 請求書は admin のみが閲覧・操作可能（buyer からは非公開）
-- ============================================================

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- admin: invoices 全CRUD
CREATE POLICY "admin_invoices_all" ON public.invoices
  FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- admin: invoice_items 全CRUD
CREATE POLICY "admin_invoice_items_all" ON public.invoice_items
  FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');


-- ============================================================
-- 完了メッセージ
-- ============================================================
-- このSQL実行後に Supabase ダッシュボードで以下を確認：
--   1. Table Editor で invoices, invoice_items が追加されている
--   2. Authentication → Policies で admin_invoices_all, admin_invoice_items_all が設定されている
-- ============================================================
