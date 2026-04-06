# デザインシステム - ワイン発注管理SaaS

作成日: 2026-04-02
担当: UI/UXデザイン

---

## 1. カラーパレット

### ブランドカラー（ボルドー系）

| 名前 | Tailwind クラス | HEX | 用途 |
|------|----------------|-----|------|
| Brand 900 | `bg-[#3B0A1E]` | #3B0A1E | ヘッダー・強調テキスト |
| Brand 700 | `bg-[#6B1A35]` | #6B1A35 | プライマリボタン・リンク |
| Brand 500 | `bg-[#9B2D50]` | #9B2D50 | ホバー・アクティブ状態 |
| Brand 200 | `bg-[#D4A0B0]` | #D4A0B0 | ライトアクセント・ボーダー |
| Brand 50  | `bg-[#FDF4F6]` | #FDF4F6 | 背景・カード |

### セカンダリカラー（ゴールド系）

| 名前 | Tailwind クラス | HEX | 用途 |
|------|----------------|-----|------|
| Gold 600 | `bg-[#B8860B]` | #B8860B | バッジ・ハイライト |
| Gold 400 | `bg-[#D4A820]` | #D4A820 | 星評価・特集マーク |
| Gold 100 | `bg-[#FBF3D5]` | #FBF3D5 | 通知背景 |

### グレースケール

| 名前 | Tailwind クラス | 用途 |
|------|----------------|------|
| Gray 900 | `text-gray-900` | 本文テキスト |
| Gray 600 | `text-gray-600` | サブテキスト・ラベル |
| Gray 400 | `text-gray-400` | プレースホルダー |
| Gray 200 | `bg-gray-200` | ボーダー・区切り線 |
| Gray 100 | `bg-gray-100` | セクション背景 |
| White    | `bg-white`     | カード・モーダル背景 |

### ステータスカラー

| 状態 | Tailwind クラス | 意味 |
|------|----------------|------|
| 受付中 | `bg-blue-100 text-blue-700` | 発注を受け付けた |
| 準備中 | `bg-yellow-100 text-yellow-700` | 酒屋が準備中 |
| 発送済 | `bg-green-100 text-green-700` | 発送完了 |
| キャンセル | `bg-red-100 text-red-700` | キャンセル済み |

---

## 2. タイポグラフィ

### フォントファミリー

```
本文（日本語）: "Noto Sans JP", sans-serif
数値・英字:     "Inter", sans-serif
```

Tailwind設定例（`tailwind.config.js`）:
```js
fontFamily: {
  sans: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
}
```

### フォントスケール

| 用途 | サイズ | ウェイト | Tailwind クラス |
|------|--------|----------|----------------|
| ページタイトル | 24px | Bold (700) | `text-2xl font-bold` |
| セクション見出し | 18px | SemiBold (600) | `text-lg font-semibold` |
| カード見出し | 16px | Medium (500) | `text-base font-medium` |
| 本文 | 14px | Regular (400) | `text-sm` |
| 補足テキスト | 12px | Regular (400) | `text-xs` |
| 価格表示 | 20px | Bold (700) | `text-xl font-bold` |
| ボタンテキスト | 16px | Medium (500) | `text-base font-medium` |

### 行間

- 本文: `leading-relaxed`（1.625）
- 見出し: `leading-tight`（1.25）

---

## 3. スペーシング

Tailwindのデフォルトスケールをベースとして使用。

| トークン | px | Tailwind | 用途 |
|----------|-----|----------|------|
| xs | 4px | `p-1` / `m-1` | アイコン内余白 |
| sm | 8px | `p-2` / `m-2` | コンパクト要素 |
| md | 16px | `p-4` / `m-4` | カード内余白 |
| lg | 24px | `p-6` / `m-6` | セクション間 |
| xl | 32px | `p-8` / `m-8` | ページ余白 |
| 2xl | 48px | `p-12` / `m-12` | 大きなセクション |

### レイアウト余白（スマホ）

- 画面左右パディング: `px-4`（16px）
- カード間ギャップ: `gap-3`（12px）
- セクション間マージン: `mb-6`（24px）

---

## 4. ブレークポイント

Tailwindデフォルトを使用。

| 名前 | 幅 | 主対象 |
|------|-----|--------|
| デフォルト | 〜639px | スマホ（飲食店スタッフ） |
| `sm:` | 640px〜 | 大きなスマホ・タブレット |
| `md:` | 768px〜 | タブレット |
| `lg:` | 1024px〜 | PC（管理者メイン） |
| `xl:` | 1280px〜 | ワイドPC |

