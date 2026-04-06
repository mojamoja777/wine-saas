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

  // カートが空になったらカートページへリダイレクト
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/buyer/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) return null;

  async function handleOrder() {
    setLoading(true);
    setError(null);

    const result = await createOrder(items, note);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // 成功 → カートをクリアして完了ページへ
    clearCart();
    router.push(`/buyer/orders/complete?orderId=${result.orderId}`);
  }

  return (
    <div className="px-4 py-4">
      {/* 戻るボタン */}
      <Link
        href="/buyer/cart"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#6B1A35] mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        カートに戻る
      </Link>

      <h1 className="text-lg font-semibold text-gray-900 mb-4">発注確認</h1>

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* 発注内容 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">発注内容</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-gray-700 flex-1 truncate pr-2">
                {item.name}
              </span>
              <span className="text-gray-500 shrink-0">× {item.quantity}本</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between text-sm">
          <span className="text-gray-600">
            合計 {totalItems}本
          </span>
          <span className="font-bold text-[#3B0A1E]">
            ¥{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 備考 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
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

      {/* 発注ボタン */}
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-[#6B1A35] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#9B2D50] active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base mb-3"
      >
        {loading ? "発注中..." : "発注する"}
      </button>

      <Link
        href="/buyer/cart"
        className="block w-full text-center border border-[#6B1A35] text-[#6B1A35] font-medium py-3 px-6 rounded-xl hover:bg-[#FDF4F6] transition-colors text-base"
      >
        カートに戻る
      </Link>
    </div>
  );
}
