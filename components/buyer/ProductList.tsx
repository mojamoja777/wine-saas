"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { AddToCartButton } from "@/components/buyer/AddToCartButton";
import type { Database } from "@/types/database";
import { WINE_TYPES, WINE_COUNTRIES, WINE_REGIONS, SAKE_PREFECTURES, SHOCHU_PREFECTURES } from "@/lib/product-constants";

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  country?: string | null;
  comment?: string | null;
  accept_days?: number | null;
  accept_deadline?: string | null;
  category?: string | null;
  type?: string | null;
};

const CATEGORIES = ["ワイン", "日本酒", "焼酎", "ジン", "ウイスキー", "その他"];

function calc(deadline: string | null | undefined) {
  if (!deadline) return "";
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "受付終了";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `残り${d}日${h}時間`;
  if (h > 0) return `残り${h}時間${m}分`;
  return `残り${m}分`;
}

export function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState("ワイン");
  const [openCategories, setOpenCategories] = useState<string[]>(["ワイン"]);
  const [activeCountry, setActiveCountry] = useState("");
  const [activeRegion, setActiveRegion] = useState("");
  const [activeType, setActiveType] = useState("");

  function toggleCategory(cat: string) {
    setOpenCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setActiveCategory(cat);
    setActiveCountry("");
    setActiveRegion("");
    setActiveType("");
  }

  const regionList = activeCountry ? (WINE_REGIONS[activeCountry] ?? []) : [];

  const filtered = useMemo(() => {
    return products
      .filter(p => {
        if (query.trim()) {
          const q = query.toLowerCase();
          if (!p.name.toLowerCase().includes(q) &&
            !(p.producer ?? "").toLowerCase().includes(q) &&
            !(p.region ?? "").toLowerCase().includes(q)) return false;
        }
        const cat = (p as any).category;
        if (activeCategory && cat !== activeCategory) return false;
        if (activeCountry && p.country !== activeCountry) return false;
        if (activeRegion && p.region !== activeRegion) return false;
        if (activeType && (p as any).type !== activeType) return false;
        return true;
      })
      .sort((a, b) => {
        const aOut = a.stock <= 0 && !a.accept_days ? 1 : 0;
        const bOut = b.stock <= 0 && !b.accept_days ? 1 : 0;
        return aOut - bOut;
      });
  }, [products, query, activeCategory, activeCountry, activeRegion, activeType]);

  const prefList = activeCategory === "日本酒" ? SAKE_PREFECTURES : SHOCHU_PREFECTURES;

  return (
    <div className="flex flex-col h-full">
      {/* 検索バー */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="商品を検索..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1A35] bg-gray-50" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー */}
        <div className="w-40 lg:w-48 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
          {CATEGORIES.map(cat => {
            const isOpen = openCategories.includes(cat);
            const isActive = activeCategory === cat;
            const hasWineRegions = cat === "ワイン";
            const hasPrefs = cat === "日本酒" || cat === "焼酎";
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors text-left ${isActive ? "text-[#6B1A35]" : "text-gray-700 hover:bg-gray-50"}`}>
                  {cat}
                  <span className={`text-xs text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                </button>

                {isOpen && hasWineRegions && (
                  <div className="pb-2">
                    <button onClick={() => { setActiveCountry(""); setActiveRegion(""); }}
                      className={`w-full text-left px-4 py-1.5 text-xs transition-colors ${!activeCountry ? "text-[#6B1A35] font-medium" : "text-gray-500 hover:text-gray-800"}`}>
                      すべて
                    </button>
                    {WINE_COUNTRIES.map(c => (
                      <div key={c}>
                        <button onClick={() => { setActiveCountry(c); setActiveRegion(""); }}
                          className={`w-full text-left px-4 py-1.5 text-xs transition-colors ${activeCountry === c ? "text-[#6B1A35] font-medium" : "text-gray-500 hover:text-gray-800"}`}>
                          {c}
                        </button>
                        {activeCountry === c && regionList.length > 1 && regionList.map(r => (
                          <button key={r} onClick={() => setActiveRegion(r)}
                            className={`w-full text-left pl-7 pr-3 py-1 text-xs transition-colors ${activeRegion === r ? "text-[#6B1A35] font-medium" : "text-gray-400 hover:text-gray-700"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {isOpen && hasPrefs && (
                  <div className="pb-2">
                    <button onClick={() => setActiveRegion("")}
                      className={`w-full text-left px-4 py-1.5 text-xs ${!activeRegion ? "text-[#6B1A35] font-medium" : "text-gray-500"}`}>
                      すべて
                    </button>
                    {prefList.map(p => (
                      <button key={p} onClick={() => setActiveRegion(p)}
                        className={`w-full text-left px-4 py-1.5 text-xs ${activeRegion === p ? "text-[#6B1A35] font-medium" : "text-gray-500 hover:text-gray-800"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* メイン */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* タイプフィルター（ワインのみ） */}
          {activeCategory === "ワイン" && (
            <div className="flex gap-2 px-4 py-3 bg-white border-b border-gray-100 overflow-x-auto scrollbar-none">
              {["すべて", ...WINE_TYPES].map(t => (
                <button key={t} onClick={() => setActiveType(t === "すべて" ? "" : t)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${(t === "すべて" && !activeType) || activeType === t ? "bg-[#6B1A35] text-white border-[#6B1A35]" : "border-gray-200 text-gray-600 hover:border-[#6B1A35]"}`}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* グリッド */}
          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400 text-sm">
                {query ? "該当する商品が見つかりません" : "商品がありません"}
              </div>
            ) : filtered.map(product => {
              const outOfStock = product.stock <= 0 && !product.accept_days;
              return (
                <div key={product.id}
                  onClick={() => setSelected(product)}
                  className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${outOfStock ? "border-gray-100 opacity-50" : "border-gray-100"}`}>
                  <div className="relative aspect-square bg-[#FDF4F6] flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🍷</span>
                    )}
                    {product.accept_days && !outOfStock && (
                      <span className="absolute top-2 left-2 text-xs bg-[#FDF4F6] text-[#6B1A35] px-2 py-0.5 rounded-full font-medium">受付中</span>
                    )}
                    {outOfStock && (
                      <span className="absolute top-2 left-2 text-xs bg-black/40 text-white px-2 py-0.5 rounded-full">在庫なし</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-2">{product.name}{product.vintage ? ` ${product.vintage}` : ""}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{[product.country, product.region].filter(Boolean).join(" / ") || "—"}</p>
                    <p className="text-sm font-bold text-[#3B0A1E] mt-1.5">¥{product.price.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                {selected.vintage && <p className="text-sm text-gray-500">{selected.vintage}年</p>}
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="w-full aspect-[4/3] rounded-2xl bg-[#FDF4F6] flex items-center justify-center mb-4 overflow-hidden">
              {selected.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image_url} alt={selected.name} className="h-full object-contain" />
              ) : <span className="text-6xl">🍷</span>}
            </div>
            <div className="space-y-2 mb-4">
              {(selected as any).category && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">カテゴリ</span>
                  <span className="text-gray-900">{(selected as any).category}{(selected as any).type ? ` / ${(selected as any).type}` : ""}</span>
                </div>
              )}
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
                <span className={selected.stock <= 0 ? "text-red-500" : "text-gray-900"}>
                  {selected.stock > 0 ? `${selected.stock}本` : "在庫なし"}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500">価格（税抜）</span>
                <span className="text-lg font-bold text-[#3B0A1E]">¥{selected.price.toLocaleString()}</span>
              </div>
            </div>
            {selected.accept_days && (
              <div className="bg-[#FDF4F6] rounded-xl p-3 mb-4">
                <p className="text-xs text-[#6B1A35] font-medium">📋 リクエスト受付期間あり（{selected.accept_days}日間）</p>
                {calc(selected.accept_deadline) && <p className="text-xs text-[#6B1A35] font-bold mt-0.5">{calc(selected.accept_deadline)}</p>}
                <p className="text-xs text-[#6B1A35] mt-0.5">在庫を超えてもご注文いただけます。</p>
              </div>
            )}
            {(selected as any).comment && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 font-medium mb-1">酒屋からのコメント</p>
                <p className="text-sm text-gray-700">{(selected as any).comment}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-lg font-bold text-[#3B0A1E]">¥{selected.price.toLocaleString()}</span>
              {selected.stock <= 0 && !selected.accept_days ? (
                <button disabled className="bg-gray-200 text-gray-400 px-6 py-3 rounded-full text-sm cursor-not-allowed">在庫なし</button>
              ) : (
                <AddToCartButton product={{ id: selected.id, name: selected.name, price: selected.price }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
