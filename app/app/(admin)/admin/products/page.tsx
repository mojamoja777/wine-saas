// app/(admin)/admin/products/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminProductList } from "@/components/admin/AdminProductList";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Link href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6B1A35] text-white text-sm font-medium rounded-xl hover:bg-[#9B2D50] transition-colors">
          <Plus className="w-4 h-4" />新規登録
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          商品の取得に失敗しました。
        </div>
      )}

      <AdminProductList products={products ?? []} />
    </div>
  );
}
