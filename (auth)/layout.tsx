// app/(auth)/layout.tsx
// 認証ページ共通レイアウト

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
