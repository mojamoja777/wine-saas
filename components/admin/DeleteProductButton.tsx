"use client";

// components/admin/DeleteProductButton.tsx
// 商品削除ボタン（確認ダイアログ付き）

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/(admin)/admin/products/actions";

export function DeleteProductButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!window.confirm("この商品を削除しますか？\nこの操作は取り消せません。")) {
      return;
    }
    await deleteProduct(id);
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      aria-label="削除"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
