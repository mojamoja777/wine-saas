"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function advanceOrderStatus(orderId: string, currentStatus: string) {
  if (currentStatus !== "pending") return { error: "承認できるのは受付中の発注のみです。" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") return { error: "管理者権限が必要です。" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "confirmed" })
    .eq("id", orderId);

  if (error) return { error: "ステータスの更新に失敗しました。" };

  revalidatePath("/admin");
  revalidatePath("/admin/orders/" + orderId);
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") return { error: "管理者権限が必要です。" };

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) return { error: "キャンセルに失敗しました。" };

  revalidatePath("/admin");
  revalidatePath("/admin/orders/" + orderId);
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") return { error: "管理者権限が必要です。" };

  // order_itemsを先に削除（外部キー制約）
  const { error: itemsError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (itemsError) return { error: "発注明細の削除に失敗しました。" };

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId);

  if (error) return { error: "発注の削除に失敗しました。" };

  revalidatePath("/admin");
}
