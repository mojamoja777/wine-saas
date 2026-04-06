// components/admin/StatusBadge.tsx
// 発注ステータスバッジ（管理者・発注者共通）

export const STATUS_LABEL: Record<string, string> = {
  pending: "受付中",
  confirmed: "準備中",
  shipped: "発送済",
  delivered: "配達済",
};

export const STATUS_CLASS: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  shipped: "bg-green-100 text-green-700",
  delivered: "bg-gray-100 text-gray-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        STATUS_CLASS[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
