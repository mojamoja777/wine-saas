"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { AddToCartButton } from "@/components/buyer/AddToCartButton";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  country?: string | null;
  comment?: string | null;
  accept_days?: number | null;
};

export function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.producer ?? "").toLowerCase().includes(q) ||
        (p.region ?? "").toLowerCase().includes(q) ||
        (p.country ?? "").toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="px-4 py-4">
      {/* 検索バー */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ワインを検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35] bg-white"
        />
      </div>

      {/* 商品一覧 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">🍷</span>
          <p className="text-sm">{query ? "該当する商品が見つかりません" : "商品がありません"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-gray-50"
              onClick={() => setSelected(product)}
            >
              {/* 画像 */}
              <div className="w-12 h-12 rounded-xl bg-[#FDF4F6] flex items-center justify-center shrink-0 overflow-hidden">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🍷</span>
                )}
              </div>

              {/* 商品情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  {product.accept_days && (
                    <span className="shrink-0 text-xs bg-[#FDF4F6] text-[#6B1A35] px-2 py-0.5 rounded-full">受付中</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.vintage && <span className="text-xs text-gray-400">{product.vintage}年</span>}
                  <span className="text-sm font-bold text-[#3B0A1E]">¥{product.price.toLocaleString()}</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* 詳細モーダル */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                {selected.vintage && <p className="text-sm text-gray-500">{selected.vintage}年</p>}
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 画像 */}
            <div className="w-full h-40 rounded-2xl bg-[#FDF4F6] flex items-center justify-center mb-4 overflow-hidden">
              {selected.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image_url} alt={selected.name} className="h-full object-contain" />
              ) : (
                <span className="text-6xl">🍷</span>
              )}
            </div>

            {/* 詳細情報 */}
            <div className="space-y-2 mb-4">
              {(selected.country || selected.region) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">産地</span>
                  <span className="text-gray-900">{[selected.country, selected.region].filter(Boolean).join(" / ")}</span>
                </div>
              )}
              {selected.producer && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">生産者</span>
                  <span className="text-gray-900">{selected.producer}</span>
                </div>
              )}
              {selected.grape_variety && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">品種</span>
                  <span className="text-gray-900">{selected.grape_variety}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">在庫</span>
                <span className="text-gray-900">{selected.stock}本</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">価格（税抜）</span>
                <span className="text-lg font-bold text-[#3B0A1E]">¥{selected.price.toLocaleString()}</span>
              </div>
            </div>

            {/* リクエスト受付期間 */}
            {selected.accept_days && (
              <div className="bg-[#FDF4F6] rounded-xl p-3 mb-4">
                <p className="text-xs text-[#6B1A35] font-medium">📋 リクエスト受付期間あり（{selected.accept_days}日間）</p>
                <p className="text-xs text-[#6B1A35] mt-0.5">在庫を超えてもご注文いただけます。期間終了後に割り当てを決定します。</p>
              </div>
            )}

            {/* コメント */}
            {selected.comment && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 font-medium mb-1">酒屋からのコメント</p>
                <p className="text-sm text-gray-700">{selected.comment}</p>
              </div>
            )}

            {/* カートボタン */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-lg font-bold text-[#3B0A1E]">¥{selected.price.toLocaleString()}</span>
              <AddToCartButton product={{ id: selected.id, name: selected.name, price: selected.price }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
