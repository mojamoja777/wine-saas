// app/(admin)/admin/allocations/page.tsx
// 管理者 - 割り当て待ち一覧（商品別に集計）

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type PendingItem = {
  id: string;
  quantity: number;
  product_id: string;
  orders: { status: string; ordered_at: string } | null;
  products: {
    id: string;
    name: string;
    producer: string | null;
    vintage: number | null;
    stock: number;
    allocation_deadline: string | null;
  } | null;
};

type ProductSummary = {
  productId: string;
  name: string;
  producer: string | null;
  vintage: number | null;
  stock: number;
  deadline: string | null;
  requestCount: number;
  totalRequested: number;
  oldestOrderedAt: string;
};

export default async function AdminAllocationsPage() {
  const supabase = await createClient();

  // allocation_pending な注文に紐づく order_items を商品ごとに集計する
  const { data: rows, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      quantity,
      product_id,
      orders!inner (
        status,
        ordered_at
      ),
      products!inner (
        id,
        name,
        producer,
        vintage,
        stock,
        allocation_deadline
      )
    `
    )
    .eq("orders.status", "allocation_pending")
    .is("allocated_quantity", null);

  const items = (rows ?? []) as unknown as PendingItem[];

  // 商品IDで集約
  const summaryMap = new Map<string, ProductSummary>();
  for (const item of items) {
    if (!item.products || !item.orders) continue;
    const key = item.products.id;
    const existing = summaryMap.get(key);
    if (existing) {
      existing.requestCount += 1;
      existing.totalRequested += item.quantity;
      if (item.orders.ordered_at < existing.oldestOrderedAt) {
        existing.oldestOrderedAt = item.orders.ordered_at;
      }
    } else {
      summaryMap.set(key, {
        productId: item.products.id,
        name: item.products.name,
        producer: item.products.producer,
        vintage: item.products.vintage,
        stock: item.products.stock,
        deadline: item.products.allocation_deadline,
        requestCount: 1,
        totalRequested: item.quantity,
        oldestOrderedAt: item.orders.ordered_at,
      });
    }
  }

  const summaries = Array.from(summaryMap.values()).sort((a, b) => {
    // 締切が近い順 → 同点は最古注文順
    const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    if (aDeadline !== bDeadline) return aDeadline - bDeadline;
    return a.oldestOrderedAt.localeCompare(b.oldestOrderedAt);
  });

  const now = Date.now();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">割り当て</h1>
          <p className="text-sm text-gray-500 mt-1">
            希少商品の按分待ち一覧。締切後に各飲食店への配分本数を決定します。
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          割り当て一覧の取得に失敗しました。
        </div>
      )}

      {summaries.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  商品
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  受付締切
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  在庫
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  希望合計
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  リクエスト数
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaries.map((s) => {
                const expired = s.deadline
                  ? new Date(s.deadline).getTime() <= now
                  : false;
                const overSubscribed = s.totalRequested > s.stock;
                return (
                  <tr key={s.productId} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/allocations/${s.productId}`}
                        className="text-gray-900 hover:text-[#6B1A35] font-medium"
                      >
                        {s.name}
                        {s.vintage && (
                          <span className="text-gray-400 text-xs ml-1">
                            {s.vintage}
                          </span>
                        )}
                      </Link>
                      {s.producer && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {s.producer}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600">
                      {s.deadline ? (
                        <>
                          {new Date(s.deadline).toLocaleString("ja-JP", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {expired ? (
                            <span className="ml-2 inline-block text-[10px] text-red-700 bg-red-100 rounded-full px-2 py-0.5">
                              受付終了
                            </span>
                          ) : (
                            <span className="ml-2 inline-block text-[10px] text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">
                              受付中
                            </span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-700">
                      {s.stock}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={
                          overSubscribed
                            ? "text-red-600 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {s.totalRequested}
                      </span>
                      {overSubscribed && (
                        <p className="text-[10px] text-red-500 mt-0.5">
                          在庫超過
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-600">
                      {s.requestCount}件
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/allocations/${s.productId}`}
                        className="inline-flex items-center gap-1 text-[#6B1A35] text-xs hover:underline"
                      >
                        按分する
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-gray-400">
          <Sparkles className="w-10 h-10 mb-3" />
          <p className="text-sm">割り当て待ちの注文はありません</p>
        </div>
      )}
    </div>
  );
}
