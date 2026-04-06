-- ============================================================
-- ワイン発注管理SaaS MVP マイグレーションSQL
-- 作成日: 2026-04-02
-- 対象: Supabase (PostgreSQL)
-- 実行順序: このファイルを上から順に実行する
-- ============================================================


-- ============================================================
-- 0. 準備：updated_at 自動更新用トリガー関数
-- ============================================================

-- updated_at を現在時刻に更新する汎用トリガー関数
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. users テーブル（Supabase Auth の拡張プロファイル）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  -- auth.users の id を PK かつ FK として参照（1:1）
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ロール: 'admin'（酒屋）または 'buyer'（飲食店）
  role        text        NOT NULL CHECK (role IN ('admin', 'buyer')),
  -- 店舗名・会社名
  company_name text       NOT NULL,
  -- 作成日時（自動設定）
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.users              IS 'Supabase Auth ユーザーの拡張プロファイル';
COMMENT ON COLUMN public.users.id           IS 'auth.users と 1:1 で紐づく UUID';
COMMENT ON COLUMN public.users.role         IS 'admin=酒屋管理者, buyer=飲食店';
COMMENT ON COLUMN public.users.company_name IS '店舗名または会社名';

-- ロールによる絞り込みに使うインデックス
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);


-- ============================================================
-- 2. products テーブル（ワイン商品マスタ）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ワイン名（必須）
  name          text        NOT NULL,
  -- ヴィンテージ年（NULL 許容：ノンヴィンテージワインに対応）
  vintage       int,
  -- 生産者名
  producer      text,
  -- 産地（例: ブルゴーニュ、ボルドー）
  region        text,
  -- 品種（例: ピノ・ノワール）
  grape_variety text,
  -- 税抜単価
  price         numeric     NOT NULL CHECK (price >= 0),
  -- 在庫数
  stock         int         NOT NULL DEFAULT 0 CHECK (stock >= 0),
  -- 商品画像の URL（Supabase Storage の公開 URL を想定）
  image_url     text,
  -- 飲食店向け表示フラグ（false = 非表示）
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.products              IS 'admin が管理するワイン商品マスタ';
COMMENT ON COLUMN public.products.vintage      IS 'ヴィンテージ年。ノンヴィンテージは NULL';
COMMENT ON COLUMN public.products.price        IS '税抜単価';
COMMENT ON COLUMN public.products.stock        IS '現在の在庫数';
COMMENT ON COLUMN public.products.is_active    IS 'false にすると buyer から非表示になる';
COMMENT ON COLUMN public.products.updated_at   IS 'トリガーにより自動更新';

-- buyer が is_active=true の商品を取得する際に使うインデックス
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
-- 商品名での検索用インデックス
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);

-- updated_at 自動更新トリガー
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 3. orders テーブル（発注ヘッダ）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 発注者（飲食店）の users.id
  buyer_id   uuid        NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  -- 発注ステータス
  -- pending=発注済み / confirmed=確認済み / shipped=出荷済み / delivered=配達済み
  status     text        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered')),
  -- 発注に関する備考（任意）
  note       text,
  -- 発注日時（自動設定）
  ordered_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.orders            IS '飲食店の1回の発注を表すヘッダテーブル';
COMMENT ON COLUMN public.orders.buyer_id   IS '発注した飲食店の users.id';
COMMENT ON COLUMN public.orders.status     IS 'pending→confirmed→shipped→delivered の順に遷移';
COMMENT ON COLUMN public.orders.updated_at IS 'トリガーにより自動更新';

-- buyer_id での絞り込み（飲食店が自分の発注一覧を取得する際に使用）
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders (buyer_id);
-- ステータスでの絞り込み（admin が処理待ち発注を確認する際に使用）
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- updated_at 自動更新トリガー
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 4. order_items テーブル（発注明細）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  -- どの発注に属するか
  order_id   uuid    NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  -- どの商品か
  product_id uuid    NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  -- 発注数量
  quantity   int     NOT NULL CHECK (quantity > 0),
  -- 発注時点の単価スナップショット（後から products.price が変わっても保持）
  unit_price numeric NOT NULL CHECK (unit_price >= 0)
);

