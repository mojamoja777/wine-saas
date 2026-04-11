"use client";
import { useState } from "react";
import { cancelOrderByBuyer } from "@/app/(buyer)/buyer/actions";

type Props = {
  orderId: string;
  currentStatus: string;
};

export function BuyerCancelOrderButton({ orderId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentStatus !== "pending") return null;

  async function handleCancel() {
    if (!window.confirm("この発注をキャンセルしますか？")) return;
    setLoading(true);
    setError(null);
    const result = await cancelOrderByBuyer(orderId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="w-full px-5 py-2.5 border border-red-300 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "処理中..." : "発注をキャンセル"}
      </button>
    </div>
  );
}
