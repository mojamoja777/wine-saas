// app/(admin)/admin/settings/actions.ts
// tenant 情報を更新するサーバーアクション

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type TenantUpdate = Database["public"]["Tables"]["tenants"]["Update"];

export async function updateTenantAction(
  tenantId: string,
  input: TenantUpdate
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  // admin 権限の確認
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "未認証です" };

  const { data: profile } = await supabase
    .from("users")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false, error: "管理者権限が必要です" };
  }
  if (profile.tenant_id !== tenantId) {
    return { ok: false, error: "他のテナントは編集できません" };
  }

  // 空文字は NULL に正規化
  const normalize = (v: string | null | undefined) =>
    v === undefined ? undefined : v === "" ? null : v;

  const { error } = await supabase
    .from("tenants")
    .update({
      company_name: input.company_name,
      display_name: input.display_name,
      postal_code: normalize(input.postal_code),
      address: normalize(input.address),
      phone: normalize(input.phone),
      fax: normalize(input.fax),
      email: normalize(input.email),
      website_url: normalize(input.website_url),
      invoice_number: normalize(input.invoice_number),
      bank_info: normalize(input.bank_info),
      representative: normalize(input.representative),
      payment_terms_days: input.payment_terms_days,
    })
    .eq("id", tenantId);

  if (error) {
    return { ok: false, error: `更新に失敗しました: ${error.message}` };
  }

  revalidatePath("/admin/settings");
  return { ok: true };
}
