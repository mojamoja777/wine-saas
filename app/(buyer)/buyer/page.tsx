// app/(buyer)/buyer/page.tsx
// 発注者 - 商品一覧ページ

import { createClient } from "@/lib/supabase/server";
import { ProductList } from "@/components/buyer/ProductList";

export default async function BuyerPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return <ProductList products={products ?? []} />;
}
