// app/(buyer)/layout.tsx
// 発注者ページ共通レイアウト（CartProvider でラップ）

import { CartProvider } from "@/lib/cart-context";
import { BuyerHeader } from "@/components/buyer/BuyerHeader";
import { BuyerBottomNav } from "@/components/buyer/BuyerBottomNav";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <BuyerHeader />
        <main className="flex-1 pb-16 overflow-auto">{children}</main>
        <BuyerBottomNav />
      </div>
    </CartProvider>
  );
}
