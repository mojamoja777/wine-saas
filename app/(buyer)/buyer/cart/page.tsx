"use client";

// app/(buyer)/buyer/cart/page.tsx
// カートページ

import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart-context";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

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

  const renderItem = (item: CartItem) => (
    <div
      key={item.productId}
      className="bg-white rounded-xl border border-gray-200 p-4"
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
            className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full hover:border-[#6B1A35] transition-colors"
            aria-label="数量を減らす"
          >
            <Minus className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <span className="w-6 text-center text-sm font-semibold">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="flex items-center justify-center w-8 h-8 border border-gray-200 rounded-full hover:border-[#6B1A35] transition-colors"
            aria-label="数量を増やす"
          >
            <Plus className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          ¥{(item.price * item.quantity).toLocaleString()}
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-1">
        ¥{item.price.toLocaleString()} × {item.quantity}
        {item.isAllocation && <span className="ml-2">（希望本数）</span>}
      </p>
    </div>
  );

  return (
    <div className="px-4 py-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">
        カート（{items.length}種類）
      </h1>

      {/* 通常注文セクション */}
      {normalItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
            通常注文
          </h2>
          <div className="space-y-3">{normalItems.map(renderItem)}</div>
        </div>
      )}

      {/* 割り当て注文セクション */}
      {allocationItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-amber-800 uppercase mb-2 px-1">
            割り当て注文
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <p className="text-xs text-amber-900 leading-relaxed">
              ⚠ 割り当て対象商品はご希望本数です。お店から実際の割り当て本数をご連絡します。
              <span className="font-semibold">キャンセル不可</span>のため、ご不明点はお問い合わせください。
            </p>
          </div>
          <div className="space-y-3">{allocationItems.map(renderItem)}</div>
        </div>
      )}

      {/* 合計 */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">合計金額</span>
          <span className="text-2xl font-bold text-[#3B0A1E]">
            ¥{totalPrice.toLocaleString()}
          </span>
        </div>
        {allocationItems.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            ※ 割り当て注文は希望本数での概算金額です
          </p>
        )}
      </div>

      {/* 発注確認へ進む */}
      <Link
        href="/buyer/cart/confirm"
        className="block w-full text-center bg-[#6B1A35] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#9B2D50] active:opacity-80 transition-colors text-base"
      >
        発注確認へ進む
      </Link>
    </div>
  );
}
