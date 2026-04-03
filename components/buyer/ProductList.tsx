"use client";

// components/buyer/ProductList.tsx
// 商品一覧（検索・カート追加機能付き）

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { AddToCartButton } from "@/components/buyer/AddToCartButton";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

export function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.producer ?? "").toLowerCase().includes(q) ||
        (p.region ?? "").toLowerCase().includes(q)
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

      {/* 商品リスト */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">🍷</span>
          <p className="text-sm">
            {query ? "該当する商品が見つかりません" : "商品がありません"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3"
            >
              {/* 商品画像 */}
              <div className="w-16 h-16 rounded-xl bg-[#FDF4F6] flex items-center justify-center shrink-0 overflow-hidden">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🍷</span>
                )}
              </div>

              {/* 商品情報 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {[product.producer, product.region]
                    .filter(Boolean)
                    .join(" / ") || "　"}
                </p>
                {product.vintage && (
                  <p className="text-xs text-gray-400">{product.vintage}年</p>
                )}
                <p className="text-base font-bold text-[#3B0A1E] mt-1">
                  ¥{product.price.toLocaleString()}
                </p>
              </div>

              {/* カートボタン */}
              <div className="flex items-end">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
