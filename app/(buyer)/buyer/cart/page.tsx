"use client";

// app/(buyer)/buyer/cart/page.tsx
// カートページ

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2, Minus, Plus, ShoppingCart, AlertTriangle } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart-context";
import { syncCartAction } from "../actions";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, syncItems } =
    useCart();
  const [syncMessages, setSyncMessages] = useState<string[]>([]);

  // マウント時に最新の商品情報でカートを同期
  useEffect(() => {
    let cancelled = false;
    const productIds = items.map((i) => i.productId);
    if (productIds.length === 0) return;

    (async () => {
      const { products } = await syncCartAction(productIds);
      if (cancelled) return;
      const productMap = new Map(products.map((p) => [p.id, p]));
      const now = Date.now();
      const messages: string[] = [];

      const nextItems = items.flatMap((item) => {
        const product = productMap.get(item.productId);
        if (!product || !product.is_active) {
          messages.push(`${item.name} は受付終了のためカートから削除しました`);
          return [];
        }
        if (
          product.is_allocation &&
          product.allocation_deadline &&
          new Date(product.allocation_deadline).getTime() <= now
        ) {
          messages.push(
            `${item.name} は受付締切を過ぎたためカートから削除しました`
          );
          return [];
        }
        // 割り当て状態の変化を反映
        const stateChanged =
          item.isAllocation !== product.is_allocation ||
          item.allocationDeadline !== (product.allocation_deadline ?? null);
        // 価格の最新化（念のため）
        const priceChanged = item.price !== Number(product.price);

        if (!stateChanged && !priceChanged) return [item];
        if (item.isAllocation && !product.is_allocation) {
          messages.push(
            `${item.name} は通常販売に戻りました（割り当て対象外）`
          );
        }
        return [
          {
            ...item,
            isAllocation: product.is_allocation,
            allocationDeadline: product.allocation_deadline ?? null,
            price: Number(product.price),
            name: product.name,
          },
        ];
      });

      syncItems(nextItems);
      setSyncMessages(messages);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-gray-400">
        <ShoppingCart className="w-12 h-12 mb-4 opacity-40" />
        <p className="text-sm mb-6">カートが空です</p>
        <Link
          href="/buyer"
          className="px-6 py-2.5 bg-[#6B1A35] text-white text-sm font-medium rounded-xl hover:bg-[#9B2D50] transition-colors"
        >
          商品一覧へ
        </Link>
      </div>
    );
  }

  const normalItems = items.filter((item) => !item.isAllocation);
  const allocationItems = items.filter((item) => item.isAllocation);

  const renderItem = (item: CartItem) => {
    const isAlloc = item.isAllocation;
    return (
      <div
        key={item.productId}
        className={`rounded-xl border p-4 shadow-sm ${
          isAlloc ? "bg-white border-amber-200" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm font-medium text-gray-900 leading-tight flex-1">
            {item.name}
          </p>
          <button
            onClick={() => removeItem(item.productId)}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0"
            aria-label="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className={`flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full transition-colors ${
                isAlloc ? "hover:border-amber-500" : "hover:border-[#6B1A35]"
              }`}
              aria-label="数量を減らす"
            >
              <Minus className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className={`flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full transition-colors ${
                isAlloc ? "hover:border-amber-500" : "hover:border-[#6B1A35]"
              }`}
              aria-label="数量を増やす"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <p
            className={`text-sm font-semibold ${
              isAlloc ? "text-amber-900" : "text-gray-900"
            }`}
          >
            ¥{(item.price * item.quantity).toLocaleString()}
          </p>
        </div>

        <p className="text-xs text-gray-400 mt-1">
          ¥{item.price.toLocaleString()} × {item.quantity}
          {isAlloc && (
            <span className="ml-2 text-amber-700 font-medium">
              （希望本数）
            </span>
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="px-4 py-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">
        カート（{items.length}種類）
      </h1>

      {syncMessages.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 space-y-1">
          {syncMessages.map((m, i) => (
            <p key={i} className="text-xs text-amber-900 leading-relaxed">
              ⚠ {m}
            </p>
          ))}
        </div>
      )}

      {/* 合計・発注確認（常に上部に配置） */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">合計金額</span>
          <span className="text-2xl font-bold text-[#3B0A1E]">
            ¥{totalPrice.toLocaleString()}
          </span>
        </div>
        {allocationItems.length > 0 && (
          <p className="text-xs text-gray-400 mb-3">
            ※ 割り当て注文は希望本数での概算金額です
          </p>
        )}
        <Link
          href="/buyer/cart/confirm"
          className="block w-full text-center bg-[#6B1A35] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#9B2D50] active:opacity-80 transition-colors text-base"
        >
          発注確認へ進む
        </Link>
      </div>

      {/* 通常注文セクション */}
      {normalItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 bg-gray-50 border-l-4 border-[#6B1A35] px-3 py-2 rounded-r-lg mb-3">
            <ShoppingCart className="w-4 h-4 text-[#6B1A35]" />
            <h2 className="text-sm font-semibold text-[#3B0A1E]">
              通常注文
            </h2>
            <span className="text-xs text-gray-500 ml-auto">
              {normalItems.length}種類
            </span>
          </div>
          <div className="space-y-3">{normalItems.map(renderItem)}</div>
        </div>
      )}

      {/* 割り当て注文セクション */}
      {allocationItems.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 bg-amber-100 border-l-4 border-amber-600 px-3 py-2 rounded-r-lg mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <h2 className="text-sm font-semibold text-amber-900">
              割り当て注文
            </h2>
            <span className="text-xs text-amber-800 ml-auto">
              {allocationItems.length}種類
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <p className="text-xs text-amber-900 leading-relaxed">
              <span className="font-semibold">⚠ 希望本数としての受付です。</span>
              受付締切後にお店から実際の割り当て本数をご連絡します。
              <span className="font-semibold">キャンセル不可</span>のため、ご不明点はお問い合わせください。
            </p>
          </div>
          <div className="space-y-3">{allocationItems.map(renderItem)}</div>
        </div>
      )}

    </div>
  );
}