---

## 5. 共通コンポーネント一覧

### Button

#### プライマリボタン（発注など主要アクション）
```
bg-[#6B1A35] text-white font-medium
px-6 py-3 rounded-xl
w-full（スマホ）/ w-auto（PC）
hover:bg-[#9B2D50] active:opacity-80
text-base
```

#### セカンダリボタン（キャンセル・戻るなど）
```
border border-[#6B1A35] text-[#6B1A35]
px-6 py-3 rounded-xl
bg-white hover:bg-[#FDF4F6]
```

#### デストラクティブボタン（削除）
```
bg-red-600 text-white
px-6 py-3 rounded-xl
hover:bg-red-700
```

#### 無効状態（共通）
```
opacity-50 cursor-not-allowed
```

---

### Input

#### テキスト入力
```
w-full border border-gray-200 rounded-lg
px-4 py-3 text-sm text-gray-900
placeholder:text-gray-400
focus:outline-none focus:ring-2 focus:ring-[#6B1A35]
```

#### 数量入力（カートで使用）
```
w-16 text-center border border-gray-200 rounded-lg
px-2 py-2 text-base font-medium
```

#### 検索入力
```
w-full border border-gray-200 rounded-full
pl-10 pr-4 py-3 text-sm
（左にアイコンあり）
```

---

### Card

#### 商品カード（スマホ）
```
bg-white rounded-2xl shadow-sm border border-gray-100
p-4 flex gap-3
```

#### 発注履歴カード
```
bg-white rounded-xl border border-gray-200
p-4
```

#### 管理者用発注カード
```
bg-white rounded-xl border border-gray-200
p-5 hover:shadow-md transition-shadow
```

---

### Badge（ステータス表示）

```
inline-flex items-center px-2.5 py-1
rounded-full text-xs font-medium
```

状態別クラス:
- 受付中: `bg-blue-100 text-blue-700`
- 準備中: `bg-yellow-100 text-yellow-700`
- 発送済: `bg-green-100 text-green-700`
- キャンセル: `bg-red-100 text-red-700`

---

### Navigation

#### スマホ（ボトムナビゲーション）
```
fixed bottom-0 left-0 right-0
bg-white border-t border-gray-200
flex justify-around items-center
h-16 px-4
safe-area-inset対応
```

タブ:
- 商品一覧（アイコン: 🍷）
- カート（アイコン: カートバッジあり）
- 発注履歴（アイコン: リスト）

#### PC管理者（サイドナビゲーション）
```
w-64 bg-[#3B0A1E] text-white
min-h-screen px-4 py-6
```

メニュー:
- 発注一覧（ダッシュボード）
- 商品管理
- ログアウト

---

### Toast / 通知

#### 成功
```
bg-green-50 border border-green-200 text-green-800
rounded-xl px-4 py-3
fixed top-4 left-4 right-4（スマホ）
```

#### エラー
```
bg-red-50 border border-red-200 text-red-800
rounded-xl px-4 py-3
```

---

### Empty State

```
flex flex-col items-center justify-center
py-16 text-gray-400
（アイコン + メッセージ + アクションボタン）
```

---

### Loading

- リストのスケルトン: `animate-pulse bg-gray-200 rounded`
- 全画面ローディング: ボルドー色のスピナー（`border-[#6B1A35]`）

---

## 6. アイコン

ライブラリ: `lucide-react`（Tailwind対応・軽量）

| 用途 | アイコン名 |
|------|-----------|
| カート | `ShoppingCart` |
| 商品 | `Wine` |
| 履歴 | `ClipboardList` |
| 検索 | `Search` |
| 追加 | `Plus` |
| 削除 | `Trash2` |
| 設定 | `Settings` |
| ログアウト | `LogOut` |
| 戻る | `ChevronLeft` |
| 展開 | `ChevronRight` |

サイズ: スマホ `w-5 h-5`、PC `w-4 h-4`

---

## 7. シャドウ・角丸

| 用途 | Tailwind クラス |
|------|----------------|
| カード（控えめ） | `shadow-sm` |
| カード（ホバー） | `shadow-md` |
| モーダル | `shadow-2xl` |
| 小コンポーネント | `shadow-none`〜`shadow-sm` |

| 用途 | Tailwind クラス |
|------|----------------|
| ボタン | `rounded-xl` |
| カード | `rounded-2xl` |
| 入力フィールド | `rounded-lg` |
| バッジ | `rounded-full` |
| 検索バー | `rounded-full` |
