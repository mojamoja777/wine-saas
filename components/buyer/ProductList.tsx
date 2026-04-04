"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { AddToCartButton } from "@/components/buyer/AddToCartButton";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  country?: string | null;
  comment?: string | null;
  accept_days?: number | null;
};

export function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">🍷</span>
          <p className="text-sm">{query ? "該当する商品が見つかりません" : "商品がありません"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex gap-3">
                {/* 画像 */}
                <div className="w-16 h-16 rounded-xl bg-[#FDF4F6] flex items-center justify-center shrink-0 overflow-hidden">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍷</span>
                  )}
                </div>

                {/* 商品情報 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{product.name}</p>

                  {/* 産地（国・地域） */}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {[product.country, product.region].filter(Boolean).join(" / ") ||
                      product.region || "　"}
                  </p>

                  {/* 生産者・ヴィンテージ */}
                  <p className="text-xs text-gray-400">
                    {[product.producer, product.vintage ? `${product.vintage}年` : null].filter(Boolean).join(" · ")}
                  </p>

                  {/* 価格・在庫 */}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-base font-bold text-[#3B0A1E]">¥{product.price.toLocaleString()}</p>
                    <span className="text-xs text-gray-400">在庫 {product.stock}本</span>
                  </div>
                </div>

                {/* カートボタン */}
                <div className="flex items-end">
                  <AddToCartButton product={{ id: product.id, name: product.name, price: product.price }} />
                </div>
              </div>

              {/* リクエスト受付期間バッジ */}
              {product.accept_days && (
                <div className="mt-2 px-3 py-1.5 bg-[#FDF4F6] rounded-lg">
                  <p className="text-xs text-[#6B1A35]">📋 リクエスト受付期間あり（{product.accept_days}日間）— 在庫を超えてもご注文いただけます</p>
                </div>
              )}

              {/* コメント */}
              {product.comment && (
                <div className="mt-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">💬 {product.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
