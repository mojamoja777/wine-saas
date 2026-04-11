// app/(buyer)/buyer/orders/page.tsx
// 発注者 - 発注履歴ページ

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  pending: "受付中",
  confirmed: "準備中",
  shipped: "発送済",
  delivered: "配達済",
  cancelled: "キャンセル",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  shipped: "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-100 text-red-700",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      note,
      ordered_at,
      order_items (
        quantity,
        unit_price
      )
    `
    )
    .order("ordered_at", { ascending: false });

  return (
    <div className="px-4 py-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">発注履歴</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const total = order.order_items.reduce(
              (sum, item) => sum + item.unit_price * item.quantity,
              0
            );
            const totalQty = order.order_items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            const date = new Date(order.ordered_at);

            return (
              <Link
                key={order.id}
                href={`/buyer/orders/${order.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {date.toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      STATUS_CLASS[order.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-sm text-gray-600">{totalQty}本</p>
                  <p className="text-base font-bold text-[#3B0A1E]">
                    ¥{total.toLocaleString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-4xl mb-3">📋</span>
          <p className="text-sm mb-6">発注履歴がありません</p>
          <Link
            href="/buyer"
            className="px-6 py-2.5 bg-[#6B1A35] text-white text-sm font-medium rounded-xl hover:bg-[#9B2D50] transition-colors"
          >
            商品一覧へ
          </Link>
        </div>
      )}
    </div>
  );
}
