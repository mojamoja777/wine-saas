"use client";

// app/(buyer)/buyer/cart/confirm/page.tsx
// 発注確認ページ

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { createOrder } from "../../actions";

export default function ConfirmPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/buyer/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  const normalItems = items.filter((i) => !i.isAllocation);
  const allocationItems = items.filter((i) => i.isAllocation);
  const normalTotal = normalItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );
  const allocationTotal = allocationItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  async function handleOrder() {
    setLoading(true);
    setError(null);

    const result = await createOrder(items, note);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    clearCart();
    const params = new URLSearchParams();
    if (result.normalOrderId) params.set("normal", result.normalOrderId);
    if (result.allocationOrderId)
      params.set("allocation", result.allocationOrderId);
    router.push(`/buyer/orders/complete?${params.toString()}`);
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">発注確認</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* 合計・備考・操作ボタンを最上段に固定 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm space-y-4">
        {/* 合計 */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">合計 {totalItems}本</span>
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

        {/* 備考 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            備考（任意）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="配送日の希望など、酒屋への連絡事項を入力してください"
            rows={3}
            className="w-full text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1A35] resize-none"
          />
        </div>

        {/* 操作ボタン */}
        <div className="space-y-2">
          <button
            onClick={handleOrder}
            disabled={loading}
            className="w-full bg-[#6B1A35] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#9B2D50] active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
          >
            {loading ? "発注中..." : "発注する"}
          </button>
          <Link
            href="/buyer/cart"
            className="flex items-center justify-center gap-1 w-full text-center border border-[#6B1A35] text-[#6B1A35] font-medium py-3 px-6 rounded-xl hover:bg-[#FDF4F6] transition-colors text-base"
          >
            <ChevronLeft className="w-4 h-4" />
            カートに戻る
          </Link>
        </div>
      </div>

      {/* 通常注文セクション */}
      {normalItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">通常注文</h2>
          <div className="space-y-2">
            {normalItems.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-700 flex-1 truncate pr-2">
                  {item.name}
                </span>
                <span className="text-gray-500 shrink-0">
                  × {item.quantity}本
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between text-sm">
            <span className="text-gray-600">小計</span>
            <span className="font-bold text-[#3B0A1E]">
              ¥{normalTotal.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 割り当て注文セクション */}
      {allocationItems.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-4 mb-4">
          <h2 className="text-sm font-semibold text-amber-900 mb-3">
            割り当て注文
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-900 leading-relaxed">
              ⚠ 割り当て対象商品はご希望本数です。受付期限後にお店から実際の割り当て本数をご連絡します。
              <span className="font-semibold">キャンセル不可</span>のため、ご不明点はお問い合わせください。
            </p>
          </div>
          <div className="space-y-2">
            {allocationItems.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-700 flex-1 truncate pr-2">
                  {item.name}
                </span>
                <span className="text-gray-500 shrink-0">
                  希望 × {item.quantity}本
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between text-sm">
            <span className="text-gray-600">希望本数での概算</span>
            <span className="font-bold text-amber-900">
              ¥{allocationTotal.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
