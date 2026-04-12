"use client";

// components/buyer/AddToCartButton.tsx
// カートへの追加・数量変更ボタン

import { Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    isAllocation?: boolean;
    allocationDeadline?: string | null;
  };
};

export function AddToCartButton({ product }: Props) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity ?? 0;

  if (quantity === 0) {
    return (
      <button
        onClick={() => addItem(product)}
        className="flex items-center justify-center w-11 h-11 bg-[#6B1A35] text-white rounded-full hover:bg-[#9B2D50] active:opacity-80 transition-colors shrink-0"
        aria-label="カートに追加"
      >
        <Plus className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => updateQuantity(product.id, quantity - 1)}
        className="flex items-center justify-center w-8 h-8 border border-[#6B1A35] text-[#6B1A35] rounded-full hover:bg-[#FDF4F6] transition-colors"
        aria-label="数量を減らす"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-gray-900">
        {quantity}
      </span>
      <button
        onClick={() => updateQuantity(product.id, quantity + 1)}
        className="flex items-center justify-center w-8 h-8 bg-[#6B1A35] text-white rounded-full hover:bg-[#9B2D50] transition-colors"
        aria-label="数量を増やす"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
