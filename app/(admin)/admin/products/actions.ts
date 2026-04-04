// app/(admin)/admin/products/actions.ts
// 商品管理（CRUD）のサーバーアクション
// RLS により admin ロールのみ実行可能

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * 商品登録
 */
export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  // 認証・ロール確認（RLS に加えてサーバー側でも検証）
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "管理者権限が必要です。" };
  }

  const values = extractProductValues(formData);
  const error = await validateProductValues(values);
  if (error) return { error };

  const { error: dbError } = await supabase.from("products").insert({
    name: values.name,
    producer: values.producer || null,
    region: values.region || null,
    grape_variety: values.grape_variety || null,
    vintage: values.vintage,
    price: values.price!,
    stock: values.stock,
    image_url: values.image_url || null,
    is_active: values.is_active,
  });

  if (dbError) {
    return { error: `登録失敗: ` };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

/**
 * 商品更新
 */
export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "管理者権限が必要です。" };
  }

  const values = extractProductValues(formData);
  const error = await validateProductValues(values);
  if (error) return { error };

  const { error: dbError } = await supabase
    .from("products")
    .update({
      name: values.name,
      producer: values.producer || null,
      region: values.region || null,
      grape_variety: values.grape_variety || null,
      vintage: values.vintage,
      price: values.price!,
      stock: values.stock,
      image_url: values.image_url || null,
      is_active: values.is_active,
      country: values.country || null,
      comment: values.comment || null,
      accept_days: values.accept_days || null,
    })
    .eq("id", id);

  if (dbError) {
    return { error: "商品の更新に失敗しました。" };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

/**
 * 商品削除
 */
export async function deleteProduct(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "管理者権限が必要です。" };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: "商品の削除に失敗しました。" };
  }

  revalidatePath("/admin/products");
}

// ──────────────────────────────────────────────
// 内部ユーティリティ
// ──────────────────────────────────────────────

type ProductValues = {
  name: string;
  producer: string;
  region: string;
  grape_variety: string;
  vintage: number | null;
  price: number | null;
  stock: number;
  image_url: string;
  is_active: boolean;
  country: string;
  comment: string;
  accept_days: number | null;
};

function extractProductValues(formData: FormData): ProductValues {
  const vintageRaw = formData.get("vintage") as string;
  const priceRaw = formData.get("price") as string;
  const stockRaw = formData.get("stock") as string;

  return {
    name: (formData.get("name") as string).trim(),
    producer: (formData.get("producer") as string).trim(),
    region: (formData.get("region") as string).trim(),
    country: (formData.get("country") as string).trim(),
    comment: (formData.get("comment") as string).trim(),
    accept_days: formData.get("accept_days") ? parseInt(formData.get("accept_days") as string, 10) : null,
    grape_variety: (formData.get("grape_variety") as string).trim(),
    vintage: vintageRaw ? parseInt(vintageRaw, 10) : null,
    price: priceRaw ? parseFloat(priceRaw) : null,
    stock: stockRaw ? parseInt(stockRaw, 10) : 0,
    image_url: (formData.get("image_url") as string).trim(),
    is_active: formData.get("is_active") === "true",
  };
}

async function validateProductValues(values: ProductValues): Promise<string | null> {
  if (!values.name) return "商品名は必須です。";
  if (values.price === null || isNaN(values.price) || values.price < 0) {
    return "価格は0以上の数値で入力してください。";
  }
  if (isNaN(values.stock) || values.stock < 0) {
    return "在庫数は0以上の整数で入力してください。";
  }
  return null;
}
