"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronRight, SlidersHorizontal } from "lucide-react";
import { AddToCartButton } from "@/components/buyer/AddToCartButton";
import type { Database } from "@/types/database";
import { WINE_TYPES, WINE_COUNTRIES, WINE_REGIONS } from "@/lib/product-constants";

const CATEGORIES = ["ワイン", "日本酒", "焼酎", "ジン", "ウイスキー", "その他"];

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  country?: string | null;
  comment?: string | null;
  accept_days?: number | null;
  accept_deadline?: string | null;
  category?: string | null;
  type?: string | null;
};

function useCountdown(deadline: string | null | undefined) {
  const [remaining, setRemaining] = useState(() => calc(deadline));
  useMemo(() => {
    if (!deadline) return;
    const timer = setInterval(() => setRemaining(calc(deadline)), 60000);
    return () => clearInterval(timer);
  }, [deadline]);
  return remaining;
}

function calc(deadline: string | null | undefined) {
  if (!deadline) return "";
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "受付終了";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `残り${d}日${h}時間${m}分`;
  if (h > 0) return `残り${h}時間${m}分`;
  return `残り${m}分`;
}

function AcceptDeadlineBlock({ deadline, days }: { deadline?: string | null; days: number }) {
  const countdown = useCountdown(deadline);
  return (
    <div className="bg-[#FDF4F6] rounded-xl p-3 mb-4">
      <p className="text-xs text-[#6B1A35] font-medium">📋 リクエスト受付期間あり（{days}日間）</p>
      {countdown && <p className="text-xs text-[#6B1A35] font-bold mt-0.5">{countdown}</p>}
      <p className="text-xs text-[#6B1A35] mt-0.5">在庫を超えてもご注文いただけます。期間終了後に割り当てを決定します。</p>
    </div>
  );
}

