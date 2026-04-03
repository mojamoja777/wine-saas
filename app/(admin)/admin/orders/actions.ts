// app/(admin)/admin/orders/actions.ts
// 発注ステータス更新 Server Action

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

// ステータス遷移ルール：次のステータスを返す
export const NEXT_STATUS: Record<string, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "shipped",
  shipped: "delivered",
  delivered: null,
};

export const NEXT_LABEL: Record<string, string> = {
  pending: "準備中に変更",
  confirmed: "発送済に変更",
  shipped: "配達済に変更",
};

/**
 * 発注ステータスを次のステップへ進める
 */
export async function advanceOrderStatus(orderId: string, currentStatus: string) {
  const nextStatus = NEXT_STATUS[currentStatus];
  if (!nextStatus) return { error: "これ以上ステータスを変更できません。" };

  const supabase = await createClient();

  // 認証・ロール確認
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "管理者権限が必要です。" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId);

  if (error) return { error: "ステータスの更新に失敗しました。" };

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}
