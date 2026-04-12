"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { WINE_TYPES, WINE_COUNTRIES, WINE_REGIONS, SAKE_PREFECTURES, SHOCHU_PREFECTURES } from "@/lib/product-constants";

const CATEGORIES = ["ワイン", "日本酒", "焼酎", "ジン", "ウイスキー", "その他"];

type Product = {
  id: string;
  name: string;
  vintage: number | null;
  producer: string | null;
  region: string | null;
  grape_variety: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: any;
};

export function AdminProductList({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [activeCountry, setActiveCountry] = useState("");
  const [activeRegion, setActiveRegion] = useState("");
  const [activeType, setActiveType] = useState("");

  function toggleCategory(cat: string) {
    setOpenCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setActiveCategory(prev => prev === cat ? "" : cat);
    setActiveCountry("");
    setActiveRegion("");
    setActiveType("");
  }

  const regionList = activeCountry ? (WINE_REGIONS[activeCountry] ?? []) : [];
  const prefList = activeCategory === "日本酒" ? SAKE_PREFECTURES : SHOCHU_PREFECTURES;

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeCountry && p.country !== activeCountry) return false;
      if (activeRegion && p.region !== activeRegion) return false;
      if (activeType && p.type !== activeType) return false;
      return true;
    }).sort((a, b) => {
      const aOut = a.stock <= 0 ? 1 : 0;
      const bOut = b.stock <= 0 ? 1 : 0;
      return aOut - bOut;
    });
  }, [products, activeCategory, activeCountry, activeRegion, activeType]);

  return (
    <div className="flex gap-6">
      {/* サイドバー */}
      <div className="w-44 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">カテゴリ</p>
          </div>
          <button
            onClick={() => { setActiveCategory(""); setOpenCategories([]); setActiveCountry(""); setActiveRegion(""); setActiveType(""); }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${!activeCategory ? "text-[#6B1A35] font-medium bg-[#FDF4F6]" : "text-gray-600 hover:bg-gray-50"}`}>
            すべて
          </button>
          {CATEGORIES.map(cat => {
            const isOpen = openCategories.includes(cat);
            const isActive = activeCategory === cat;
            const hasWineRegions = cat === "ワイン";
            const hasPrefs = cat === "日本酒" || cat === "焼酎";
            return (
              <div key={cat} className="border-t border-gray-100">
                <button onClick={() => toggleCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${isActive ? "text-[#6B1A35] font-medium bg-[#FDF4F6]" : "text-gray-600 hover:bg-gray-50"}`}>
                  {cat}
                  <span className={`text-xs text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                </button>
                {isOpen && hasWineRegions && (
                  <div className="bg-gray-50 pb-1">
                    {WINE_COUNTRIES.map(c => (
                      <div key={c}>
                        <button onClick={() => { setActiveCountry(c === activeCountry ? "" : c); setActiveRegion(""); }}
                          className={`w-full text-left px-5 py-1.5 text-xs transition-colors ${activeCountry === c ? "text-[#6B1A35] font-medium" : "text-gray-500 hover:text-gray-800"}`}>
                          {c}
                        </button>
                        {activeCountry === c && regionList.length > 1 && regionList.map(r => (
                          <button key={r} onClick={() => setActiveRegion(r === activeRegion ? "" : r)}
                            className={`w-full text-left pl-8 pr-3 py-1 text-xs ${activeRegion === r ? "text-[#6B1A35] font-medium" : "text-gray-400 hover:text-gray-700"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {isOpen && hasPrefs && (
                  <div className="bg-gray-50 pb-1">
                    {prefList.map(p => (
                      <button key={p} onClick={() => setActiveRegion(p === activeRegion ? "" : p)}
                        className={`w-full text-left px-5 py-1.5 text-xs ${activeRegion === p ? "text-[#6B1A35] font-medium" : "text-gray-500 hover:text-gray-800"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1">
        {/* タイプフィルター（ワインのみ） */}
        {activeCategory === "ワイン" && (
          <div className="flex gap-2 flex-wrap mb-4">
            {["すべて", ...WINE_TYPES].map(t => (
              <button key={t} onClick={() => setActiveType(t === "すべて" ? "" : t)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${(t === "すべて" && !activeType) || activeType === t ? "bg-[#6B1A35] text-white border-[#6B1A35]" : "border-gray-200 text-gray-600 hover:border-[#6B1A35]"}`}>
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-4xl mb-3">🍶</span>
              <p className="text-sm">該当する商品がありません</p>
            </div>
          ) : (
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
                {filtered.map((product) => {
                  const outOfStock = product.stock <= 0;
                  return (
                    <tr key={product.id} className={`transition-colors ${outOfStock ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">{product.name}</span>
                          {outOfStock && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">在庫なし</span>}
                          {product.is_allocation && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                product.allocation_deadline &&
                                new Date(product.allocation_deadline) < new Date()
                                  ? "bg-gray-100 text-gray-500 border-gray-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                              title={
                                product.allocation_deadline
                                  ? `締切：${new Date(product.allocation_deadline).toLocaleString("ja-JP")}`
                                  : undefined
                              }
                            >
                              {product.allocation_deadline &&
                              new Date(product.allocation_deadline) < new Date()
                                ? "割当（締切済）"
                                : "割当対象"}
                            </span>
                          )}
                        </div>
                        {product.vintage && <div className="text-xs text-gray-400">{product.vintage}年</div>}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        <div>{[product.country, product.region].filter(Boolean).join(" / ") || "—"}</div>
                        {product.grape_variety && <div className="text-xs text-gray-400">{product.grape_variety}</div>}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">¥{product.price.toLocaleString()}</td>
                      <td className={`px-5 py-4 text-right font-medium ${outOfStock ? "text-red-500" : "text-gray-900"}`}>{product.stock}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}
