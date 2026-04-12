-- ============================================================
-- テスト用：前月（2026年3月）の注文データを作成
-- 請求書の手動生成ボタンのテストに使用
-- ============================================================
-- 実行後、/admin/invoices で「前月分を手動生成」を押すと
-- このデータを元に請求書が作成されます
-- ============================================================

-- 既存の buyer と product をランダムに使ってテスト注文を作成
DO $$
DECLARE
  v_buyer_id uuid;
  v_order_id uuid;
  v_product_ids uuid[];
BEGIN
  -- 最初の buyer ユーザーを取得
  SELECT id INTO v_buyer_id
  FROM public.users
  WHERE role = 'buyer'
  LIMIT 1;

  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'buyer ユーザーが存在しません。先に buyer アカウントを作成してください';
  END IF;

  -- 商品IDを最大3件取得
  SELECT ARRAY(SELECT id FROM public.products LIMIT 3) INTO v_product_ids;

  IF array_length(v_product_ids, 1) IS NULL THEN
    RAISE EXCEPTION '商品が1件も存在しません。先に商品を登録してください';
  END IF;

  -- ========================
  -- テスト注文 1件目（3月5日）
  -- ========================
  INSERT INTO public.orders (buyer_id, status, ordered_at, note)
  VALUES (v_buyer_id, 'confirmed', '2026-03-05 10:00:00+09', 'テスト注文 #1')
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
  SELECT v_order_id, id, 2, price FROM public.products WHERE id = v_product_ids[1];

  IF array_length(v_product_ids, 1) >= 2 THEN
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    SELECT v_order_id, id, 1, price FROM public.products WHERE id = v_product_ids[2];
  END IF;

  -- ========================
  -- テスト注文 2件目（3月15日）
  -- ========================
  INSERT INTO public.orders (buyer_id, status, ordered_at, note)
  VALUES (v_buyer_id, 'pending', '2026-03-15 14:30:00+09', 'テスト注文 #2')
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
  SELECT v_order_id, id, 3, price FROM public.products WHERE id = v_product_ids[1];

  -- ========================
  -- テスト注文 3件目（3月28日・月末近く）
  -- ========================
  INSERT INTO public.orders (buyer_id, status, ordered_at, note)
  VALUES (v_buyer_id, 'confirmed', '2026-03-28 18:00:00+09', 'テスト注文 #3')
  RETURNING id INTO v_order_id;

  IF array_length(v_product_ids, 1) >= 3 THEN
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    SELECT v_order_id, id, 6, price FROM public.products WHERE id = v_product_ids[3];
  ELSE
    INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
    SELECT v_order_id, id, 6, price FROM public.products WHERE id = v_product_ids[1];
  END IF;

  RAISE NOTICE 'テスト注文を3件作成しました。buyer_id=%', v_buyer_id;
END $$;
