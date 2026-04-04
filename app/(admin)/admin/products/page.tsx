// app/(admin)/admin/products/page.tsx
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("stock", { ascending: true })
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

      {products && products.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">商品名</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">産地 / 品種</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">価格</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">在庫</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">状態</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const outOfStock = product.stock <= 0;
                return (
                  <tr key={product.id} className={`transition-colors ${outOfStock ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{product.name}</span>
                        {outOfStock && (
                          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">在庫なし</span>
                        )}
                      </div>
                      {product.vintage && <div className="text-xs text-gray-400">{product.vintage}年</div>}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <div>{[(product as any).country, product.region].filter(Boolean).join(" / ") || "—"}</div>
                      {product.grape_variety && <div className="text-xs text-gray-400">{product.grape_variety}</div>}
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-gray-900">¥{product.price.toLocaleString()}</td>
                    <td className={`px-5 py-4 text-right font-medium ${outOfStock ? "text-red-500" : "text-gray-900"}`}>
                      {product.stock}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {product.is_active ? "販売中" : "非表示"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-[#6B1A35] hover:bg-[#FDF4F6] rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton id={product.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">🍷</span>
          <p className="text-sm">商品がまだ登録されていません</p>
          <Link href="/admin/products/new"
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#6B1A35] text-white text-sm font-medium rounded-xl hover:bg-[#9B2D50] transition-colors">
            <Plus className="w-4 h-4" />最初の商品を登録する
          </Link>
        </div>
      )}
    </div>
  );
}
