"use client";

// components/admin/ProductForm.tsx
// 商品登録・編集フォーム（共通コンポーネント）

import { useState } from "react";
import Link from "next/link";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

type Props = {
  product?: Product;
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
  submitLabel: string;
};

export function ProductForm({ product, action, submitLabel }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // 成功時は Server Action 内で redirect() するため戻らない
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* 2カラムグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 商品名 */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            商品名 <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            defaultValue={product?.name ?? ""}
            required
            placeholder="例: Château Margaux 2018"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
          />
        </div>

        {/* 生産者 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            生産者
          </label>
          <input
            name="producer"
            type="text"
            defaultValue={product?.producer ?? ""}
            placeholder="例: Château Margaux"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
          />
        </div>

        {/* 産地 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            産地
          </label>
          <input
            name="region"
            type="text"
            defaultValue={product?.region ?? ""}
            placeholder="例: ボルドー / フランス"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
          />
        </div>

        {/* 品種 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            品種
          </label>
          <input
            name="grape_variety"
            type="text"
            defaultValue={product?.grape_variety ?? ""}
            placeholder="例: カベルネ・ソーヴィニヨン"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
          />
        </div>

        {/* ヴィンテージ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ヴィンテージ
          </label>
          <input
            name="vintage"
            type="number"
            defaultValue={product?.vintage ?? ""}
            placeholder="例: 2018"
            min={1900}
            max={new Date().getFullYear()}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
          />
        </div>

        {/* 価格 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            価格（税抜・円） <span className="text-red-500">*</span>
          </label>
          <input
            name="price"
            type="number"
            defaultValue={product?.price ?? ""}
            required
            min={0}
            step={1}
            placeholder="例: 3200"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
          />
        </div>

        {/* 在庫数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            在庫数
          </label>
          <input
            name="stock"
            type="number"
            defaultValue={product?.stock ?? 0}
            min={0}
            step={1}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
          />
        </div>

        {/* 画像URL */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            画像 URL
          </label>
          <input
            name="image_url"
            type="url"
            defaultValue={product?.image_url ?? ""}
            placeholder="https://..."
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B1A35]"
          />
        </div>

        {/* 販売状態 */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            販売状態
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="is_active"
                value="true"
                defaultChecked={product?.is_active !== false}
                className="accent-[#6B1A35]"
              />
              <span className="text-sm text-gray-700">販売中</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="is_active"
                value="false"
                defaultChecked={product?.is_active === false}
                className="accent-[#6B1A35]"
              />
              <span className="text-sm text-gray-700">非表示（在庫なし等）</span>
            </label>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/admin/products"
          className="px-6 py-2.5 text-sm font-medium border border-[#6B1A35] text-[#6B1A35] rounded-xl hover:bg-[#FDF4F6] transition-colors"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium bg-[#6B1A35] text-white rounded-xl hover:bg-[#9B2D50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "保存中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
