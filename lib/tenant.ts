// lib/tenant.ts
// 現在のユーザーが所属するテナント（酒屋）情報を取得するヘルパー

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];

/**
 * 指定した buyer の所属する tenant を取得する
 * 請求書PDF生成など、特定 buyer の酒屋情報を引く場合に使う
 */
export async function getTenantByBuyerId(
  supabase: SupabaseClient<Database>,
  buyerId: string
): Promise<Tenant | null> {
  const { data: user } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", buyerId)
    .single();
  if (!user?.tenant_id) return null;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", user.tenant_id)
    .single();
  return tenant;
}

/**
 * tenant id から tenant を取得する
 */
export async function getTenantById(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<Tenant | null> {
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();
  return data;
}
