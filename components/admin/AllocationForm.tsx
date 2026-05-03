"use client";

// components/admin/AllocationForm.tsx
// 商品ごとの按分入力フォーム（admin）

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmAllocations } from "@/app/(admin)/admin/allocations/actions";

export type AllocationRequest = {
  id: string;
  orderId: string;
  companyName: string;
  orderedAt: string;
  note: string | null;
  requestedQuantity: number;
};

type Props = {
  productId: string;
  stock: number;
  requests: AllocationRequest[];
};

export function AllocationForm({ productId, stock, requests }: Props) {
  // 初期値は希望本数（合計が在庫を超えれば admin が手で減らす）
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(requests.map((r) => [r.id, r.requestedQuantity]))
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const totalAllocated = useMemo(
    () => Object.values(values).reduce((a, b) => a + (b || 0), 0),
    [values]
  );
  const overStock = totalAllocated > stock;
  const remaining = stock - totalAllocated;

  function setQty(id: string, raw: string, max: number) {
    const n = raw === "" ? 0 : Math.max(0, Math.min(max, parseInt(raw, 10) || 0));
    setValues((prev) => ({ ...prev, [id]: n }));
  }

  function distributeProportional() {
    // 希望本数の比率で在庫を按分（端数は希望順に1ずつ配る）
    const totalReq = requests.reduce((a, r) => a + r.requestedQuantity, 0);
    if (totalReq === 0) return;
    const shareLimit = Math.min(stock, totalReq);
    const next: Record<string, number> = {};
    let assigned = 0;
    const fractional: { id: string; frac: number }[] = [];
    for (const r of requests) {
      const exact = (r.requestedQuantity / totalReq) * shareLimit;
      const base = Math.floor(exact);
      next[r.id] = Math.min(base, r.requestedQuantity);
      assigned += next[r.id];
      fractional.push({ id: r.id, frac: exact - base });
    }
    // 余りを fractional の大きい順に1本ずつ加算（希望本数を超えない範囲で）
    let leftover = shareLimit - assigned;
    fractional.sort((a, b) => b.frac - a.frac);
    for (const f of fractional) {
      if (leftover <= 0) break;
      const r = requests.find((x) => x.id === f.id)!;
      if (next[f.id] < r.requestedQuantity) {
        next[f.id] += 1;
        leftover -= 1;
      }
    }
    setValues(next);
  }

  function fillRequested() {
    setValues(Object.fromEntries(requests.map((r) => [r.id, r.requestedQuantity])));
  }

  function clearAll() {
    setValues(Object.fromEntries(requests.map((r) => [r.id, 0])));
  }

  function handleSubmit() {
    setError(null);
    if (overStock) {
      setError("配分合計が在庫を超えています。");
      return;
    }
    const decisions = requests.map((r) => ({
      orderItemId: r.id,
      allocatedQuantity: values[r.id] ?? 0,
    }));
    startTransition(async () => {
      const result = await confirmAllocations(productId, decisions);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/allocations");
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 bg-gray-50">
        <p className="text-xs text-gray-500">
          各飲食店への配分本数を入力してください（希望本数を上限）
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={distributeProportional}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-white"
          >
            希望比で按分
          </button>
          <button
            type="button"
            onClick={fillRequested}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-white"
          >
            希望どおり
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-md text-gray-600 hover:bg-white"
          >
            全て0
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500 uppercase">
              飲食店
            </th>
            <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500 uppercase">
              注文日
            </th>
            <th className="text-right px-5 py-2 text-xs font-semibold text-gray-500 uppercase">
              希望
            </th>
            <th className="text-right px-5 py-2 text-xs font-semibold text-gray-500 uppercase">
              配分
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((r) => {
            const v = values[r.id] ?? 0;
            return (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-900">
                  {r.companyName}
                  {r.note && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      備考: {r.note}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-gray-500">
                  {r.orderedAt
                    ? new Date(r.orderedAt).toLocaleString("ja-JP", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {r.requestedQuantity}
                </td>
                <td className="px-5 py-3 text-right">
                  <input
                    type="number"
                    min={0}
                    max={r.requestedQuantity}
                    value={v}
                    onChange={(e) => setQty(r.id, e.target.value, r.requestedQuantity)}
                    className="w-20 border border-gray-200 rounded-md px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
                  />
                  <span className="ml-1 text-xs text-gray-400">本</span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50 border-t border-gray-200">
          <tr>
            <td colSpan={2} className="px-5 py-3 text-xs text-gray-500">
              在庫: {stock} ／ 残り:{" "}
              <span className={remaining < 0 ? "text-red-600 font-medium" : ""}>
                {remaining}
              </span>
            </td>
            <td className="px-5 py-3 text-right text-xs text-gray-500">合計</td>
            <td className="px-5 py-3 text-right">
              <span
                className={`text-sm font-semibold ${
                  overStock ? "text-red-600" : "text-gray-900"
                }`}
              >
                {totalAllocated}
              </span>
              <span className="ml-1 text-xs text-gray-400">本</span>
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-xs text-gray-500">
            確定すると各注文に配分本数が反映され、その注文は受付完了になります。
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || overStock}
          className="px-6 py-2.5 text-sm font-medium bg-[#6B1A35] text-white rounded-xl hover:bg-[#9B2D50] disabled:opacity-50 transition-colors"
        >
          {pending ? "確定中..." : "配分を確定する"}
        </button>
      </div>
    </div>
  );
}
