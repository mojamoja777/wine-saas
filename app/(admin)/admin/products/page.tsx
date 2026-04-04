// app/(admin)/admin/products/page.tsx
// 管理者 - 商品一覧ページ

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6B1A35] text-white text-sm font-medium rounded-xl hover:bg-[#9B2D50] transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規登録
        </Link>
      </div>

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          商品の取得に失敗しました。
        </div>
      )}

      {/* 商品一覧テーブル */}
      {products && products.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  商品名
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  産地 / 品種
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  在庫
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  価格
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  在庫
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                  状態
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    {product.vintage && (
                      <div className="text-xs text-gray-400">{product.vintage}年</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div>{product.region ?? "—"}</div>
                    {product.grape_variety && (
                      <div className="text-xs text-gray-400">{product.grape_variety}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-gray-900">
                    ¥{product.price.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right text-gray-600">
                    {product.stock}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "販売中" : "非表示"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-gray-400 hover:text-[#6B1A35] hover:bg-[#FDF4F6] rounded-lg transition-colors"
                        aria-label="編集"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <DeleteProductButton id={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // 空の状態
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">🍷</span>
          <p className="text-sm">商品がまだ登録されていません</p>
          <Link
            href="/admin/products/new"
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#6B1A35] text-white text-sm font-medium rounded-xl hover:bg-[#9B2D50] transition-colors"
          >
            <Plus className="w-4 h-4" />
            最初の商品を登録する
          </Link>
        </div>
      )}
    </div>
  );
}
