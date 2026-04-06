"use client";
// components/admin/UpdateStatusButton.tsx
import { useTransition } from "react";
import { advanceOrderStatus, NEXT_LABEL } from "@/app/(admin)/admin/orders/actions";

type Props = {
  orderId: string;
  currentStatus: string;
};

export function UpdateStatusButton({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const nextLabel = NEXT_LABEL[currentStatus];
  if (!nextLabel) return null;

  function handleSubmit() {
    startTransition(async () => {
      await advanceOrderStatus(orderId, currentStatus);
    });
  }

  return (
    <form action={handleSubmit}>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 bg-[#6B1A35] text-white text-sm font-medium rounded-xl hover:bg-[#9B2D50] disabled:opacity-50 transition-colors"
      >
        {isPending ? "更新中..." : nextLabel}
      </button>
    </form>
  );
}
