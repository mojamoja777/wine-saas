// app/(admin)/admin/orders/[id]/page.tsx
// 管理者 - 発注詳細ページ

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { UpdateStatusButton } from "@/components/admin/UpdateStatusButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      note,
      ordered_at,
      updated_at,
      users!inner (
        company_name
      ),
      order_items (
        id,
        quantity,
        unit_price,
        products (
          id,
          name,
          producer,
          region
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (!order) notFound();

  const buyer = order.users as { company_name: string } | null;
  const total = order.order_items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const totalQty = order.order_items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="p-8 max-w-4xl">
      {/* パンくずナビ */}
      <Link
        href="/admin"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#6B1A35] mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        発注一覧へ戻る
      </Link>

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">発注詳細</h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(order.ordered_at).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* 2カラムレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* 発注内容 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">発注内容</h2>
          <div className="space-y-3">
            {order.order_items.map((item) => {
              const product = item.products as {
                id: string;
                name: string;
                producer: string | null;
                region: string | null;
              } | null;
              return (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1 pr-3">
                    <p className="text-sm font-medium text-gray-900">
                      {product?.name ?? "—"}
                    </p>
                    {(product?.producer || product?.region) && (
                      <p className="text-xs text-gray-400">
                        {[product.producer, product.region]
                          .filter(Boolean)
                          .join(" / ")}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      ¥{item.unit_price.toLocaleString()} × {item.quantity}本
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">
                    ¥{(item.unit_price * item.quantity).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
            <span className="text-sm text-gray-600">合計 {totalQty}本</span>
            <span className="text-lg font-bold text-[#3B0A1E]">
              ¥{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 顧客・備考情報 */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">顧客情報</h2>
            <p className="text-sm font-medium text-gray-900">
              {buyer?.company_name ?? "—"}
            </p>
          </div>

          {order.note && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">備考</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{order.note}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">更新日時</h2>
            <p className="text-xs text-gray-400">
              {new Date(order.updated_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* ステータス変更 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          ステータス変更
        </h2>
        <p className="text-sm text-red-500 mb-2">status: {order.status}</p>
        <div className="flex items-center gap-4">
          <StatusBadge status={order.status} />
          <span className="text-gray-400">→</span>
          <UpdateStatusButton orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      {order.status === "delivered" && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 text-sm text-gray-500">
          この発注は配達済みです。
        </div>
      )}
    </div>
  );
}
