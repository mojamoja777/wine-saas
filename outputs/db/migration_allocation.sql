-- ============================================================
-- Mise 割り当て機能 マイグレーション
-- 作成日: 2026-04-12
-- 目的:
--   - products に割り当て対象フラグと受付締切を追加
--   - orders に allocation_pending ステータスを追加
--   - orders に割り当て決定日時・決定者を記録
--   - order_items に allocated_quantity を追加
-- 前提: migration.sql 系列が全て実行されていること
-- ============================================================


-- ============================================================
-- 1. products に割り当てフィールドを追加
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_allocation       boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allocation_deadline timestamptz;

COMMENT ON COLUMN public.products.is_allocation       IS
  'true=希少ワインなど割り当て方式の商品。受付期間後にオーナーが手動で按分する';
COMMENT ON COLUMN public.products.allocation_deadline IS
  '割り当ての受付締切日時。is_allocation=true の場合は必須';

-- 整合性制約：is_allocation=true なら allocation_deadline は必須
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_allocation_deadline_required;

ALTER TABLE public.products
  ADD CONSTRAINT products_allocation_deadline_required
  CHECK (
    (is_allocation = false)
    OR (is_allocation = true AND allocation_deadline IS NOT NULL)
  );

-- 期限切れチェックに使うインデックス
CREATE INDEX IF NOT EXISTS idx_products_allocation_deadline
  ON public.products (allocation_deadline)
  WHERE is_allocation = true;


-- ============================================================
-- 2. orders.status に allocation_pending を追加
-- ============================================================

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'allocation_pending'));

COMMENT ON COLUMN public.orders.status IS
  'pending=受付中 / confirmed=受付完了 / cancelled=キャンセル / allocation_pending=割り当て待ち';


-- ============================================================
-- 3. orders に割り当て決定メタデータを追加
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS allocation_decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS allocation_decided_by uuid REFERENCES public.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.orders.allocation_decided_at IS
  '割り当てが決定された日時。通常注文では NULL';
COMMENT ON COLUMN public.orders.allocation_decided_by IS
  '割り当てを決定した admin の users.id';


-- ============================================================
-- 4. order_items に allocated_quantity を追加
-- ============================================================

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS allocated_quantity int
  CHECK (allocated_quantity IS NULL OR allocated_quantity >= 0);

COMMENT ON COLUMN public.order_items.allocated_quantity IS
  '割り当て後の確定数量。通常商品は注文時に quantity と同値を自動設定、割り当て商品は決定後にセット';

-- 既存の明細は全て通常商品扱い → allocated_quantity = quantity で初期化
UPDATE public.order_items
SET allocated_quantity = quantity
WHERE allocated_quantity IS NULL;

-- 請求書生成で使うインデックス
CREATE INDEX IF NOT EXISTS idx_order_items_allocated_quantity
  ON public.order_items (allocated_quantity)
  WHERE allocated_quantity IS NOT NULL;


-- ============================================================
-- 完了確認
-- ============================================================
-- 以下のクエリで確認できる：
--   SELECT id, name, is_allocation, allocation_deadline FROM public.products;
--   SELECT id, status, allocation_decided_at FROM public.orders;
--   SELECT id, quantity, allocated_quantity FROM public.order_items LIMIT 5;
-- ============================================================