COMMENT ON TABLE  public.order_items            IS '発注ヘッダ（orders）に紐づく明細行';
COMMENT ON COLUMN public.order_items.order_id   IS '親発注の orders.id';
COMMENT ON COLUMN public.order_items.product_id IS '発注した商品の products.id';
COMMENT ON COLUMN public.order_items.quantity   IS '発注数量（1以上）';
COMMENT ON COLUMN public.order_items.unit_price IS '発注確定時の単価スナップショット';

-- order_id での絞り込み（発注明細一覧取得に使用）
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
-- product_id での絞り込み（商品ごとの発注集計に使用）
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);


-- ============================================================
-- 5. RLS（行レベルセキュリティ）設定
-- ============================================================
-- 全テーブルで RLS を有効化する
-- ポリシーは「admin」と「buyer」のロールで分離する
-- ロール判定は auth.jwt() → public.users.role を参照する
-- ============================================================

-- ヘルパー関数：現在のユーザーのロールを取得
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.current_user_role IS '現在の認証ユーザーのロール（admin/buyer）を返す';


-- ----------------------------------------------------------
-- 5-1. users テーブルの RLS
-- ----------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- admin: 全ユーザーを読み取り可能
CREATE POLICY "admin_users_select" ON public.users
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- admin: 全ユーザーを更新可能
CREATE POLICY "admin_users_update" ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- buyer: 自分のレコードのみ読み取り可能
CREATE POLICY "buyer_users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'buyer' AND id = auth.uid());

-- buyer: 自分のレコードのみ更新可能
CREATE POLICY "buyer_users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'buyer' AND id = auth.uid());

-- 新規ユーザー登録時の INSERT（自分のレコードのみ）
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());


-- ----------------------------------------------------------
-- 5-2. products テーブルの RLS
-- ----------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- admin: 全商品を読み取り・作成・更新・削除可能
CREATE POLICY "admin_products_all" ON public.products
  FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- buyer: is_active=true の商品のみ読み取り可能
CREATE POLICY "buyer_products_select_active" ON public.products
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'buyer' AND is_active = true);


-- ----------------------------------------------------------
-- 5-3. orders テーブルの RLS
-- ----------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- admin: 全発注を読み取り可能
CREATE POLICY "admin_orders_select" ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- admin: ステータス更新（UPDATE のみ許可）
CREATE POLICY "admin_orders_update" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- buyer: 自分の発注のみ CRUD
CREATE POLICY "buyer_orders_select_own" ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'buyer' AND buyer_id = auth.uid());

CREATE POLICY "buyer_orders_insert_own" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() = 'buyer' AND buyer_id = auth.uid());

CREATE POLICY "buyer_orders_update_own" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'buyer' AND buyer_id = auth.uid());

CREATE POLICY "buyer_orders_delete_own" ON public.orders
  FOR DELETE
  TO authenticated
  USING (
    public.current_user_role() = 'buyer'
    AND buyer_id = auth.uid()
    -- pending（未確認）の発注のみ削除可能
    AND status = 'pending'
  );


-- ----------------------------------------------------------
-- 5-4. order_items テーブルの RLS
-- ----------------------------------------------------------
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- admin: 全明細を読み取り可能
CREATE POLICY "admin_order_items_select" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- buyer: 自分の発注に紐づく明細のみ CRUD
CREATE POLICY "buyer_order_items_select_own" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'buyer'
    AND order_id IN (
      SELECT id FROM public.orders WHERE buyer_id = auth.uid()
    )
  );

CREATE POLICY "buyer_order_items_insert_own" ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_user_role() = 'buyer'
    AND order_id IN (
      SELECT id FROM public.orders WHERE buyer_id = auth.uid()
    )
  );

CREATE POLICY "buyer_order_items_update_own" ON public.order_items
  FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() = 'buyer'
    AND order_id IN (
      SELECT id FROM public.orders WHERE buyer_id = auth.uid()
    )
  );

CREATE POLICY "buyer_order_items_delete_own" ON public.order_items
  FOR DELETE
  TO authenticated
  USING (
    public.current_user_role() = 'buyer'
    AND order_id IN (
      SELECT id FROM public.orders WHERE buyer_id = auth.uid()
    )
  );


-- ============================================================
-- 完了メッセージ
-- ============================================================
-- このSQL実行後に Supabase ダッシュボードで以下を確認すること：
--   1. Table Editor でテーブルが4つ作成されている
--   2. Authentication → Policies で各テーブルにポリシーが設定されている
--   3. Database → Functions に set_updated_at と current_user_role が存在する
-- ============================================================
