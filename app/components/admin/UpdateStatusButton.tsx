"use client";

// components/admin/UpdateStatusButton.tsx
// 発注ステータス変更ボタン（確認ダイアログ付き）

import { useState } from "react";
import { advanceOrderStatus, NEXT_LABEL } from "@/app/(admin)/admin/orders/actions";
import { STATUS_LABEL } from "@/components/admin/StatusBadge";

type Props = {
  orderId: string;
  currentStatus: string;
};

export function UpdateStatusButton({ orderId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextLabel = NEXT_LABEL[currentStatus];
  if (!nextLabel) return null; // delivered は変更不要

  async function handleClick() {
    const nextStatus = currentStatus === "pending"
      ? "準備中"
      : currentStatus === "confirmed"
      ? "発送済"
      : "配達済";

    if (!window.confirm(`ステータスを「${nextStatus}」に変更しますか？`)) return;

    setLoading(true);
    setError(null);

    const result = await advanceOrderStatus(orderId, currentStatus);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // 成功時は revalidatePath でページが自動更新される
  }

  return (
    <div>
      {error && (
        <p className="text-red-600 text-sm mb-2">{error}</p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-5 py-2.5 bg-[#6B1A35] text-white text-sm font-medium rounded-xl hover:bg-[#9B2D50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "更新中..." : nextLabel}
      </button>
    </div>
  );
}
