"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AllocationDecision = {
  orderItemId: string;
  allocatedQuantity: number;
};

type ConfirmResult = { error: string | null };

/**
 * 商品ごとの割り当てを一括確定する。
 * - 各 order_items.allocated_quantity を更新
 * - 影響を受けた order について、全 item の allocated_quantity が確定したら
 *   status を 'confirmed' に遷移し allocation_decided_at/by をセット
 */
export async function confirmAllocations(
  productId: string,
  decisions: AllocationDecision[]
): Promise<ConfirmResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") return { error: "管理者権限が必要です。" };

  if (decisions.length === 0) return { error: "更新対象がありません。" };

  // 対象 order_items を取得（指定商品 & 親注文が allocation_pending のものに限定）
  const orderItemIds = decisions.map((d) => d.orderItemId);
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, order_id, product_id, quantity, orders!inner(status)")
    .in("id", orderItemIds);

  if (itemsError || !items) {
    return { error: "明細の取得に失敗しました。" };
  }

  // バリデーション: 指定商品で、親注文が allocation_pending、要求本数以下
  for (const d of decisions) {
    const item = items.find((i) => i.id === d.orderItemId);
    if (!item) return { error: "対象の明細が見つかりません。" };
    if (item.product_id !== productId) {
      return { error: "対象商品と一致しない明細が含まれています。" };
    }
    const order = item.orders as unknown as { status: string } | null;
    if (order?.status !== "allocation_pending") {
      return { error: "確定済みの注文が含まれています。" };
    }
    if (!Number.isInteger(d.allocatedQuantity) || d.allocatedQuantity < 0) {
      return { error: "配分本数は0以上の整数で入力してください。" };
    }
    if (d.allocatedQuantity > item.quantity) {
      return { error: "希望本数を超える配分はできません。" };
    }
  }

  // 各 order_item を更新（並列）
  const updateResults = await Promise.all(
    decisions.map((d) =>
      supabase
        .from("order_items")
        .update({ allocated_quantity: d.allocatedQuantity })
        .eq("id", d.orderItemId)
    )
  );
  for (const r of updateResults) {
    if (r.error) return { error: "明細の更新に失敗しました。" };
  }

  // 影響注文ごとに、全明細が確定済みかチェックして status を遷移
  const affectedOrderIds = Array.from(new Set(items.map((i) => i.order_id)));
  const { data: allItems, error: allItemsError } = await supabase
    .from("order_items")
    .select("order_id, allocated_quantity")
    .in("order_id", affectedOrderIds);

  if (allItemsError || !allItems) {
    return { error: "注文ステータスの更新確認に失敗しました。" };
  }

  const fullyAllocatedOrderIds = affectedOrderIds.filter((orderId) => {
    const rows = allItems.filter((i) => i.order_id === orderId);
    return rows.length > 0 && rows.every((i) => i.allocated_quantity !== null);
  });

  if (fullyAllocatedOrderIds.length > 0) {
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        allocation_decided_at: new Date().toISOString(),
        allocation_decided_by: user.id,
      })
      .in("id", fullyAllocatedOrderIds);
    if (orderUpdateError) {
      return { error: "注文ステータスの更新に失敗しました。" };
    }
  }

  revalidatePath("/admin/allocations");
  revalidatePath(`/admin/allocations/${productId}`);
  revalidatePath("/admin");
  for (const orderId of affectedOrderIds) {
    revalidatePath(`/admin/orders/${orderId}`);
  }

  return { error: null };
}
