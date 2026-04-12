// app/(admin)/admin/buyers/[id]/edit/page.tsx
// 管理者 - 飲食店（buyer）の編集

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { BuyerForm } from "@/components/admin/BuyerForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBuyerPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: buyer, error } = await supabase
    .from("users")
    .select(
      "id, role, company_name, customer_code, postal_code, address, phone, is_active"
    )
    .eq("id", id)
    .eq("role", "buyer")
    .single();

  if (error || !buyer) notFound();

  // メールアドレスは Supabase Auth から取得する
  const serviceClient = createServiceClient();
  const { data: authUser } = await serviceClient.auth.admin.getUserById(id);
  const email = authUser?.user?.email ?? "";

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/admin/buyers"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        顧客一覧に戻る
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顧客情報の編集</h1>
          <p className="text-sm text-gray-500 mt-1">{buyer.company_name}</p>
        </div>
        {!buyer.is_active && (
          <span className="inline-block text-xs text-gray-500 bg-gray-200 rounded-full px-3 py-1">
            無効化済み
          </span>
        )}
      </div>

      <BuyerForm
        mode="edit"
        initial={{
          id: buyer.id,
          email,
          company_name: buyer.company_name,
          customer_code: buyer.customer_code,
          postal_code: buyer.postal_code,
          address: buyer.address,
          phone: buyer.phone,
          is_active: buyer.is_active,
        }}
      />
    </div>
  );
}
