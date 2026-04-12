// app/(print)/layout.tsx
// 印刷専用レイアウト（ナビゲーション非表示）

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
