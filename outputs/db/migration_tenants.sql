-- ============================================================
-- Mise マルチテナント化 段階1 マイグレーション
-- 作成日: 2026-04-12
-- 目的:
--   - tenants テーブルを追加し、酒屋情報を一元管理する
--   - users.tenant_id を追加し、ユーザーが所属する酒屋を明示する
--   - 今回は users のみ tenant_id を持ち、products/orders/invoices は
--     段階2 で対応する（users 経由で tenant を辿る想定）
-- 前提: migration.sql / migration_invoices.sql / migration_status_cleanup.sql
--       が先に実行されていること
-- ============================================================


-- ============================================================
-- 1. tenants テーブル作成
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tenants (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 基本情報
  company_name       text        NOT NULL,
  display_name       text        NOT NULL,
  -- 連絡先
  postal_code        text,
  address            text,
  phone              text,
  fax                text,
  email              text,
  website_url        text,
  -- 経理情報
  invoice_number     text,
  bank_info          text,
  representative     text,
  -- ブランディング（段階1 では未使用）
  logo_url           text,
  primary_color      text,
  -- 運用設定
  payment_terms_days int         NOT NULL DEFAULT 30 CHECK (payment_terms_days >= 0),
  created_at         timestamptz NOT NULL DEFAULT NOW(),
  updated_at         timestamptz NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.tenants                    IS '酒屋（テナント）情報。将来のマルチテナント化に備える';
COMMENT ON COLUMN public.tenants.company_name       IS '正式社名（例: 株式会社ヤマダ酒店）';
COMMENT ON COLUMN public.tenants.display_name       IS '屋号・ブランド名（請求書ヘッダなどで使用）';
COMMENT ON COLUMN public.tenants.invoice_number     IS '適格請求書発行事業者番号（T + 13桁）';
COMMENT ON COLUMN public.tenants.bank_info          IS '振込先口座情報（複数行テキスト）';
COMMENT ON COLUMN public.tenants.representative    IS '代表者名';
COMMENT ON COLUMN public.tenants.payment_terms_days IS '支払いサイト（締め日から何日後が支払期限か）';

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 2. 初期テナントの登録（既存運用向けのデフォルト1件）
-- ============================================================

INSERT INTO public.tenants (company_name, display_name, payment_terms_days)
VALUES ('未設定', 'Mise', 30)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. users.tenant_id 追加
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE RESTRICT;

-- 既存の全ユーザーを初期テナントに紐付け
UPDATE public.users
SET tenant_id = (SELECT id FROM public.tenants ORDER BY created_at ASC LIMIT 1)
WHERE tenant_id IS NULL;

-- NOT NULL 制約を追加
ALTER TABLE public.users
  ALTER COLUMN tenant_id SET NOT NULL;

-- 絞り込みに使うインデックス
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users (tenant_id);


-- ============================================================
-- 4. RLS ヘルパー関数（現在ユーザーの tenant_id を返す）
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_user_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.current_user_tenant_id IS '現在の認証ユーザーが所属する tenant の id を返す';


-- ============================================================
-- 5. tenants テーブルの RLS
-- ============================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- admin: 自分の所属するテナントのみ閲覧・更新可能
CREATE POLICY "admin_tenants_select_own" ON public.tenants
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'admin'
    AND id = public.current_user_tenant_id()
  );

CREATE POLICY "admin_tenants_update_own" ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() = 'admin'
    AND id = public.current_user_tenant_id()
  );

-- buyer: 自分の所属するテナントのみ閲覧可能（請求書PDFの発行元を引くため）
CREATE POLICY "buyer_tenants_select_own" ON public.tenants
  FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'buyer'
    AND id = public.current_user_tenant_id()
  );


-- ============================================================
-- 完了確認
-- ============================================================
-- 以下のクエリで結果を確認できる：
--   SELECT id, company_name, display_name FROM public.tenants;
--   SELECT id, role, company_name, tenant_id FROM public.users;
-- ============================================================
