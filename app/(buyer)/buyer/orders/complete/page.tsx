// app/(buyer)/buyer/orders/complete/page.tsx
// 発注完了ページ

import Link from "next/link";

type Props = {
  searchParams: Promise<{
    orderId?: string;
    normal?: string;
    allocation?: string;
  }>;
};

export default async function CompletePage({ searchParams }: Props) {
  const params = await searchParams;
  // 旧リンク互換：orderId 単体もサポート
  const normalOrderId = params.normal ?? params.orderId ?? null;
  const allocationOrderId = params.allocation ?? null;
  const hasBoth = !!normalOrderId && !!allocationOrderId;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-10 text-center">
      {/* 成功アイコン */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">✅</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        発注が完了しました！
      </h1>

      <p className="text-sm text-gray-500 leading-relaxed mb-6">
        {hasBoth
          ? "通常注文と割り当て注文の2件が作成されました。"
          : allocationOrderId
            ? "割り当て注文を受け付けました。"
            : "酒屋が確認次第、準備を開始します。"}
      </p>

      {/* 注文番号カード */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        {normalOrderId && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 text-left">
            <p className="text-xs text-gray-500 mb-1">通常注文</p>
            <p className="font-mono text-sm text-gray-900">
              #{normalOrderId.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              酒屋が確認次第、準備を開始します
            </p>
          </div>
        )}
        {allocationOrderId && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-left">
            <p className="text-xs text-amber-700 mb-1">割り当て注文</p>
            <p className="font-mono text-sm text-amber-900">
              #{allocationOrderId.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              受付締切後にお店から割り当て本数をご連絡します。
              <span className="font-semibold">キャンセルはできません。</span>
            </p>
          </div>
        )}
      </div>

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
