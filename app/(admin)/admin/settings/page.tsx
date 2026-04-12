// app/(admin)/admin/settings/page.tsx
// 管理者 - テナント設定（酒屋情報の編集）

import { createClient } from "@/lib/supabase/server";
import { TenantSettingsForm } from "@/components/admin/TenantSettingsForm";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // 現在のユーザーの tenant を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">未認証です</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">
          テナントに紐付けられていません。管理者に連絡してください。
        </p>
      </div>
    );
  }

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", profile.tenant_id)
    .single();

  if (error || !tenant) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">
          テナント情報の取得に失敗しました。
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-1">
          請求書・伝票に記載される酒屋情報を編集します
        </p>
      </div>

      <TenantSettingsForm tenant={tenant} />
    </div>
  );
}
