// components/admin/InvoiceEditor.tsx
// 請求書の明細・備考を編集するフォーム（admin用）

"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateInvoiceAction } from "@/app/(admin)/admin/invoices/actions";

type Item = {
  product_name: string;
  producer: string | null;
  region: string | null;
  quantity: number;
  unit_price: number;
};

type Props = {
  invoiceId: string;
  initialItems: Item[];
  initialNote: string | null;
};

export function InvoiceEditor({ invoiceId, initialItems, initialNote }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [note, setNote] = useState<string>(initialNote ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0),
    [items]
  );

  const updateItem = (index: number, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_name: "",
        producer: null,
        region: null,
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const handleSave = () => {
    // 必須項目のバリデーション
    for (const item of items) {
      if (!item.product_name.trim()) {
        setMessage("商品名が空の明細があります");
        return;
      }
      if (item.quantity <= 0) {
        setMessage("数量は1以上を指定してください");
        return;
      }
      if (item.unit_price < 0) {
        setMessage("単価は0以上を指定してください");
        return;
      }
    }

    startTransition(async () => {
      setMessage(null);
      const result = await updateInvoiceAction(invoiceId, {
        note: note.trim() ? note.trim() : null,
        items,
      });
      if (result.ok) {
        setMessage("保存しました");
      } else {
        setMessage(`エラー：${result.error ?? "unknown"}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 明細テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">明細</h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-xs text-[#6B1A35] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            行を追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 w-[35%]">
                  商品名
                </th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 w-[25%]">
                  生産者 / 産地
                </th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 w-[15%]">
                  単価
                </th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 w-[10%]">
                  数量
                </th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 w-[12%]">
                  小計
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => {
                const subtotal = item.quantity * item.unit_price;
                return (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) =>
                          updateItem(index, { product_name: e.target.value })
                        }
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#6B1A35]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="生産者"
                          value={item.producer ?? ""}
                          onChange={(e) =>
                            updateItem(index, {
                              producer: e.target.value || null,
                            })
                          }
                          className="w-1/2 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#6B1A35]"
                        />
                        <input
                          type="text"
                          placeholder="産地"
                          value={item.region ?? ""}
                          onChange={(e) =>
                            updateItem(index, {
                              region: e.target.value || null,
                            })
                          }
                          className="w-1/2 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#6B1A35]"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, {
                            unit_price: Number(e.target.value),
                          })
                        }
                        className="w-full text-sm text-right border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#6B1A35]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, {
                            quantity: Number(e.target.value),
                          })
                        }
                        className="w-full text-sm text-right border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#6B1A35]"
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      ¥{subtotal.toLocaleString()}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-600"
                        aria-label="この明細を削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    明細がありません。「行を追加」から追加してください。
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  合計
                </td>
                <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                  ¥{total.toLocaleString()}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 備考 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          備考
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="請求書に記載する備考（任意）"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6B1A35]"
        />
      </div>

      {/* 保存 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="bg-[#6B1A35] text-white px-6 py-2 rounded-lg text-sm hover:bg-[#5a1630] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "保存中..." : "変更を保存"}
        </button>
        {message && (
          <span
            className={`text-sm ${
              message.startsWith("エラー") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
