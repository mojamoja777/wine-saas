"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CartItem = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
};

export async function createOrder(items: CartItem[], note: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。", orderId: null };

  if (!items.length) return { error: "カートが空です。", orderId: null };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ buyer_id: user.id, note: note || null })
    .select("id")
    .single();

  if (orderError || !order) return { error: "発注の作成に失敗しました。", orderId: null };

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) return { error: "発注明細の登録に失敗しました。", orderId: null };

  return { error: null, orderId: order.id };
}

export async function cancelOrderByBuyer(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  // 自分の注文かつpendingのみキャンセル可能
  const { data: order } = await supabase
    .from("orders")
    .select("status, buyer_id")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "発注が見つかりません。" };
  if (order.buyer_id !== user.id) return { error: "この発注をキャンセルする権限がありません。" };
  if (order.status !== "pending") return { error: "受付中の発注のみキャンセルできます。" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) return { error: "キャンセルに失敗しました。" };

  revalidatePath("/buyer/orders");
  revalidatePath("/buyer/orders/" + orderId);
}
