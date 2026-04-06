// app/(buyer)/buyer/orders/complete/page.tsx
// 発注完了ページ

import Link from "next/link";

type Props = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CompletePage({ searchParams }: Props) {
  const { orderId } = await searchParams;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 text-center">
      {/* 成功アイコン */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">✅</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        発注が完了しました！
      </h1>

      {orderId && (
        <p className="text-xs text-gray-400 font-mono mb-2">
          発注ID: {orderId.slice(0, 8).toUpperCase()}
        </p>
      )}

      <p className="text-sm text-gray-500 leading-relaxed mb-8">
        酒屋が確認次第、
        <br />
        準備を開始します。
      </p>

      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/buyer"
          className="block w-full text-center bg-[#6B1A35] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#9B2D50] transition-colors"
        >
          続けて発注する
        </Link>
        <Link
          href="/buyer/orders"
          className="block w-full text-center border border-[#6B1A35] text-[#6B1A35] font-medium py-3 px-6 rounded-xl hover:bg-[#FDF4F6] transition-colors"
        >
          発注履歴を確認
        </Link>
      </div>
    </div>
  );
}