export function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState(0);

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);

  const filtered = useMemo(() => {
    return products
      .filter(p => {
        if (query.trim()) {
          const q = query.toLowerCase();
          if (!p.name.toLowerCase().includes(q) &&
            !(p.producer ?? "").toLowerCase().includes(q) &&
            !(p.region ?? "").toLowerCase().includes(q) &&
            !(p.country ?? "").toLowerCase().includes(q)) return false;
        }
        if (filterCategory && p.category !== filterCategory) return false;
        if (filterType && p.type !== filterType) return false;
        if (filterCountry && p.country !== filterCountry) return false;
        if (filterRegion && p.region !== filterRegion) return false;
        if (filterMaxPrice > 0 && p.price > filterMaxPrice) return false;
        return true;
      })
      .sort((a, b) => {
        const aOut = a.stock <= 0 && !a.accept_days ? 1 : 0;
        const bOut = b.stock <= 0 && !b.accept_days ? 1 : 0;
        return aOut - bOut;
      });
  }, [products, query, filterCategory, filterType, filterCountry, filterRegion, filterMaxPrice]);

  const activeFilters = [filterCategory, filterType, filterCountry, filterRegion, filterMaxPrice > 0 ? `¥${filterMaxPrice.toLocaleString()}以下` : ""].filter(Boolean).length;

  const regionList = filterCountry ? (WINE_REGIONS[filterCountry] ?? []) : [];

  function clearFilters() {
    setFilterCategory(""); setFilterType(""); setFilterCountry("");
    setFilterRegion(""); setFilterMaxPrice(0);
  }

  return (
    <div className="px-4 py-4">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="検索..." value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1A35] bg-white" />
        </div>
        <button onClick={() => setShowFilter(!showFilter)}
          className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-colors ${showFilter ? "bg-[#6B1A35] text-white border-[#6B1A35]" : "border-gray-200 text-gray-600"}`}>
          <SlidersHorizontal className="w-4 h-4" />
          絞り込み
          {activeFilters > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6B1A35] text-white text-xs rounded-full flex items-center justify-center">{activeFilters}</span>}
        </button>
      </div>

      {showFilter && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-2">カテゴリ</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => { setFilterCategory(filterCategory === c ? "" : c); setFilterType(""); setFilterCountry(""); setFilterRegion(""); }}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${filterCategory === c ? "bg-[#6B1A35] text-white border-[#6B1A35]" : "border-gray-200 text-gray-600"}`}>{c}</button>
              ))}
            </div>
          </div>

          {filterCategory === "ワイン" && (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-2">タイプ</p>
                <div className="flex flex-wrap gap-2">
                  {WINE_TYPES.map(t => (
                    <button key={t} onClick={() => setFilterType(filterType === t ? "" : t)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${filterType === t ? "bg-[#6B1A35] text-white border-[#6B1A35]" : "border-gray-200 text-gray-600"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">国</p>
                <div className="flex flex-wrap gap-2">
                  {WINE_COUNTRIES.map(c => (
                    <button key={c} onClick={() => { setFilterCountry(filterCountry === c ? "" : c); setFilterRegion(""); }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${filterCountry === c ? "bg-[#6B1A35] text-white border-[#6B1A35]" : "border-gray-200 text-gray-600"}`}>{c}</button>
                  ))}
                </div>
              </div>
              {filterCountry && regionList.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">地域</p>
                  <div className="flex flex-wrap gap-2">
                    {regionList.map(r => (
                      <button key={r} onClick={() => setFilterRegion(filterRegion === r ? "" : r)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${filterRegion === r ? "bg-[#6B1A35] text-white border-[#6B1A35]" : "border-gray-200 text-gray-600"}`}>{r}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs text-gray-500">価格上限</p>
              <p className="text-xs text-gray-700">{filterMaxPrice > 0 ? `¥${filterMaxPrice.toLocaleString()}` : "上限なし"}</p>
            </div>
            <input type="range" min={0} max={maxPrice} step={500} value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
              className="w-full accent-[#6B1A35]" />
          </div>

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="w-full py-2 text-xs text-[#6B1A35] border border-[#6B1A35] rounded-full">
              絞り込みをリセット
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">🍷</span>
          <p className="text-sm">{query || activeFilters > 0 ? "該当する商品が見つかりません" : "商品がありません"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => {
            const outOfStock = product.stock <= 0 && !product.accept_days;
            return (
              <div key={product.id}
                className={`bg-white rounded-2xl border px-4 py-3 flex items-center gap-3 cursor-pointer transition-all ${outOfStock ? "border-gray-100 opacity-50" : "border-gray-100 active:bg-gray-50"}`}
                onClick={() => setSelected(product)}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${outOfStock ? "bg-gray-100" : "bg-[#FDF4F6]"}`}>
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🍷</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    {product.accept_days && !outOfStock && (
                      <span className="shrink-0 text-xs bg-[#FDF4F6] text-[#6B1A35] px-2 py-0.5 rounded-full">受付中</span>
                    )}
                    {outOfStock && (
                      <span className="shrink-0 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">在庫なし</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {product.vintage && <span className="text-xs text-gray-400">{product.vintage}年</span>}
                    {[product.country, product.region].filter(Boolean).length > 0 && (
                      <span className="text-xs text-gray-400">{[product.country, product.region].filter(Boolean).join(" / ")}</span>
                    )}
                    <span className="text-sm font-bold text-[#3B0A1E]">¥{product.price.toLocaleString()}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                {selected.vintage && <p className="text-sm text-gray-500">{selected.vintage}年</p>}
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="w-full h-40 rounded-2xl bg-[#FDF4F6] flex items-center justify-center mb-4 overflow-hidden">
              {selected.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image_url} alt={selected.name} className="h-full object-contain" />
              ) : (
                <span className="text-6xl">🍷</span>
              )}
            </div>
            <div className="space-y-2 mb-4">
              {selected.category && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">カテゴリ</span>
                  <span className="text-gray-900">{selected.category}{selected.type ? ` / ${selected.type}` : ""}</span>
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
              <AcceptDeadlineBlock deadline={selected.accept_deadline} days={selected.accept_days} />
            )}
            {selected.comment && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 font-medium mb-1">酒屋からのコメント</p>
                <p className="text-sm text-gray-700">{selected.comment}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-lg font-bold text-[#3B0A1E]">¥{selected.price.toLocaleString()}</span>
              {selected.stock <= 0 && !selected.accept_days ? (
                <button disabled className="bg-gray-200 text-gray-400 px-6 py-3 rounded-full text-sm font-medium cursor-not-allowed">在庫なし</button>
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
