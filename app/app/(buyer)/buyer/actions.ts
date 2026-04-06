// app/(buyer)/buyer/actions.ts
// 発注 Server Action

"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/cart-context";

type CreateOrderResult =
  | { orderId: string; error?: never }
  | { error: string; orderId?: never };

/**
 * カートの内容で発注を確定する
 * @returns 成功時は orderId、失敗時は error
 */
export async function createOrder(
  items: CartItem[],
  note: string
): Promise<CreateOrderResult> {
  if (items.length === 0) {
    return { error: "カートが空です。" };
  }

  const supabase = await createClient();

  // 現在のユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  // 発注ヘッダを作成
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      status: "pending",
      note: note || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message || "発注失敗" };
  }

  // 発注明細を一括挿入
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    // ヘッダだけ作成されてしまった場合はロールバック代わりに削除
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "発注明細の登録に失敗しました。" };
  }
// 在庫を減算
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.productId)
      .single();
    if (product) {
      await supabase
        .from("products")
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq("id", item.productId);
    }
  }
  return { orderId: order.id };
}
